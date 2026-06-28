from datetime import datetime, timedelta, timezone, date as date_type
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from apscheduler.schedulers.background import BackgroundScheduler
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
import os
load_dotenv()

import random
import string
import bcrypt
import json
import requests as http_requests

RAPIDAPI_KEY = os.environ.get('RAPIDAPI_KEY', '36662c0ead7a36cbec1d955caedd213e')
print(f"RAPIDAPI_KEY loaded: {RAPIDAPI_KEY[:8] if RAPIDAPI_KEY else 'NONE'}")
SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')

app = Flask(__name__)
CORS(app, origins='*')

database_url = os.environ.get('DATABASE_URL', 'sqlite:///worldcup.db')
if database_url.startswith('postgres://'):
    database_url = database_url.replace('postgres://', 'postgresql://', 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)

limiter = Limiter(app=app, key_func=get_remote_address, default_limits=[])

db = SQLAlchemy(app)
jwt = JWTManager(app)

POINTS = {
    'group_exact': 5, 'group_3rd': 5, 'group_4th': 5,
    'r32': 6, 'r16': 12, 'quarter': 18, 'semi': 24,
    'third_place': 27, 'final': 30, 'golden_ball': 15,
    'silver_ball': 10, 'bronze_ball': 5,
    'award_first': 12, 'award_second': 8, 'award_third': 4,
    # Second chance points (halved)
    'sc_r32': 3, 'sc_r16': 6, 'sc_quarter': 9, 'sc_semi': 12,
    'sc_third_place': 13, 'sc_final': 15,
}

GROUPS = {
    'A': ['Mexico', 'South Korea', 'South Africa', 'Czech Republic'],
    'B': ['Canada', 'Switzerland', 'Qatar', 'Bosnia'],
    'C': ['Brazil', 'Scotland', 'Morocco', 'Haiti'],
    'D': ['USA', 'Australia', 'Paraguay', 'Turkey'],
    'E': ['Germany', 'Ecuador', 'Ivory Coast', 'Curacao'],
    'F': ['Netherlands', 'Japan', 'Sweden', 'Tunisia'],
    'G': ['Belgium', 'New Zealand', 'Egypt', 'Iran'],
    'H': ['Spain', 'Uruguay', 'Saudi Arabia', 'Cape Verde'],
    'I': ['France', 'Norway', 'Senegal', 'Iraq'],
    'J': ['Argentina', 'Austria', 'Jordan', 'Algeria'],
    'K': ['Portugal', 'Colombia', 'Uzbekistan', 'DR Congo'],
    'L': ['England', 'Croatia', 'Ghana', 'Panama'],
}

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    points = db.Column(db.Integer, default=0)
    is_verified = db.Column(db.Boolean, default=False)
    email_notifications = db.Column(db.Boolean, default=True)

class Prediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    group_predictions = db.Column(db.Text, default='{}')
    r32_predictions = db.Column(db.Text, default='{}')
    r16_predictions = db.Column(db.Text, default='{}')
    quarter_predictions = db.Column(db.Text, default='{}')
    semi_predictions = db.Column(db.Text, default='{}')
    third_place_prediction = db.Column(db.String(100), default='')
    third_place_advancing = db.Column(db.Text, default='[]')
    third_assignments = db.Column(db.Text, default='{}')
    knockout_predictions = db.Column(db.Text, default='{}')
    final_prediction = db.Column(db.String(100), default='')
    golden_ball = db.Column(db.String(100), default='')
    silver_ball = db.Column(db.String(100), default='')
    bronze_ball = db.Column(db.String(100), default='')
    golden_boot = db.Column(db.Text, default='[]')
    golden_glove = db.Column(db.Text, default='[]')
    u21_award = db.Column(db.Text, default='[]')
    total_points = db.Column(db.Integer, default=0)

class SecondChancePrediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, unique=True)
    knockout_predictions = db.Column(db.Text, default='{}')
    locked = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    total_points = db.Column(db.Integer, default=0)

class League(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    invite_code = db.Column(db.String(8), unique=True, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class LeagueMember(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    league_id = db.Column(db.Integer, db.ForeignKey('league.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

class MatchPrediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    match_id = db.Column(db.Integer, nullable=False)
    home_score = db.Column(db.Integer, nullable=False)
    away_score = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    points_awarded = db.Column(db.Integer, default=0)
    scored = db.Column(db.Boolean, default=False)

class VerificationCode(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False)
    code = db.Column(db.String(6), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_used = db.Column(db.Boolean, default=False)
    pending_username = db.Column(db.String(80), nullable=True)
    pending_password = db.Column(db.String(200), nullable=True)

class ScoredMatch(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    match_identifier = db.Column(db.String(100), unique=True, nullable=False)
    scored_at = db.Column(db.DateTime, default=datetime.utcnow)

class GroupStanding(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    group = db.Column(db.String(2), nullable=False)
    team = db.Column(db.String(100), nullable=False)
    played = db.Column(db.Integer, default=0)
    won = db.Column(db.Integer, default=0)
    drawn = db.Column(db.Integer, default=0)
    lost = db.Column(db.Integer, default=0)
    gf = db.Column(db.Integer, default=0)
    ga = db.Column(db.Integer, default=0)
    points = db.Column(db.Integer, default=0)
    yellow_cards = db.Column(db.Integer, default=0)
    red_cards = db.Column(db.Integer, default=0)

class MatchResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    match_id = db.Column(db.Integer, unique=True, nullable=False)
    home_score = db.Column(db.Integer)
    away_score = db.Column(db.Integer)
    status = db.Column(db.String(10), default='NS')

class TeamQualification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    team = db.Column(db.String(100), unique=True, nullable=False)
    group = db.Column(db.String(2), nullable=False)
    status = db.Column(db.String(20), default='tbd')
    message = db.Column(db.String(300), default='')
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

SCHEDULE = [
  # ── GROUP STAGE ──
  { 'id': 1,  'home': 'Mexico',        'away': 'South Africa',   'kickoff_utc': '2026-06-11T19:00:00Z', 'venue': 'Estadio Azteca, Mexico City',              'group': 'A', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 2,  'home': 'South Korea',   'away': 'Czech Republic', 'kickoff_utc': '2026-06-12T02:00:00Z', 'venue': 'Estadio Akron, Guadalajara',               'group': 'A', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 3,  'home': 'Canada',        'away': 'Bosnia',         'kickoff_utc': '2026-06-12T19:00:00Z', 'venue': 'BMO Field, Toronto',                       'group': 'B', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 4,  'home': 'USA',           'away': 'Paraguay',       'kickoff_utc': '2026-06-13T01:00:00Z', 'venue': 'SoFi Stadium, Los Angeles',                'group': 'D', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 5,  'home': 'Haiti',         'away': 'Scotland',       'kickoff_utc': '2026-06-14T01:00:00Z', 'venue': 'Gillette Stadium, Boston',                 'group': 'C', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 6,  'home': 'Australia',     'away': 'Turkey',         'kickoff_utc': '2026-06-14T04:00:00Z', 'venue': 'BC Place, Vancouver',                      'group': 'D', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 7,  'home': 'Brazil',        'away': 'Morocco',        'kickoff_utc': '2026-06-13T22:00:00Z', 'venue': 'MetLife Stadium, New York',                'group': 'C', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 8,  'home': 'Qatar',         'away': 'Switzerland',    'kickoff_utc': '2026-06-13T19:00:00Z', 'venue': "Levi's Stadium, San Francisco Bay Area",   'group': 'B', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 9,  'home': 'Ivory Coast',   'away': 'Ecuador',        'kickoff_utc': '2026-06-14T23:00:00Z', 'venue': 'Lincoln Financial Field, Philadelphia',    'group': 'E', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 10, 'home': 'Germany',       'away': 'Curacao',        'kickoff_utc': '2026-06-14T17:00:00Z', 'venue': 'NRG Stadium, Houston',                     'group': 'E', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 11, 'home': 'Netherlands',   'away': 'Japan',          'kickoff_utc': '2026-06-14T20:00:00Z', 'venue': 'AT&T Stadium, Dallas',                     'group': 'F', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 12, 'home': 'Sweden',        'away': 'Tunisia',        'kickoff_utc': '2026-06-15T02:00:00Z', 'venue': 'Estadio BBVA, Monterrey',                  'group': 'F', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 13, 'home': 'Spain',         'away': 'Cape Verde',     'kickoff_utc': '2026-06-15T16:00:00Z', 'venue': 'Mercedes-Benz Stadium, Atlanta',           'group': 'H', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 14, 'home': 'Belgium',       'away': 'Egypt',          'kickoff_utc': '2026-06-15T19:00:00Z', 'venue': 'Lumen Field, Seattle',                     'group': 'G', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 15, 'home': 'Saudi Arabia',  'away': 'Uruguay',        'kickoff_utc': '2026-06-15T22:00:00Z', 'venue': 'Hard Rock Stadium, Miami',                 'group': 'H', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 16, 'home': 'Iran',          'away': 'New Zealand',    'kickoff_utc': '2026-06-16T01:00:00Z', 'venue': 'SoFi Stadium, Los Angeles',                'group': 'G', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 17, 'home': 'France',        'away': 'Senegal',        'kickoff_utc': '2026-06-16T19:00:00Z', 'venue': 'MetLife Stadium, New York',                'group': 'I', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 18, 'home': 'Iraq',          'away': 'Norway',         'kickoff_utc': '2026-06-16T22:00:00Z', 'venue': 'Gillette Stadium, Boston',                 'group': 'I', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 19, 'home': 'Argentina',     'away': 'Algeria',        'kickoff_utc': '2026-06-17T01:00:00Z', 'venue': 'Arrowhead Stadium, Kansas City',           'group': 'J', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 20, 'home': 'Austria',       'away': 'Jordan',         'kickoff_utc': '2026-06-17T04:00:00Z', 'venue': "Levi's Stadium, San Francisco Bay Area",   'group': 'J', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 21, 'home': 'Portugal',      'away': 'DR Congo',       'kickoff_utc': '2026-06-17T17:00:00Z', 'venue': 'NRG Stadium, Houston',                     'group': 'K', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 22, 'home': 'England',       'away': 'Croatia',        'kickoff_utc': '2026-06-17T20:00:00Z', 'venue': 'AT&T Stadium, Dallas',                     'group': 'L', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 23, 'home': 'Ghana',         'away': 'Panama',         'kickoff_utc': '2026-06-17T23:00:00Z', 'venue': 'BMO Field, Toronto',                       'group': 'L', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 24, 'home': 'Uzbekistan',    'away': 'Colombia',       'kickoff_utc': '2026-06-18T02:00:00Z', 'venue': 'Estadio Azteca, Mexico City',              'group': 'K', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 25, 'home': 'Czech Republic','away': 'South Africa',   'kickoff_utc': '2026-06-18T16:00:00Z', 'venue': 'Mercedes-Benz Stadium, Atlanta',           'group': 'A', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 26, 'home': 'Switzerland',   'away': 'Bosnia',         'kickoff_utc': '2026-06-18T19:00:00Z', 'venue': 'SoFi Stadium, Los Angeles',                'group': 'B', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 27, 'home': 'Canada',        'away': 'Qatar',          'kickoff_utc': '2026-06-18T22:00:00Z', 'venue': 'BC Place, Vancouver',                      'group': 'B', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 28, 'home': 'Mexico',        'away': 'South Korea',    'kickoff_utc': '2026-06-19T01:00:00Z', 'venue': 'Estadio Akron, Guadalajara',               'group': 'A', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 29, 'home': 'Scotland',      'away': 'Morocco',        'kickoff_utc': '2026-06-19T22:00:00Z', 'venue': 'Gillette Stadium, Boston',                 'group': 'C', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 30, 'home': 'USA',           'away': 'Australia',      'kickoff_utc': '2026-06-19T19:00:00Z', 'venue': 'Lumen Field, Seattle',                     'group': 'D', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 31, 'home': 'Brazil',        'away': 'Haiti',          'kickoff_utc': '2026-06-20T00:30:00Z', 'venue': 'Lincoln Financial Field, Philadelphia',    'group': 'C', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 32, 'home': 'Turkey',        'away': 'Paraguay',       'kickoff_utc': '2026-06-20T03:00:00Z', 'venue': "Levi's Stadium, San Francisco Bay Area",   'group': 'D', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 33, 'home': 'Germany',       'away': 'Ivory Coast',    'kickoff_utc': '2026-06-20T20:00:00Z', 'venue': 'BMO Field, Toronto',                       'group': 'E', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 34, 'home': 'Ecuador',       'away': 'Curacao',        'kickoff_utc': '2026-06-21T00:00:00Z', 'venue': 'Arrowhead Stadium, Kansas City',           'group': 'E', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 35, 'home': 'Netherlands',   'away': 'Sweden',         'kickoff_utc': '2026-06-20T17:00:00Z', 'venue': 'NRG Stadium, Houston',                     'group': 'F', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 36, 'home': 'Tunisia',       'away': 'Japan',          'kickoff_utc': '2026-06-21T04:00:00Z', 'venue': 'Estadio BBVA, Monterrey',                  'group': 'F', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 37, 'home': 'Spain',         'away': 'Saudi Arabia',   'kickoff_utc': '2026-06-21T16:00:00Z', 'venue': 'Mercedes-Benz Stadium, Atlanta',           'group': 'H', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 38, 'home': 'Belgium',       'away': 'Iran',           'kickoff_utc': '2026-06-21T19:00:00Z', 'venue': 'SoFi Stadium, Los Angeles',                'group': 'G', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 39, 'home': 'Uruguay',       'away': 'Cape Verde',     'kickoff_utc': '2026-06-21T22:00:00Z', 'venue': 'Hard Rock Stadium, Miami',                 'group': 'H', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 40, 'home': 'New Zealand',   'away': 'Egypt',          'kickoff_utc': '2026-06-22T01:00:00Z', 'venue': 'BC Place, Vancouver',                      'group': 'G', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 41, 'home': 'Argentina',     'away': 'Austria',        'kickoff_utc': '2026-06-22T17:00:00Z', 'venue': 'AT&T Stadium, Dallas',                     'group': 'J', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 42, 'home': 'France',        'away': 'Iraq',           'kickoff_utc': '2026-06-22T21:00:00Z', 'venue': 'Lincoln Financial Field, Philadelphia',    'group': 'I', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 43, 'home': 'Norway',        'away': 'Senegal',        'kickoff_utc': '2026-06-23T00:00:00Z', 'venue': 'MetLife Stadium, New York',                'group': 'I', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 44, 'home': 'Jordan',        'away': 'Algeria',        'kickoff_utc': '2026-06-23T03:00:00Z', 'venue': "Levi's Stadium, San Francisco Bay Area",   'group': 'J', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 45, 'home': 'England',       'away': 'Ghana',          'kickoff_utc': '2026-06-23T20:00:00Z', 'venue': 'Gillette Stadium, Boston',                 'group': 'L', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 46, 'home': 'Panama',        'away': 'Croatia',        'kickoff_utc': '2026-06-23T23:00:00Z', 'venue': 'BMO Field, Toronto',                       'group': 'L', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 47, 'home': 'Portugal',      'away': 'Uzbekistan',     'kickoff_utc': '2026-06-23T17:00:00Z', 'venue': 'NRG Stadium, Houston',                     'group': 'K', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 48, 'home': 'Colombia',      'away': 'DR Congo',       'kickoff_utc': '2026-06-24T02:00:00Z', 'venue': 'Estadio Akron, Guadalajara',               'group': 'K', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 49, 'home': 'Scotland',      'away': 'Brazil',         'kickoff_utc': '2026-06-24T22:00:00Z', 'venue': 'Hard Rock Stadium, Miami',                 'group': 'C', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 50, 'home': 'Morocco',       'away': 'Haiti',          'kickoff_utc': '2026-06-24T22:00:00Z', 'venue': 'Mercedes-Benz Stadium, Atlanta',           'group': 'C', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 51, 'home': 'Switzerland',   'away': 'Canada',         'kickoff_utc': '2026-06-24T19:00:00Z', 'venue': 'BC Place, Vancouver',                      'group': 'B', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 52, 'home': 'Bosnia',        'away': 'Qatar',          'kickoff_utc': '2026-06-24T19:00:00Z', 'venue': 'Lumen Field, Seattle',                     'group': 'B', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 53, 'home': 'Czech Republic','away': 'Mexico',         'kickoff_utc': '2026-06-25T01:00:00Z', 'venue': 'Estadio Azteca, Mexico City',              'group': 'A', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 54, 'home': 'South Africa',  'away': 'South Korea',    'kickoff_utc': '2026-06-25T01:00:00Z', 'venue': 'Estadio BBVA, Monterrey',                  'group': 'A', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 55, 'home': 'Curacao',       'away': 'Ivory Coast',    'kickoff_utc': '2026-06-25T20:00:00Z', 'venue': 'Lincoln Financial Field, Philadelphia',    'group': 'E', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 56, 'home': 'Ecuador',       'away': 'Germany',        'kickoff_utc': '2026-06-25T20:00:00Z', 'venue': 'MetLife Stadium, New York',                'group': 'E', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 57, 'home': 'Japan',         'away': 'Sweden',         'kickoff_utc': '2026-06-25T23:00:00Z', 'venue': 'AT&T Stadium, Dallas',                     'group': 'F', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 58, 'home': 'Tunisia',       'away': 'Netherlands',    'kickoff_utc': '2026-06-25T23:00:00Z', 'venue': 'Arrowhead Stadium, Kansas City',           'group': 'F', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 59, 'home': 'Turkey',        'away': 'USA',            'kickoff_utc': '2026-06-26T02:00:00Z', 'venue': 'SoFi Stadium, Los Angeles',                'group': 'D', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 60, 'home': 'Paraguay',      'away': 'Australia',      'kickoff_utc': '2026-06-26T02:00:00Z', 'venue': "Levi's Stadium, San Francisco Bay Area",   'group': 'D', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 61, 'home': 'Norway',        'away': 'France',         'kickoff_utc': '2026-06-26T19:00:00Z', 'venue': 'Gillette Stadium, Boston',                 'group': 'I', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 62, 'home': 'Senegal',       'away': 'Iraq',           'kickoff_utc': '2026-06-26T19:00:00Z', 'venue': 'BMO Field, Toronto',                       'group': 'I', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 63, 'home': 'Egypt',         'away': 'Iran',           'kickoff_utc': '2026-06-27T03:00:00Z', 'venue': 'Lumen Field, Seattle',                     'group': 'G', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 64, 'home': 'New Zealand',   'away': 'Belgium',        'kickoff_utc': '2026-06-27T03:00:00Z', 'venue': 'BC Place, Vancouver',                      'group': 'G', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 65, 'home': 'Cape Verde',    'away': 'Saudi Arabia',   'kickoff_utc': '2026-06-27T00:00:00Z', 'venue': 'NRG Stadium, Houston',                     'group': 'H', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 66, 'home': 'Uruguay',       'away': 'Spain',          'kickoff_utc': '2026-06-27T00:00:00Z', 'venue': 'Estadio Akron, Guadalajara',               'group': 'H', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 67, 'home': 'Panama',        'away': 'England',        'kickoff_utc': '2026-06-27T21:00:00Z', 'venue': 'MetLife Stadium, New York',                'group': 'L', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 68, 'home': 'Croatia',       'away': 'Ghana',          'kickoff_utc': '2026-06-27T21:00:00Z', 'venue': 'Lincoln Financial Field, Philadelphia',    'group': 'L', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 69, 'home': 'Algeria',       'away': 'Austria',        'kickoff_utc': '2026-06-28T02:00:00Z', 'venue': 'Arrowhead Stadium, Kansas City',           'group': 'J', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 70, 'home': 'Jordan',        'away': 'Argentina',      'kickoff_utc': '2026-06-28T02:00:00Z', 'venue': 'AT&T Stadium, Dallas',                     'group': 'J', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 71, 'home': 'Colombia',      'away': 'Portugal',       'kickoff_utc': '2026-06-27T23:30:00Z', 'venue': 'Hard Rock Stadium, Miami',                 'group': 'K', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 72, 'home': 'DR Congo',      'away': 'Uzbekistan',     'kickoff_utc': '2026-06-27T23:30:00Z', 'venue': 'Mercedes-Benz Stadium, Atlanta',           'group': 'K', 'round': 'Group Stage', 'status': 'NS', 'home_score': None, 'away_score': None },

  # ── ROUND OF 32 ──
  { 'id': 73,  'home': 'South Africa', 'away': 'Canada',              'kickoff_utc': '2026-06-28T19:00:00Z', 'venue': 'SoFi Stadium, Los Angeles',              'group': 'R32', 'round': 'Round of 32', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 74,  'home': 'Brazil',       'away': 'Japan',               'kickoff_utc': '2026-06-29T17:00:00Z', 'venue': 'NRG Stadium, Houston',                   'group': 'R32', 'round': 'Round of 32', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 75,  'home': 'Germany',      'away': 'Paraguay',            'kickoff_utc': '2026-06-29T20:30:00Z', 'venue': 'Gillette Stadium, Boston',               'group': 'R32', 'round': 'Round of 32', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 76,  'home': 'Netherlands',  'away': 'Morocco',             'kickoff_utc': '2026-06-30T01:00:00Z', 'venue': 'Estadio BBVA, Monterrey',                'group': 'R32', 'round': 'Round of 32', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 77,  'home': 'Ivory Coast',  'away': 'Norway',              'kickoff_utc': '2026-06-30T17:00:00Z', 'venue': 'AT&T Stadium, Dallas',                   'group': 'R32', 'round': 'Round of 32', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 78,  'home': 'France',       'away': 'Sweden',              'kickoff_utc': '2026-06-30T21:00:00Z', 'venue': 'MetLife Stadium, New York',               'group': 'R32', 'round': 'Round of 32', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 79,  'home': 'Mexico',       'away': 'Ecuador',             'kickoff_utc': '2026-07-01T01:00:00Z', 'venue': 'Estadio Azteca, Mexico City',             'group': 'R32', 'round': 'Round of 32', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 80,  'home': 'England',      'away': 'DR Congo',            'kickoff_utc': '2026-07-01T16:00:00Z', 'venue': 'Mercedes-Benz Stadium, Atlanta',          'group': 'R32', 'round': 'Round of 32', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 81,  'home': 'Belgium',      'away': 'Senegal',             'kickoff_utc': '2026-07-01T20:00:00Z', 'venue': 'Lumen Field, Seattle',                   'group': 'R32', 'round': 'Round of 32', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 82,  'home': 'USA',          'away': 'Bosnia & Herzegovina','kickoff_utc': '2026-07-02T00:00:00Z', 'venue': "Levi's Stadium, Santa Clara",             'group': 'R32', 'round': 'Round of 32', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 83,  'home': 'Spain',        'away': 'Austria',             'kickoff_utc': '2026-07-02T19:00:00Z', 'venue': 'SoFi Stadium, Los Angeles',               'group': 'R32', 'round': 'Round of 32', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 84,  'home': 'Portugal',     'away': 'Croatia',             'kickoff_utc': '2026-07-02T23:00:00Z', 'venue': 'BMO Field, Toronto',                     'group': 'R32', 'round': 'Round of 32', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 85,  'home': 'Switzerland',  'away': 'Algeria',             'kickoff_utc': '2026-07-03T03:00:00Z', 'venue': 'BC Place, Vancouver',                    'group': 'R32', 'round': 'Round of 32', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 86,  'home': 'Australia',    'away': 'Egypt',               'kickoff_utc': '2026-07-03T18:00:00Z', 'venue': 'AT&T Stadium, Dallas',                   'group': 'R32', 'round': 'Round of 32', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 87,  'home': 'Argentina',    'away': 'Cape Verde',          'kickoff_utc': '2026-07-03T22:00:00Z', 'venue': 'Hard Rock Stadium, Miami',                'group': 'R32', 'round': 'Round of 32', 'status': 'NS', 'home_score': None, 'away_score': None },
  { 'id': 88,  'home': 'Colombia',     'away': 'Ghana',               'kickoff_utc': '2026-07-04T01:30:00Z', 'venue': 'Arrowhead Stadium, Kansas City',          'group': 'R32', 'round': 'Round of 32', 'status': 'NS', 'home_score': None, 'away_score': None },
]

# Official confirmed R32 matchups for Second Chance bracket
R32_MATCHUPS = [
  { 'id': 'sc_73',  'match': 73,  'team1': 'South Africa',      'team2': 'Canada' },
  { 'id': 'sc_74',  'match': 74,  'team1': 'Brazil',            'team2': 'Japan' },
  { 'id': 'sc_75',  'match': 75,  'team1': 'Germany',           'team2': 'Paraguay' },
  { 'id': 'sc_76',  'match': 76,  'team1': 'Netherlands',       'team2': 'Morocco' },
  { 'id': 'sc_77',  'match': 77,  'team1': 'Ivory Coast',       'team2': 'Norway' },
  { 'id': 'sc_78',  'match': 78,  'team1': 'France',            'team2': 'Sweden' },
  { 'id': 'sc_79',  'match': 79,  'team1': 'Mexico',            'team2': 'Ecuador' },
  { 'id': 'sc_80',  'match': 80,  'team1': 'England',           'team2': 'DR Congo' },
  { 'id': 'sc_81',  'match': 81,  'team1': 'Belgium',           'team2': 'Senegal' },
  { 'id': 'sc_82',  'match': 82,  'team1': 'USA',               'team2': 'Bosnia & Herzegovina' },
  { 'id': 'sc_83',  'match': 83,  'team1': 'Spain',             'team2': 'Austria' },
  { 'id': 'sc_84',  'match': 84,  'team1': 'Portugal',          'team2': 'Croatia' },
  { 'id': 'sc_85',  'match': 85,  'team1': 'Switzerland',       'team2': 'Algeria' },
  { 'id': 'sc_86',  'match': 86,  'team1': 'Australia',         'team2': 'Egypt' },
  { 'id': 'sc_87',  'match': 87,  'team1': 'Argentina',         'team2': 'Cape Verde' },
  { 'id': 'sc_88',  'match': 88,  'team1': 'Colombia',          'team2': 'Ghana' },
]

def send_match_reminders():
    with app.app_context():
        try:
            now_utc = datetime.utcnow()
            reminder_window_start = now_utc + timedelta(minutes=59)
            reminder_window_end = now_utc + timedelta(minutes=61)
            first_locking = next((
                m for m in sorted(SCHEDULE, key=lambda x: parse_kickoff(x))
                if reminder_window_start <= parse_kickoff(m) <= reminder_window_end
            ), None)
            if not first_locking:
                return
            ko_date = parse_kickoff(first_locking).strftime('%Y-%m-%d')
            earlier_matches = [
                m for m in SCHEDULE
                if parse_kickoff(m).strftime('%Y-%m-%d') == ko_date
                and parse_kickoff(m) < parse_kickoff(first_locking)
            ]
            if earlier_matches:
                return
            saved_user_ids = set(p.user_id for p in MatchPrediction.query.filter_by(match_id=first_locking['id']).all())
            users = User.query.filter_by(email_notifications=True, is_verified=True).all()
            users_to_notify = [u for u in users if u.id not in saved_user_ids]
            if not users_to_notify:
                return
            today_matches = [m for m in SCHEDULE if parse_kickoff(m).strftime('%Y-%m-%d') == ko_date]
            for user in users_to_notify:
                try:
                    from sendgrid import SendGridAPIClient
                    from sendgrid.helpers.mail import Mail as SGMail
                    sg = SendGridAPIClient(SENDGRID_API_KEY)
                    sg.send(SGMail(
                        from_email='noreply@wc2026app.xyz',
                        to_emails=user.email,
                        subject=f'⏰ Match picks closing in 1 hour — {len(today_matches)} matches today!',
                        html_content=f'''
                        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #080d1a; color: white; padding: 40px; border-radius: 16px;">
                            <h1 style="color: #f1f5f9; text-align: center; margin-bottom: 6px;">⏰ Picks Closing Soon!</h1>
                            <p style="color: #64748b; text-align: center; margin-bottom: 24px;">The first match of the day kicks off in 1 hour — make your picks before they lock!</p>
                            <div style="background: #0d1526; border-radius: 12px; padding: 24px; text-align: center; border: 1px solid rgba(59,130,246,0.2); border-top: 3px solid #3b82f6;">
                                <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px;">First match today</p>
                                <h2 style="color: #f1f5f9; font-size: 22px; margin: 0 0 8px; font-weight: 900;">{first_locking["home"]} vs {first_locking["away"]}</h2>
                                <p style="color: #ef4444; font-weight: 700; font-size: 14px; margin: 0 0 16px;">🔒 Locks in 1 hour!</p>
                                <p style="color: #475569; font-size: 13px; margin: 0;">+{len(today_matches) - 1} more match{"es" if len(today_matches) - 1 != 1 else ""} today</p>
                            </div>
                            <div style="text-align: center; margin-top: 24px;">
                                <a href="https://world-cup-2026-858s.vercel.app/predictions" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #fff; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 100px; text-decoration: none; display: inline-block;">Make My Picks →</a>
                            </div>
                            <p style="color: #334155; text-align: center; font-size: 12px; margin-top: 24px;">
                                You're receiving this because you have email notifications enabled.<br/>
                                <a href="https://world-cup-2026-858s.vercel.app/settings" style="color: #475569;">Unsubscribe in Settings</a>
                            </p>
                        </div>
                        '''
                    ))
                except Exception as e:
                    print(f'Reminder email error for {user.username}: {e}')
        except Exception as e:
            import traceback; traceback.print_exc()

def parse_kickoff(match):
    return datetime.strptime(match['kickoff_utc'], '%Y-%m-%dT%H:%M:%SZ')

def teams_match(sched_name, api_name):
    import unicodedata
    def normalize(s):
        return unicodedata.normalize('NFKD', s.lower()).encode('ascii', 'ignore').decode('ascii')
    a = normalize(sched_name)
    b = normalize(api_name)
    return a in b or b in a

def fetch_api_event(match, all_events):
    api_event = next((
        e for e in all_events
        if teams_match(match['home'], e.get('strHomeTeam', ''))
        and teams_match(match['away'], e.get('strAwayTeam', ''))
        and e.get('strStatus') in ['FT', 'Match Finished']
    ), None)
    if not api_event:
        try:
            search_q = f"{match['home'].replace(' ', '_')}_vs_{match['away'].replace(' ', '_')}"
            ko_date = parse_kickoff(match).strftime('%Y-%m-%d')
            r = http_requests.get(f'https://www.thesportsdb.com/api/v1/json/123/searchevents.php?e={search_q}&d={ko_date}', timeout=10)
            search_events = (r.json().get('event') or [])
            api_event = next((
                e for e in search_events
                if teams_match(match['home'], e.get('strHomeTeam', ''))
                and teams_match(match['away'], e.get('strAwayTeam', ''))
                and e.get('strStatus') in ['FT', 'Match Finished']
            ), None)
        except Exception as e:
            print(f'Fallback search error for {match["home"]} vs {match["away"]}: {e}')
    return api_event

def run_scoring():
    with app.app_context():
        try:
            now_utc = datetime.utcnow()
            unscored_match_ids = set(p.match_id for p in MatchPrediction.query.filter_by(scored=False).all())
            if not unscored_match_ids:
                return
            matches_to_check = [m for m in SCHEDULE if m['id'] in unscored_match_ids and parse_kickoff(m) < now_utc]
            if not matches_to_check:
                return
            dates_needed = set()
            for m in matches_to_check:
                ko = parse_kickoff(m)
                dates_needed.add(ko.strftime('%Y-%m-%d'))
                dates_needed.add((ko + timedelta(days=1)).strftime('%Y-%m-%d'))
            all_events = []
            for d in sorted(dates_needed):
                try:
                    response = http_requests.get(f'https://www.thesportsdb.com/api/v1/json/123/eventsday.php?d={d}&l=4429', timeout=10)
                    day_events = response.json().get('events', []) or []
                    all_events.extend(day_events)
                except Exception as e:
                    print(f'Scoring fetch error for {d}: {e}')
            for match in matches_to_check:
                api_event = fetch_api_event(match, all_events)
                if not api_event:
                    continue
                home_score = api_event.get('intHomeScore')
                away_score = api_event.get('intAwayScore')
                if home_score is None or away_score is None:
                    continue
                real_home = int(home_score)
                real_away = int(away_score)
                match_id = match['id']
                match_preds = MatchPrediction.query.filter_by(match_id=match_id, scored=False).all()
                if not match_preds:
                    continue
                for pred in match_preds:
                    pts = 0
                    pred_result = 'H' if pred.home_score > pred.away_score else 'A' if pred.away_score > pred.home_score else 'D'
                    real_result = 'H' if real_home > real_away else 'A' if real_away > real_home else 'D'
                    if pred_result == real_result:
                        pts += 2
                    if pred.home_score == real_home and pred.away_score == real_away:
                        pts += 4
                    if pts > 0:
                        user = db.session.get(User, pred.user_id)
                        if user:
                            user.points = (user.points or 0) + pts
                    pred.points_awarded = pts
                    pred.scored = True
                db.session.commit()
                print(f'Scored: {match["home"]} vs {match["away"]} ({real_home}-{real_away})')
        except Exception as e:
            import traceback; traceback.print_exc()

with app.app_context():
    db.create_all()

# ── AUTH ROUTES ──
@app.route('/api/signup', methods=['POST'])
@limiter.limit("5 per minute")
def signup():
    data = request.get_json()
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
    code = ''.join(random.choices(string.digits, k=6))
    VerificationCode.query.filter_by(email=data['email']).delete()
    db.session.add(VerificationCode(email=data['email'], code=code, pending_username=data['username'], pending_password=hashed_password.decode('utf-8')))
    db.session.commit()
    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail as SGMail
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        sg.send(SGMail(from_email='noreply@wc2026app.xyz', to_emails=data['email'], subject='Your WC2026 Verification Code',
            html_content=f'<div style="font-family:Arial;max-width:500px;margin:0 auto;background:#080d1a;color:white;padding:40px;border-radius:16px;"><h1 style="color:#f1f5f9;text-align:center;">Verify your account</h1><p style="color:#64748b;text-align:center;">Enter this code to complete your WC2026 signup:</p><div style="background:#0d1526;border-radius:12px;padding:24px;text-align:center;"><span style="font-size:48px;font-weight:900;letter-spacing:12px;color:#3b82f6;">{code}</span></div><p style="color:#334155;text-align:center;font-size:12px;">This code expires in 10 minutes.</p></div>'))
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({'error': str(e)}), 500
    return jsonify({'message': 'Verification code sent!'}), 200

@app.route('/api/verify', methods=['POST'])
@limiter.limit("10 per minute")
def verify_email():
    data = request.get_json()
    record = VerificationCode.query.filter_by(email=data.get('email'), code=data.get('code'), is_used=False).first()
    if not record:
        return jsonify({'error': 'Invalid code'}), 400
    created = record.created_at.replace(tzinfo=None) if record.created_at.tzinfo else record.created_at
    if (datetime.utcnow() - created).total_seconds() > 600:
        return jsonify({'error': 'Code expired, please sign up again'}), 400
    new_user = User(username=record.pending_username, email=data.get('email'), password=record.pending_password, is_verified=True)
    db.session.add(new_user)
    record.is_used = True
    db.session.commit()
    token = create_access_token(identity=str(new_user.id))
    return jsonify({'token': token, 'username': new_user.username, 'is_admin': new_user.is_admin}), 200

@app.route('/api/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), user.password.encode('utf-8')):
        return jsonify({'error': 'Invalid email or password'}), 401
    if not user.is_verified:
        return jsonify({'error': 'Please verify your email first'}), 401
    token = create_access_token(identity=str(user.id))
    return jsonify({'token': token, 'username': user.username, 'is_admin': user.is_admin, 'points': user.points}), 200

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def profile():
    user = db.session.get(User, int(get_jwt_identity()))
    return jsonify({'username': user.username, 'email': user.email, 'points': user.points, 'is_admin': user.is_admin}), 200

@app.route('/api/groups', methods=['GET'])
def get_groups():
    return jsonify(GROUPS), 200

@app.route('/api/predictions', methods=['GET', 'POST'])
@jwt_required()
def handle_predictions():
    user_id = get_jwt_identity()
    if request.method == 'GET':
        prediction = Prediction.query.filter_by(user_id=user_id).first()
        if not prediction:
            return jsonify({'saved': False}), 200
        return jsonify({
            'saved': True,
            'group_predictions': json.loads(prediction.group_predictions or '{}'),
            'third_place_advancing': json.loads(prediction.third_place_advancing or '[]'),
            'knockout_predictions': json.loads(prediction.knockout_predictions or '{}'),
            'golden_ball': prediction.golden_ball or '',
            'silver_ball': prediction.silver_ball or '',
            'bronze_ball': prediction.bronze_ball or '',
            'golden_boot': json.loads(prediction.golden_boot or '[]'),
            'golden_glove': json.loads(prediction.golden_glove or '[]'),
            'u21_award': json.loads(prediction.u21_award or '[]'),
        }), 200
    data = request.get_json()
    prediction = Prediction.query.filter_by(user_id=user_id).first()
    if not prediction:
        prediction = Prediction(user_id=user_id)
        db.session.add(prediction)
    prediction.group_predictions = json.dumps(data.get('group_predictions', {}))
    prediction.third_place_advancing = json.dumps(data.get('third_place_advancing', []))
    prediction.knockout_predictions = json.dumps(data.get('knockout_predictions', {}))
    prediction.golden_ball = data.get('golden_ball', '')
    prediction.silver_ball = data.get('silver_ball', '')
    prediction.bronze_ball = data.get('bronze_ball', '')
    prediction.golden_boot = json.dumps(data.get('golden_boot', []))
    prediction.golden_glove = json.dumps(data.get('golden_glove', []))
    prediction.u21_award = json.dumps(data.get('u21_award', []))
    db.session.commit()
    return jsonify({'message': 'Predictions saved!'}), 200

# ── SECOND CHANCE ROUTES ──
@app.route('/api/second-chance', methods=['GET'])
@jwt_required()
def get_second_chance():
    user_id = get_jwt_identity()
    sc = SecondChancePrediction.query.filter_by(user_id=user_id).first()
    if not sc:
        return jsonify({'saved': False, 'locked': False, 'knockout_predictions': {}}), 200
    return jsonify({
        'saved': True,
        'locked': sc.locked,
        'knockout_predictions': json.loads(sc.knockout_predictions or '{}'),
        'total_points': sc.total_points,
    }), 200

@app.route('/api/second-chance', methods=['POST'])
@jwt_required()
def save_second_chance():
    user_id = get_jwt_identity()
    data = request.get_json()
    sc = SecondChancePrediction.query.filter_by(user_id=user_id).first()
    if sc and sc.locked:
        return jsonify({'error': 'Second Chance predictions are locked!'}), 400
    # Lock when first R32 match kicks off (South Africa vs Canada 19:00 UTC June 28)
    lock_time = datetime(2026, 6, 28, 18, 50, 0)  # 10 mins before first R32 kick off
    if datetime.utcnow() >= lock_time:
        return jsonify({'error': 'Second Chance is now locked!'}), 400
    if not sc:
        sc = SecondChancePrediction(user_id=user_id)
        db.session.add(sc)
    sc.knockout_predictions = json.dumps(data.get('knockout_predictions', {}))
    if data.get('submit'):
        sc.locked = True
    db.session.commit()
    return jsonify({'message': 'Second Chance saved!' if not data.get('submit') else 'Second Chance locked! 🔒'}), 200

@app.route('/api/second-chance/matchups', methods=['GET'])
def get_r32_matchups():
    return jsonify(R32_MATCHUPS), 200

@app.route('/api/matches', methods=['GET'])
def get_matches():
    group = request.args.get('group', None)
    matches = SCHEDULE if not group else [m for m in SCHEDULE if m['group'] == group.upper()]
    return jsonify(matches), 200

@app.route('/api/matches/<int:match_id>', methods=['GET'])
def get_match(match_id):
    match = next((m for m in SCHEDULE if m['id'] == match_id), None)
    if not match:
        return jsonify({'error': 'Match not found'}), 404
    return jsonify(match), 200

@app.route('/api/matches/today', methods=['GET'])
def get_today_matches():
    today = datetime.utcnow().strftime('%Y-%m-%d')
    return jsonify([m for m in SCHEDULE if m['kickoff_utc'].startswith(today)]), 200

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    users = User.query.order_by(User.points.desc()).all()
    return jsonify([{'rank': i+1, 'username': u.username, 'points': u.points, 'is_admin': u.is_admin} for i, u in enumerate(users)]), 200

@app.route('/api/admin/users', methods=['GET'])
@jwt_required()
def admin_get_users():
    requester = db.session.get(User, int(get_jwt_identity()))
    if not requester or not requester.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    return jsonify([{'id': u.id, 'username': u.username, 'email': u.email, 'points': u.points, 'is_admin': u.is_admin} for u in User.query.all()]), 200

@app.route('/api/admin/users/<int:target_id>', methods=['DELETE'])
@jwt_required()
def admin_delete_user(target_id):
    requester = db.session.get(User, int(get_jwt_identity()))
    if not requester or not requester.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    user = db.session.get(User, target_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'}), 200

@app.route('/api/admin/users/<int:target_id>/toggle-admin', methods=['POST'])
@jwt_required()
def admin_toggle_admin(target_id):
    requester = db.session.get(User, int(get_jwt_identity()))
    if not requester or not requester.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    user = db.session.get(User, target_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user.is_admin = not user.is_admin
    db.session.commit()
    return jsonify({'message': 'Admin status updated', 'is_admin': user.is_admin}), 200

@app.route('/api/admin/users/<int:target_id>/points', methods=['POST'])
@jwt_required()
def admin_update_points(target_id):
    requester = db.session.get(User, int(get_jwt_identity()))
    if not requester or not requester.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    user = db.session.get(User, target_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user.points = request.get_json().get('points', user.points)
    db.session.commit()
    return jsonify({'message': 'Points updated'}), 200

@app.route('/api/admin/score-groups', methods=['POST'])
@jwt_required()
def score_group_stage_route():
    requester = db.session.get(User, int(get_jwt_identity()))
    if not requester or not requester.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    return jsonify({'error': 'Use Standings tab to update manually.'}), 400

@app.route('/api/admin/score-knockouts', methods=['POST'])
@jwt_required()
def score_knockouts_route():
    requester = db.session.get(User, int(get_jwt_identity()))
    if not requester or not requester.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    run_scoring()
    return jsonify({'message': 'Scoring triggered!'}), 200

@app.route('/api/admin/reset-points', methods=['POST'])
@jwt_required()
def reset_points():
    requester = db.session.get(User, int(get_jwt_identity()))
    if not requester or not requester.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    for user in User.query.all():
        user.points = 0
    MatchPrediction.query.update({'scored': False, 'points_awarded': 0})
    db.session.commit()
    return jsonify({'message': 'All points reset'}), 200

@app.route('/api/match-predictions', methods=['GET'])
@jwt_required()
def get_match_predictions():
    user_id = get_jwt_identity()
    preds = MatchPrediction.query.filter_by(user_id=user_id).all()
    return jsonify([{'match_id': p.match_id, 'home_score': p.home_score, 'away_score': p.away_score, 'points_awarded': p.points_awarded, 'scored': p.scored} for p in preds]), 200

@app.route('/api/match-predictions', methods=['POST'])
@jwt_required()
def save_match_prediction():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        match_id = data.get('match_id')
        home_score = data.get('home_score')
        away_score = data.get('away_score')
        match = next((m for m in SCHEDULE if m['id'] == match_id), None)
        if not match:
            return jsonify({'error': 'Match not found'}), 404
        kickoff_utc = parse_kickoff(match)
        if datetime.utcnow() >= kickoff_utc - timedelta(minutes=10):
            return jsonify({'error': 'Predictions locked for this match!'}), 400
        existing = MatchPrediction.query.filter_by(user_id=user_id, match_id=match_id).first()
        if existing:
            existing.home_score = home_score
            existing.away_score = away_score
        else:
            db.session.add(MatchPrediction(user_id=user_id, match_id=match_id, home_score=home_score, away_score=away_score))
        db.session.commit()
        return jsonify({'message': 'Prediction saved!'}), 200
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/leagues', methods=['POST'])
@jwt_required()
def create_league():
    user_id = get_jwt_identity()
    data = request.get_json()
    name = data.get('name', '').strip()
    if not name: return jsonify({'error': 'League name is required'}), 400
    if len(name) > 50: return jsonify({'error': 'Name too long (max 50 chars)'}), 400
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        if not League.query.filter_by(invite_code=code).first(): break
    league = League(name=name, invite_code=code, created_by=user_id)
    db.session.add(league)
    db.session.flush()
    db.session.add(LeagueMember(league_id=league.id, user_id=user_id))
    db.session.commit()
    return jsonify({'id': league.id, 'name': league.name, 'invite_code': league.invite_code}), 201

@app.route('/api/leagues/join', methods=['POST'])
@jwt_required()
def join_league():
    user_id = get_jwt_identity()
    code = request.get_json().get('invite_code', '').strip().upper()
    league = League.query.filter_by(invite_code=code).first()
    if not league: return jsonify({'error': 'Invalid invite code'}), 404
    if LeagueMember.query.filter_by(league_id=league.id, user_id=user_id).first():
        return jsonify({'error': 'You are already in this league!'}), 400
    db.session.add(LeagueMember(league_id=league.id, user_id=user_id))
    db.session.commit()
    return jsonify({'message': f'Joined {league.name}!', 'league_name': league.name}), 200

@app.route('/api/leagues/my', methods=['GET'])
@jwt_required()
def get_my_leagues():
    user_id = get_jwt_identity()
    result = []
    for mem in LeagueMember.query.filter_by(user_id=user_id).all():
        league = db.session.get(League, mem.league_id)
        if not league: continue
        member_data = []
        for m in LeagueMember.query.filter_by(league_id=league.id).all():
            u = db.session.get(User, m.user_id)
            if u: member_data.append({'username': u.username, 'points': u.points})
        member_data.sort(key=lambda x: x['points'], reverse=True)
        for i, m in enumerate(member_data): m['rank'] = i + 1
        creator = db.session.get(User, league.created_by)
        result.append({
            'id': league.id, 'name': league.name,
            'invite_code': league.invite_code if league.created_by == int(user_id) else None,
            'created_by': creator.username if creator else '?',
            'is_creator': league.created_by == int(user_id),
            'members': member_data,
        })
    return jsonify(result), 200

@app.route('/api/admin/leagues', methods=['GET'])
@jwt_required()
def admin_get_leagues():
    requester = db.session.get(User, int(get_jwt_identity()))
    if not requester or not requester.is_admin: return jsonify({'error': 'Unauthorized'}), 403
    result = []
    for league in League.query.order_by(League.created_at.desc()).all():
        creator = db.session.get(User, league.created_by)
        result.append({'id': league.id, 'name': league.name, 'invite_code': league.invite_code,
            'created_by': creator.username if creator else '?',
            'member_count': LeagueMember.query.filter_by(league_id=league.id).count(),
            'created_at': league.created_at.strftime('%Y-%m-%d')})
    return jsonify(result), 200

@app.route('/api/standings', methods=['GET'])
def get_standings():
    result = {}
    for s in GroupStanding.query.all():
        if s.group not in result: result[s.group] = []
        result[s.group].append({'team': s.team, 'played': s.played, 'won': s.won, 'drawn': s.drawn,
            'lost': s.lost, 'gf': s.gf, 'ga': s.ga, 'gd': s.gf - s.ga,
            'points': s.points, 'yellow_cards': s.yellow_cards, 'red_cards': s.red_cards})
    for g in result:
        result[g].sort(key=lambda x: (-x['points'], -x['gd'], -x['gf']))
    return jsonify(result), 200

@app.route('/api/admin/standings', methods=['POST'])
@jwt_required()
def update_standings():
    requester = db.session.get(User, int(get_jwt_identity()))
    if not requester or not requester.is_admin: return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    group = data.get('group').upper()
    team = data.get('team')
    s = GroupStanding.query.filter_by(group=group, team=team).first()
    if not s:
        s = GroupStanding(group=group, team=team)
        db.session.add(s)
    s.played = data.get('played', s.played)
    s.won = data.get('won', s.won)
    s.drawn = data.get('drawn', s.drawn)
    s.lost = data.get('lost', s.lost)
    s.gf = data.get('gf', s.gf)
    s.ga = data.get('ga', s.ga)
    s.points = data.get('points', s.points)
    s.yellow_cards = data.get('yellow_cards', s.yellow_cards)
    s.red_cards = data.get('red_cards', s.red_cards)
    db.session.commit()
    return jsonify({'message': 'Standing updated!'}), 200

@app.route('/api/admin/leagues/<int:league_id>', methods=['DELETE'])
@jwt_required()
def admin_delete_league(league_id):
    requester = db.session.get(User, int(get_jwt_identity()))
    if not requester or not requester.is_admin: return jsonify({'error': 'Unauthorized'}), 403
    LeagueMember.query.filter_by(league_id=league_id).delete()
    League.query.filter_by(id=league_id).delete()
    db.session.commit()
    return jsonify({'message': 'League deleted'}), 200

@app.route('/api/feedback', methods=['POST'])
def feedback():
    data = request.get_json()
    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail as SGMail
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        sg.send(SGMail(from_email='noreply@wc2026app.xyz', to_emails='ibrahimohammad2006@gmail.com',
            subject=f'WC2026 Feedback from {data.get("name")}',
            html_content=f'<h2>Feedback from {data.get("name")}</h2><p>{data.get("message")}</p>'))
        return jsonify({'message': 'Feedback sent!'}), 200
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/livescores', methods=['GET'])
def get_livescores():
    try:
        saved_results = {r.match_id: r for r in MatchResult.query.all()}
        dates_needed = set()
        for m in SCHEDULE:
            if m['id'] not in saved_results:
                ko = parse_kickoff(m)
                dates_needed.add(ko.strftime('%Y-%m-%d'))
                dates_needed.add((ko + timedelta(days=1)).strftime('%Y-%m-%d'))
        events_by_date = {}
        for d in sorted(dates_needed):
            try:
                response = http_requests.get(f'https://www.thesportsdb.com/api/v1/json/123/eventsday.php?d={d}&l=4429', timeout=10)
                events_by_date[d] = response.json().get('events', []) or []
            except Exception as e:
                print(f'Livescores fetch error for {d}: {e}')
                events_by_date[d] = []
        result = []
        for match in SCHEDULE:
            if match['id'] in saved_results:
                r = saved_results[match['id']]
                m = dict(match)
                m['home_score'] = r.home_score
                m['away_score'] = r.away_score
                m['status'] = r.status
                result.append(m)
                continue
            ko = parse_kickoff(match)
            ko_date = ko.strftime('%Y-%m-%d')
            next_date = (ko + timedelta(days=1)).strftime('%Y-%m-%d')
            candidates = events_by_date.get(ko_date, []) + events_by_date.get(next_date, [])
            api_match = next((e for e in candidates
                if teams_match(match['home'], e.get('strHomeTeam', ''))
                and teams_match(match['away'], e.get('strAwayTeam', ''))), None)
            if not api_match:
                try:
                    search_q = f"{match['home'].replace(' ', '_')}_vs_{match['away'].replace(' ', '_')}"
                    r = http_requests.get(f'https://www.thesportsdb.com/api/v1/json/123/searchevents.php?e={search_q}&d={ko_date}', timeout=10)
                    search_events = r.json().get('event') or []
                    api_match = next((e for e in search_events
                        if teams_match(match['home'], e.get('strHomeTeam', ''))
                        and teams_match(match['away'], e.get('strAwayTeam', ''))), None)
                except Exception as e:
                    print(f'Livescores search error: {e}')
            if api_match:
                m = dict(match)
                home_score = api_match.get('intHomeScore')
                away_score = api_match.get('intAwayScore')
                status = api_match.get('strStatus', '')
                m['home_score'] = int(home_score) if home_score not in [None, ''] else None
                m['away_score'] = int(away_score) if away_score not in [None, ''] else None
                m['api_fixture_id'] = api_match.get('idEvent')
                if status == 'FT':
                    m['status'] = 'FT'
                    if m['home_score'] is not None and m['away_score'] is not None:
                        if not MatchResult.query.filter_by(match_id=match['id']).first():
                            db.session.add(MatchResult(match_id=match['id'], home_score=m['home_score'], away_score=m['away_score'], status='FT'))
                            db.session.commit()
                elif status in ['1H', '2H', 'HT', 'Live', 'LIVE']:
                    m['status'] = 'LIVE'
                else:
                    m['status'] = 'NS'
                result.append(m)
            else:
                result.append(match)
        return jsonify(result), 200
    except Exception as e:
        print(f'Livescores error: {e}')
        return jsonify(SCHEDULE), 200

@app.route('/api/match-events/<fixture_id>', methods=['GET'])
def get_match_events(fixture_id):
    try:
        response = http_requests.get(f'https://www.thesportsdb.com/api/v1/json/123/lookuptimeline.php?id={fixture_id}', timeout=10)
        timeline = response.json().get('timeline') or []
        events = []
        for t in timeline:
            type_raw = (t.get('strTimeline') or '').lower()
            if 'goal' in type_raw: ev_type, detail = 'Goal', 'Own Goal' if 'own' in type_raw else 'Penalty' if 'penalty' in type_raw else 'Normal Goal'
            elif 'yellow' in type_raw: ev_type, detail = 'Card', 'Yellow Card'
            elif 'red' in type_raw: ev_type, detail = 'Card', 'Red Card'
            elif 'substitution' in type_raw: ev_type, detail = 'subst', 'Substitution'
            else: ev_type, detail = type_raw or 'Event', t.get('strTimeline', '')
            try: minute = int(t.get('intTime') or 0)
            except: minute = 0
            events.append({'minute': minute, 'team': t.get('strHome') or t.get('strTeam') or '', 'player': t.get('strPlayer', ''), 'type': ev_type, 'detail': detail})
        events.sort(key=lambda e: e['minute'])
        return jsonify(events), 200
    except Exception as e:
        return jsonify([]), 200

@app.route('/api/settings/profile', methods=['GET'])
@jwt_required()
def get_profile_settings():
    user = db.session.get(User, int(get_jwt_identity()))
    return jsonify({'username': user.username, 'email': user.email, 'email_notifications': user.email_notifications}), 200

@app.route('/api/settings/username', methods=['POST'])
@jwt_required()
def change_username():
    user = db.session.get(User, int(get_jwt_identity()))
    new_username = request.get_json().get('username', '').strip()
    if not new_username or len(new_username) < 3: return jsonify({'error': 'Username must be at least 3 characters'}), 400
    if User.query.filter(User.username == new_username, User.id != user.id).first(): return jsonify({'error': 'Username already taken'}), 400
    user.username = new_username
    db.session.commit()
    return jsonify({'message': 'Username updated!', 'username': user.username}), 200

@app.route('/api/settings/password', methods=['POST'])
@jwt_required()
def change_password():
    user = db.session.get(User, int(get_jwt_identity()))
    data = request.get_json()
    if not bcrypt.checkpw(data.get('current_password', '').encode('utf-8'), user.password.encode('utf-8')): return jsonify({'error': 'Current password is incorrect'}), 401
    new_password = data.get('new_password', '')
    if len(new_password) < 6: return jsonify({'error': 'New p    if len(new_password) < 6: return jsonify({'error': 'New password must be at least 6 characters'}), 400
    user.password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    db.session.commit()
    return jsonify({'message': 'Password updated!'}), 200

@app.route('/api/settings/email', methods=['POST'])
@jwt_required()
def request_email_change():
    user = db.session.get(User, int(get_jwt_identity()))
    new_email = request.get_json().get('email', '').strip().lower()
    if not new_email or '@' not in new_email: return jsonify({'error': 'Invalid email'}), 400
    if User.query.filter(User.email == new_email, User.id != user.id).first(): return jsonify({'error': 'Email already in use'}), 400
    code = ''.join(random.choices(string.digits, k=6))
    VerificationCode.query.filter_by(email=new_email).delete()
    db.session.add(VerificationCode(email=new_email, code=code, pending_username=str(user.id), pending_password='EMAIL_CHANGE'))
    db.session.commit()
    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail as SGMail
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        sg.send(SGMail(from_email='noreply@wc2026app.xyz', to_emails=new_email, subject='Confirm your new email - WC2026',
            html_content=f'<div style="font-family:Arial;max-width:500px;margin:0 auto;background:#080d1a;color:white;padding:40px;border-radius:16px;"><h1 style="color:#f1f5f9;text-align:center;">Confirm your new email</h1><div style="background:#0d1526;border-radius:12px;padding:24px;text-align:center;"><span style="font-size:48px;font-weight:900;letter-spacing:12px;color:#3b82f6;">{code}</span></div><p style="color:#334155;text-align:center;font-size:12px;">This code expires in 10 minutes.</p></div>'))
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    return jsonify({'message': 'Verification code sent to new email!'}), 200

@app.route('/api/settings/email/verify', methods=['POST'])
@jwt_required()
def verify_email_change():
    user = db.session.get(User, int(get_jwt_identity()))
    data = request.get_json()
    new_email = data.get('email', '').strip().lower()
    record = VerificationCode.query.filter_by(email=new_email, code=data.get('code', ''), is_used=False, pending_password='EMAIL_CHANGE').first()
    if not record: return jsonify({'error': 'Invalid code'}), 400
    created = record.created_at.replace(tzinfo=None) if record.created_at.tzinfo else record.created_at
    if (datetime.utcnow() - created).total_seconds() > 600: return jsonify({'error': 'Code expired, please try again'}), 400
    user.email = new_email
    record.is_used = True
    db.session.commit()
    return jsonify({'message': 'Email updated!', 'email': user.email}), 200

@app.route('/api/settings/notifications', methods=['POST'])
@jwt_required()
def toggle_notifications():
    user = db.session.get(User, int(get_jwt_identity()))
    user.email_notifications = request.get_json().get('enabled', True)
    db.session.commit()
    return jsonify({'message': 'Updated!', 'email_notifications': user.email_notifications}), 200

@app.route('/api/settings/delete-account', methods=['DELETE'])
@jwt_required()
def delete_account():
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not bcrypt.checkpw(request.get_json().get('password', '').encode('utf-8'), user.password.encode('utf-8')): return jsonify({'error': 'Incorrect password'}), 401
    Prediction.query.filter_by(user_id=user_id).delete()
    MatchPrediction.query.filter_by(user_id=user_id).delete()
    LeagueMember.query.filter_by(user_id=user_id).delete()
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'Account deleted'}), 200

@app.route('/api/qualification', methods=['GET'])
def get_qualification():
    teams = TeamQualification.query.all()
    return jsonify([{'team': t.team, 'group': t.group, 'status': t.status, 'message': t.message, 'updated_at': t.updated_at.strftime('%Y-%m-%d %H:%M')} for t in teams]), 200

@app.route('/api/admin/qualification', methods=['POST'])
@jwt_required()
def update_qualification():
    requester = db.session.get(User, int(get_jwt_identity()))
    if not requester or not requester.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    team = data.get('team')
    group = data.get('group', '').upper()
    status = data.get('status')
    message = data.get('message', '')
    t = TeamQualification.query.filter_by(team=team).first()
    if not t:
        t = TeamQualification(team=team, group=group)
        db.session.add(t)
    t.status = status
    t.message = message
    t.group = group
    t.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': 'Updated!'}), 200

try:
    scheduler = BackgroundScheduler()
    scheduler.add_job(run_scoring, 'interval', minutes=5)
    scheduler.add_job(send_match_reminders, 'interval', minutes=1)
    scheduler.start()
    print('Scheduler started: run_scoring every 5 minutes')
except Exception as e:
    print(f'Scheduler error: {e}')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)