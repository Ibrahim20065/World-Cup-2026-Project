import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import PlayerSearch from '../components/PlayerSearch'
import PLAYERS from '../players'
import toast from 'react-hot-toast'
import API_URL from '../config'
import { useColor } from '../assets/ColorContext'



const FLAGS = {
  'Mexico': 'mx', 'South Korea': 'kr', 'South Africa': 'za', 'Czech Republic': 'cz',
  'Canada': 'ca', 'Switzerland': 'ch', 'Qatar': 'qa', 'Bosnia': 'ba',
  'Brazil': 'br', 'Scotland': 'gb-sct', 'Morocco': 'ma', 'Haiti': 'ht',
  'USA': 'us', 'Australia': 'au', 'Paraguay': 'py', 'Turkey': 'tr',
  'Germany': 'de', 'Ecuador': 'ec', 'Ivory Coast': 'ci', 'Curacao': 'cw',
  'Netherlands': 'nl', 'Japan': 'jp', 'Sweden': 'se', 'Tunisia': 'tn',
  'Belgium': 'be', 'New Zealand': 'nz', 'Egypt': 'eg', 'Iran': 'ir',
  'Spain': 'es', 'Uruguay': 'uy', 'Saudi Arabia': 'sa', 'Cape Verde': 'cv',
  'France': 'fr', 'Norway': 'no', 'Senegal': 'sn', 'Iraq': 'iq',
  'Argentina': 'ar', 'Austria': 'at', 'Jordan': 'jo', 'Algeria': 'dz',
  'Portugal': 'pt', 'Colombia': 'co', 'Uzbekistan': 'uz', 'DR Congo': 'cd',
  'England': 'gb-eng', 'Croatia': 'hr', 'Ghana': 'gh', 'Panama': 'pa',
}

const GROUP_COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e',
  '#06b6d4','var(--accent)','#8b5cf6','#ec4899',
  '#14b8a6','#f59e0b','#84cc16','#6366f1',
]
const GROUP_LETTERS = ['A','B','C','D','E','F','G','H','I','J','K','L']

const POSITION_CONFIG = [
  { label: '1st', bg: '#22c55e', color: '#000' },
  { label: '2nd', bg: 'var(--accent)', color: '#fff' },
  { label: '3rd', bg: '#f59e0b', color: '#000' },
  { label: '4th', bg: '#ef4444', color: '#fff' },
]

const U21_NAMES = new Set([
  'Lamine Yamal','Pau Cubarsi','Marc Pubill','Victor Munoz',
  'Warren Zaire-Emery','Desire Doue','Kobbie Mainoo',"Nico O'Reilly",
  'Lennart Karl','Arda Guler','Kenan Yildiz','Can Uzun',
  'Endrick','Rayan','Nico Paz','Luka Vuskovic','Kendry Paez',
  'Jorrel Hato','Lucas Bergvall','Taha Ali','Nestory Irankunda',
  'Ayoub Bouaddi','Gilberto Mora','Mateo Chavez','Mike Penders','Nathan Ngoy',
  'Yan Diomande','Oumar Diakite','Antonio Nusa','Ibrahim Mbaye',
  'Lukas Hornicek','Stepan Chaloupek','Findlay Curtis','Tyler Fletcher','Ben Gannon-Doak',
  'Khulumani Ndamane','Kamogelo Sebelebele','Ibrahim Maza','Abbosbek Fayzullaev','Hamza Abdel Karim',
])
const U21_PLAYERS = PLAYERS.filter(p => U21_NAMES.has(p.name))

const SCHEDULE = [
  { id: 1,  home: 'Mexico',       away: 'South Africa',   date: '2026-06-11', time: '15:00', group: 'A' },
  { id: 2,  home: 'South Korea',  away: 'Czech Republic', date: '2026-06-11', time: '22:00', group: 'A' },
  { id: 3,  home: 'Canada',       away: 'Bosnia',         date: '2026-06-12', time: '15:00', group: 'B' },
  { id: 4,  home: 'USA',          away: 'Paraguay',       date: '2026-06-12', time: '21:00', group: 'D' },
  { id: 5,  home: 'Haiti',        away: 'Scotland',       date: '2026-06-13', time: '21:00', group: 'C' },
  { id: 6,  home: 'Australia',    away: 'Turkey',         date: '2026-06-13', time: '21:00', group: 'D' },
  { id: 7,  home: 'Brazil',       away: 'Morocco',        date: '2026-06-13', time: '18:00', group: 'C' },
  { id: 8,  home: 'Qatar',        away: 'Switzerland',    date: '2026-06-13', time: '15:00', group: 'B' },
  { id: 9,  home: 'Ivory Coast',  away: 'Ecuador',        date: '2026-06-14', time: '19:00', group: 'E' },
  { id: 10, home: 'Germany',      away: 'Curacao',        date: '2026-06-14', time: '13:00', group: 'E' },
  { id: 11, home: 'Netherlands',  away: 'Japan',          date: '2026-06-14', time: '16:00', group: 'F' },
  { id: 12, home: 'Sweden',       away: 'Tunisia',        date: '2026-06-14', time: '22:00', group: 'F' },
  { id: 13, home: 'Spain',        away: 'Cape Verde',     date: '2026-06-15', time: '12:00', group: 'H' },
  { id: 14, home: 'Belgium',      away: 'Egypt',          date: '2026-06-15', time: '15:00', group: 'G' },
  { id: 15, home: 'Saudi Arabia', away: 'Uruguay',        date: '2026-06-15', time: '18:00', group: 'H' },
  { id: 16, home: 'Iran',         away: 'New Zealand',    date: '2026-06-15', time: '21:00', group: 'G' },
  { id: 17, home: 'France',       away: 'Senegal',        date: '2026-06-16', time: '15:00', group: 'I' },
  { id: 18, home: 'Iraq',         away: 'Norway',         date: '2026-06-16', time: '18:00', group: 'I' },
  { id: 19, home: 'Argentina',    away: 'Algeria',        date: '2026-06-16', time: '21:00', group: 'J' },
  { id: 20, home: 'Austria',      away: 'Jordan',         date: '2026-06-17', time: '00:00', group: 'J' },
  { id: 21, home: 'Portugal',     away: 'DR Congo',       date: '2026-06-17', time: '13:00', group: 'K' },
  { id: 22, home: 'England',      away: 'Croatia',        date: '2026-06-17', time: '16:00', group: 'L' },
  { id: 23, home: 'Ghana',        away: 'Panama',         date: '2026-06-17', time: '19:00', group: 'L' },
  { id: 24, home: 'Uzbekistan',   away: 'Colombia',       date: '2026-06-17', time: '22:00', group: 'K' },
  { id: 25, home: 'Czech Republic',away:'South Africa',   date: '2026-06-18', time: '12:00', group: 'A' },
  { id: 26, home: 'Switzerland',  away: 'Bosnia',         date: '2026-06-18', time: '15:00', group: 'B' },
  { id: 27, home: 'Canada',       away: 'Qatar',          date: '2026-06-18', time: '18:00', group: 'B' },
  { id: 28, home: 'Mexico',       away: 'South Korea',    date: '2026-06-18', time: '21:00', group: 'A' },
  { id: 29, home: 'Scotland',     away: 'Morocco',        date: '2026-06-19', time: '18:00', group: 'C' },
  { id: 30, home: 'USA',          away: 'Australia',      date: '2026-06-19', time: '15:00', group: 'D' },
  { id: 31, home: 'Brazil',       away: 'Haiti',          date: '2026-06-19', time: '21:00', group: 'C' },
  { id: 32, home: 'Turkey',       away: 'Paraguay',       date: '2026-06-20', time: '00:00', group: 'D' },
  { id: 33, home: 'Germany',      away: 'Ivory Coast',    date: '2026-06-20', time: '16:00', group: 'E' },
  { id: 34, home: 'Ecuador',      away: 'Curacao',        date: '2026-06-20', time: '20:00', group: 'E' },
  { id: 35, home: 'Netherlands',  away: 'Sweden',         date: '2026-06-20', time: '13:00', group: 'F' },
  { id: 36, home: 'Tunisia',      away: 'Japan',          date: '2026-06-21', time: '00:00', group: 'F' },
  { id: 37, home: 'Spain',        away: 'Saudi Arabia',   date: '2026-06-21', time: '12:00', group: 'H' },
  { id: 38, home: 'Belgium',      away: 'Iran',           date: '2026-06-21', time: '15:00', group: 'G' },
  { id: 39, home: 'Uruguay',      away: 'Cape Verde',     date: '2026-06-21', time: '18:00', group: 'H' },
  { id: 40, home: 'New Zealand',  away: 'Egypt',          date: '2026-06-21', time: '21:00', group: 'G' },
  { id: 41, home: 'Argentina',    away: 'Austria',        date: '2026-06-22', time: '13:00', group: 'J' },
  { id: 42, home: 'France',       away: 'Iraq',           date: '2026-06-22', time: '17:00', group: 'I' },
  { id: 43, home: 'Norway',       away: 'Senegal',        date: '2026-06-22', time: '20:00', group: 'I' },
  { id: 44, home: 'Jordan',       away: 'Algeria',        date: '2026-06-22', time: '23:00', group: 'J' },
  { id: 45, home: 'England',      away: 'Ghana',          date: '2026-06-23', time: '16:00', group: 'L' },
  { id: 46, home: 'Panama',       away: 'Croatia',        date: '2026-06-23', time: '19:00', group: 'L' },
  { id: 47, home: 'Portugal',     away: 'Uzbekistan',     date: '2026-06-23', time: '13:00', group: 'K' },
  { id: 48, home: 'Colombia',     away: 'DR Congo',       date: '2026-06-23', time: '22:00', group: 'K' },
  { id: 49, home: 'Scotland',     away: 'Brazil',         date: '2026-06-24', time: '18:00', group: 'C' },
  { id: 50, home: 'Morocco',      away: 'Haiti',          date: '2026-06-24', time: '18:00', group: 'C' },
  { id: 51, home: 'Switzerland',  away: 'Canada',         date: '2026-06-24', time: '15:00', group: 'B' },
  { id: 52, home: 'Bosnia',       away: 'Qatar',          date: '2026-06-24', time: '15:00', group: 'B' },
  { id: 53, home: 'Czech Republic',away:'Mexico',         date: '2026-06-24', time: '21:00', group: 'A' },
  { id: 54, home: 'South Africa', away: 'South Korea',    date: '2026-06-24', time: '21:00', group: 'A' },
  { id: 55, home: 'Curacao',      away: 'Ivory Coast',    date: '2026-06-25', time: '16:00', group: 'E' },
  { id: 56, home: 'Ecuador',      away: 'Germany',        date: '2026-06-25', time: '16:00', group: 'E' },
  { id: 57, home: 'Japan',        away: 'Sweden',         date: '2026-06-25', time: '19:00', group: 'F' },
  { id: 58, home: 'Tunisia',      away: 'Netherlands',    date: '2026-06-25', time: '19:00', group: 'F' },
  { id: 59, home: 'Turkey',       away: 'USA',            date: '2026-06-25', time: '22:00', group: 'D' },
  { id: 60, home: 'Paraguay',     away: 'Australia',      date: '2026-06-25', time: '22:00', group: 'D' },
  { id: 61, home: 'Norway',       away: 'France',         date: '2026-06-26', time: '15:00', group: 'I' },
  { id: 62, home: 'Senegal',      away: 'Iraq',           date: '2026-06-26', time: '15:00', group: 'I' },
  { id: 63, home: 'Egypt',        away: 'Iran',           date: '2026-06-26', time: '23:00', group: 'G' },
  { id: 64, home: 'New Zealand',  away: 'Belgium',        date: '2026-06-26', time: '23:00', group: 'G' },
  { id: 65, home: 'Cape Verde',   away: 'Saudi Arabia',   date: '2026-06-26', time: '20:00', group: 'H' },
  { id: 66, home: 'Uruguay',      away: 'Spain',          date: '2026-06-26', time: '20:00', group: 'H' },
  { id: 67, home: 'Panama',       away: 'England',        date: '2026-06-27', time: '17:00', group: 'L' },
  { id: 68, home: 'Croatia',      away: 'Ghana',          date: '2026-06-27', time: '17:00', group: 'L' },
  { id: 69, home: 'Algeria',      away: 'Austria',        date: '2026-06-27', time: '22:00', group: 'J' },
  { id: 70, home: 'Jordan',       away: 'Argentina',      date: '2026-06-27', time: '22:00', group: 'J' },
  { id: 71, home: 'Colombia',     away: 'Portugal',       date: '2026-06-27', time: '19:30', group: 'K' },
  { id: 72, home: 'DR Congo',     away: 'Uzbekistan',     date: '2026-06-27', time: '19:30', group: 'K' },
]

// ── MATCH PICKS ──
function MatchPicks({ token }) {
  const [matchPreds, setMatchPreds] = useState({})
  const [savedPreds, setSavedPreds] = useState({})
  const [saving, setSaving] = useState(null)
  const [locked, setLocked] = useState(false)
  const [lockTime, setLockTime] = useState(null)
  const [timeLeft, setTimeLeft] = useState('')

  const today = new Date().toISOString().split('T')[0]
  const allDates = [...new Set(SCHEDULE.map(m => m.date))].sort()
  const activeDate = allDates.find(d => d >= today) || allDates[allDates.length - 1]
  const todayMatches = SCHEDULE.filter(m => m.date === activeDate)

  useEffect(() => {
  if (todayMatches.length === 0) return
  const firstTime = todayMatches.map(m => m.time).sort()[0]
  const [h, min] = firstTime.split(':').map(Number)
  const utcHour = h + 4
  const lockDate = new Date(Date.UTC(
    parseInt(activeDate.split('-')[0]),
    parseInt(activeDate.split('-')[1]) - 1,
    parseInt(activeDate.split('-')[2]),
    utcHour, min - 10, 0
  ))
  console.log('Lock time:', lockDate)
  console.log('Now:', new Date())
  console.log('Is locked:', new Date() >= lockDate)
  setLockTime(lockDate)
  setLocked(new Date() >= lockDate)
}, [activeDate])

  useEffect(() => {
    if (!lockTime || locked) return
    const iv = setInterval(() => {
      const diff = lockTime - new Date()
      if (diff <= 0) { setLocked(true); setTimeLeft(''); clearInterval(iv); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${h > 0 ? h + 'h ' : ''}${m}m ${s}s`)
    }, 1000)
    return () => clearInterval(iv)
  }, [lockTime, locked])

  useEffect(() => {
    if (!token) return
    axios.get(`${API_URL}/api/match-predictions`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const saved = {}
        res.data.forEach(p => { saved[p.match_id] = p })
        setSavedPreds(saved)
        const inputs = {}
        res.data.forEach(p => { inputs[p.match_id] = { home: String(p.home_score), away: String(p.away_score) } })
        setMatchPreds(inputs)
      }).catch(() => {})
  }, [token])

  const savePick = async (matchId) => {
    if (!token) { toast.error('Please login first!'); return }
    if (locked) { toast.error('Picks are locked for today!'); return }
    const pick = matchPreds[matchId]
    if (!pick || pick.home === '' || pick.away === '') { toast.error('Enter both scores!'); return }
    const homeScore = parseInt(pick.home)
    const awayScore = parseInt(pick.away)
    if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) { toast.error('Enter valid scores!'); return }
    setSaving(matchId)
    try {
      await axios.post(`${API_URL}/api/match-predictions`,
        { match_id: matchId, home_score: homeScore, away_score: awayScore },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSavedPreds(prev => ({ ...prev, [matchId]: { home_score: homeScore, away_score: awayScore, scored: false, points_awarded: 0 } }))
      toast.success('Pick saved! ✅')
    } catch (err) { toast.error(err.response?.data?.error || 'Error saving pick') }
    setSaving(null)
  }

  const groupColor = (group) => {
    const idx = GROUP_LETTERS.indexOf(group)
    return idx >= 0 ? GROUP_COLORS[idx] : 'var(--accent)'
  }

  if (!token) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <p style={{ color: '#64748b', fontWeight: 700, fontSize: 16 }}>Login to make match predictions</p>
    </div>
  )

  if (todayMatches.length === 0) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <p style={{ color: '#64748b', fontWeight: 700, fontSize: 16 }}>No more group stage matches!</p>
    </div>
  )

  return (
    <div>
      <div style={{ background: '#0d1526', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 14, padding: '16px 20px', marginBottom: 24, borderTop: '3px solid var(--accent)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 18, color: '#93c5fd', margin: '0 0 4px' }}>Match Picks</h2>
          <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>
            {new Date(activeDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            {' · '}{todayMatches.length} matches
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          {locked ? (
            <span style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 100 }}>Picks Locked</span>
          ) : (
            <>
              <span style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 100 }}>Open for picks</span>
              {timeLeft && <span style={{ color: '#475569', fontSize: 11 }}>Locks in {timeLeft}</span>}
            </>
          )}
          <span style={{ color: '#334155', fontSize: 11 }}>2pts result · +4pts exact score</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {todayMatches.map(match => {
          const gc = groupColor(match.group)
          const saved = savedPreds[match.id]
          const pick = matchPreds[match.id] || { home: '', away: '' }
          const isSaving = saving === match.id
          const hasSaved = !!saved
          return (
            <motion.div key={match.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: '#0d1526', border: `1px solid ${hasSaved ? gc + '30' : 'rgba(255,255,255,0.06)'}`, borderTop: `3px solid ${gc}`, borderRadius: 14, padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: gc, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Group {match.group} · Match {match.id}</span>
                <span style={{ fontSize: 11, color: '#334155', fontWeight: 600 }}>{match.time} UTC</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <img src={`https://flagcdn.com/w80/${FLAGS[match.home] || 'un'}.png`} alt={match.home} style={{ width: 44, height: 30, objectFit: 'cover', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }} onError={e => { e.target.style.display = 'none' }} />
                  <span style={{ fontWeight: 700, fontSize: 12, color: '#e2e8f0', textAlign: 'center' }}>{match.home}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <input type="number" min="0" max="20" value={pick.home} onChange={e => setMatchPreds(prev => ({ ...prev, [match.id]: { ...pick, home: e.target.value } }))} disabled={locked} placeholder="0"
                    style={{ width: 48, height: 48, textAlign: 'center', background: locked ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)', border: `2px solid ${hasSaved ? gc + '50' : 'rgba(255,255,255,0.1)'}`, color: '#f1f5f9', fontSize: 22, fontWeight: 900, borderRadius: 10, outline: 'none', cursor: locked ? 'not-allowed' : 'text', MozAppearance: 'textfield', WebkitAppearance: 'none', appearance: 'none' }} />
                  <span style={{ color: '#334155', fontWeight: 900, fontSize: 18 }}>–</span>
                  <input type="number" min="0" max="20" value={pick.away} onChange={e => setMatchPreds(prev => ({ ...prev, [match.id]: { ...pick, away: e.target.value } }))} disabled={locked} placeholder="0"
                    style={{ width: 48, height: 48, textAlign: 'center', background: locked ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)', border: `2px solid ${hasSaved ? gc + '50' : 'rgba(255,255,255,0.1)'}`, color: '#f1f5f9', fontSize: 22, fontWeight: 900, borderRadius: 10, outline: 'none', cursor: locked ? 'not-allowed' : 'text' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <img src={`https://flagcdn.com/w80/${FLAGS[match.away] || 'un'}.png`} alt={match.away} style={{ width: 44, height: 30, objectFit: 'cover', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }} onError={e => { e.target.style.display = 'none' }} />
                  <span style={{ fontWeight: 700, fontSize: 12, color: '#e2e8f0', textAlign: 'center' }}>{match.away}</span>
                </div>
              </div>
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {saved?.scored ? (
                  <span style={{ background: saved.points_awarded > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${saved.points_awarded > 0 ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`, color: saved.points_awarded > 0 ? '#22c55e' : '#475569', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 100 }}>
                    {saved.points_awarded > 0 ? `+${saved.points_awarded} pts ✓` : '0 pts'}
                  </span>
                ) : hasSaved ? (
                  <span style={{ fontSize: 11, color: '#475569' }}>Saved: {saved.home_score}–{saved.away_score}</span>
                ) : <span />}
                {!locked && (
                  <button onClick={() => savePick(match.id)} disabled={isSaving}
                    style={{ background: hasSaved ? `${gc}15` : 'linear-gradient(135deg, var(--accent), #1d4ed8)', border: hasSaved ? `1px solid ${gc}40` : 'none', color: hasSaved ? gc : '#fff', fontWeight: 700, fontSize: 13, padding: '7px 18px', borderRadius: 8, cursor: 'pointer', opacity: isSaving ? 0.6 : 1 }}>
                    {isSaving ? 'Saving...' : hasSaved ? '✓ Update Pick' : 'Save Pick'}
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ── SORTABLE TEAM ──
function SortableTeam({ team, index, total, onMove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: team })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, zIndex: isDragging ? 50 : 'auto' }
  const pos = POSITION_CONFIG[index]
  return (
    <div ref={setNodeRef} style={style} {...attributes} className="flex items-center gap-3 bg-gray-700 hover:bg-gray-600 rounded-lg px-3 py-2.5 transition">
      <span style={{ width: 28, height: 28, borderRadius: '50%', background: pos.bg, color: pos.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{pos.label}</span>
      <img src={`https://flagcdn.com/w40/${FLAGS[team] || 'un'}.png`} alt={team} className="w-8 h-5 object-cover rounded-sm flex-shrink-0" onError={(e) => { e.target.style.display = 'none' }} />
      <span className="flex-1 font-medium text-white text-sm">{team}</span>
      <div className="flex flex-col gap-0.5 sm:hidden">
        <button onClick={() => onMove(index, index - 1)} disabled={index === 0} className="w-6 h-5 flex items-center justify-center rounded text-gray-400 hover:text-white hover:bg-gray-500 disabled:opacity-20 transition text-xs">▲</button>
        <button onClick={() => onMove(index, index + 1)} disabled={index === total - 1} className="w-6 h-5 flex items-center justify-center rounded text-gray-400 hover:text-white hover:bg-gray-500 disabled:opacity-20 transition text-xs">▼</button>
      </div>
      <span {...listeners} className="text-gray-500 text-lg select-none cursor-grab hidden sm:block">⠿</span>
    </div>
  )
}

function autoAssign3rdPlace(thirdPlaceAdvancing, groupPredictions) {
  const teamToGroup = {}
  Object.keys(groupPredictions).forEach(g => {
    const thirdTeam = groupPredictions[g]?.[2]
    if (thirdTeam && thirdPlaceAdvancing.includes(thirdTeam)) teamToGroup[thirdTeam] = g
  })
  const slots = [
    { slot: 't74', eligible: ['A','B','C','D','F'], winnerGroup: 'E' },
    { slot: 't77', eligible: ['C','D','F','G','H'], winnerGroup: 'I' },
    { slot: 't79', eligible: ['C','E','F','H','I'], winnerGroup: 'A' },
    { slot: 't80', eligible: ['E','H','I','J','K'], winnerGroup: 'L' },
    { slot: 't81', eligible: ['B','E','F','I','J'], winnerGroup: 'D' },
    { slot: 't82', eligible: ['A','E','H','I','J'], winnerGroup: 'G' },
    { slot: 't85', eligible: ['E','F','G','I','J'], winnerGroup: 'B' },
    { slot: 't87', eligible: ['D','E','I','J','L'], winnerGroup: 'K' },
  ]
  const isEligible = (team, slot) => slot.eligible.includes(teamToGroup[team]) && teamToGroup[team] !== slot.winnerGroup
  const teamMatch = {}
  const findSlotById = id => slots.find(s => s.slot === id)
  function augment(slot, visited) {
    for (const team of thirdPlaceAdvancing) {
      if (visited.has(team)) continue
      if (!isEligible(team, slot)) continue
      visited.add(team)
      const currentSlotId = teamMatch[team]
      if (!currentSlotId || augment(findSlotById(currentSlotId), visited)) { teamMatch[team] = slot.slot; return true }
    }
    return false
  }
  for (const slot of slots) augment(slot, new Set())
  const assigned = {}
  Object.keys(teamMatch).forEach(team => { assigned[teamMatch[team]] = team })
  return assigned
}

function getR32Matches(gp, thirdPlaceAdvancing) {
  const w = g => gp[g]?.[0] || '?'
  const r = g => gp[g]?.[1] || '?'
  const assignments = thirdPlaceAdvancing.length === 8 ? autoAssign3rdPlace(thirdPlaceAdvancing, gp) : {}
  const t = slot => assignments[slot] || '?'
  return [
    { id: 'r32_73', match: 73, team1: r('A'), team2: r('B') },
    { id: 'r32_74', match: 74, team1: w('E'), team2: t('t74') },
    { id: 'r32_75', match: 75, team1: w('F'), team2: r('C') },
    { id: 'r32_76', match: 76, team1: w('C'), team2: r('F') },
    { id: 'r32_77', match: 77, team1: w('I'), team2: t('t77') },
    { id: 'r32_78', match: 78, team1: r('E'), team2: r('I') },
    { id: 'r32_79', match: 79, team1: w('A'), team2: t('t79') },
    { id: 'r32_80', match: 80, team1: w('L'), team2: t('t80') },
    { id: 'r32_81', match: 81, team1: w('D'), team2: t('t81') },
    { id: 'r32_82', match: 82, team1: w('G'), team2: t('t82') },
    { id: 'r32_83', match: 83, team1: r('K'), team2: r('L') },
    { id: 'r32_84', match: 84, team1: w('H'), team2: r('J') },
    { id: 'r32_85', match: 85, team1: w('B'), team2: t('t85') },
    { id: 'r32_86', match: 86, team1: w('J'), team2: r('H') },
    { id: 'r32_87', match: 87, team1: w('K'), team2: t('t87') },
    { id: 'r32_88', match: 88, team1: r('D'), team2: r('G') },
  ].sort((a, b) => a.match - b.match)
}

function getR16Matches(r32Preds) {
  const w = id => r32Preds[id] || '?'
  return [
    { id: 'r16_1', match: 'R16-1', team1: w('r32_73'), team2: w('r32_74') },
    { id: 'r16_2', match: 'R16-2', team1: w('r32_75'), team2: w('r32_76') },
    { id: 'r16_3', match: 'R16-3', team1: w('r32_77'), team2: w('r32_78') },
    { id: 'r16_4', match: 'R16-4', team1: w('r32_79'), team2: w('r32_80') },
    { id: 'r16_5', match: 'R16-5', team1: w('r32_81'), team2: w('r32_82') },
    { id: 'r16_6', match: 'R16-6', team1: w('r32_83'), team2: w('r32_84') },
    { id: 'r16_7', match: 'R16-7', team1: w('r32_85'), team2: w('r32_86') },
    { id: 'r16_8', match: 'R16-8', team1: w('r32_87'), team2: w('r32_88') },
  ]
}

function getQFMatches(r16Preds) {
  const w = id => r16Preds[id] || '?'
  return [
    { id: 'qf_1', match: 'QF-1', team1: w('r16_1'), team2: w('r16_2') },
    { id: 'qf_2', match: 'QF-2', team1: w('r16_3'), team2: w('r16_4') },
    { id: 'qf_3', match: 'QF-3', team1: w('r16_5'), team2: w('r16_6') },
    { id: 'qf_4', match: 'QF-4', team1: w('r16_7'), team2: w('r16_8') },
  ]
}

function getSFMatches(qfPreds) {
  const w = id => qfPreds[id] || '?'
  return [
    { id: 'sf_1', match: 'SF-1', team1: w('qf_1'), team2: w('qf_2') },
    { id: 'sf_2', match: 'SF-2', team1: w('qf_3'), team2: w('qf_4') },
  ]
}

function getFinalTeams(sfPreds) {
  return ['sf_1', 'sf_2'].map(id => sfPreds[id]).filter(Boolean)
}

// ── BRACKET COMPONENTS ──
const CARD_H = 56  // height of each match card in px
const CARD_W = 130 // width of each match card in px
const COL_GAP = 10 // gap between columns

function MatchCard({ match, prediction, onPick }) {
  return (
    <div style={{
      background: '#0f1729',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 6,
      overflow: 'hidden',
      width: CARD_W,
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        padding: '2px 6px',
        fontSize: 8,
        fontWeight: 700,
        color: '#64748b',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        {typeof match.match === 'number' ? `M${match.match}` : match.match}
      </div>
      {[match.team1, match.team2].map((team, i) => {
        const sel = prediction === team
        const tbd = !team || team === '?'
        return (
          <div key={i}>
            {i === 1 && <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />}
            <button
              onClick={() => !tbd && onPick(match.id, team)}
              disabled={tbd}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 6px',
                background: sel ? 'rgba(34,197,94,0.15)' : 'transparent',
                borderLeft: `2px solid ${sel ? '#22c55e' : 'transparent'}`,
                border: 'none',
                cursor: tbd ? 'default' : 'pointer',
                opacity: tbd ? 0.3 : 1,
              }}
            >
              {!tbd && (
                <img
                  src={`https://flagcdn.com/w40/${FLAGS[team] || 'un'}.png`}
                  alt={team}
                  style={{ width: 16, height: 11, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }}
                  onError={e => { e.target.style.display = 'none' }}
                />
              )}
              <span style={{
                flex: 1,
                fontSize: 9,
                fontWeight: 700,
                color: sel ? '#22c55e' : tbd ? '#475569' : '#e2e8f0',
                textAlign: 'left',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {tbd ? 'TBD' : team}
              </span>
              {sel && <span style={{ color: '#22c55e', fontSize: 8 }}>✓</span>}
            </button>
          </div>
        )
      })}
    </div>
  )
}

// A single column of matches positioned so each match is
// vertically centered between its two "parent" matches
function BracketCol({ title, matches, predictions, onPick, totalH }) {
  const n = matches.length
  // Each match occupies an equal slot of totalH
  const slotH = totalH / n
  return (
    <div style={{ flexShrink: 0, width: CARD_W }}>
      <div style={{
        fontSize: 8,
        fontWeight: 800,
        color: 'var(--accent)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        textAlign: 'center',
        marginBottom: 6,
      }}>{title}</div>
      <div style={{ position: 'relative', height: totalH }}>
        {matches.map((match, i) => {
          const top = i * slotH + (slotH - CARD_H) / 2
          return (
            <div key={match.id} style={{ position: 'absolute', top, left: 0 }}>
              <MatchCard match={match} prediction={predictions[match.id]} onPick={onPick} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function KnockoutBracket({ r32Matches, r16Matches, qfMatches, sfMatches, finalTeams, knockoutPredictions, setKnockoutPredictions }) {
  // Total height is determined by 8 R32 matches per side
  const N = 8 // matches per side in R32
  const totalH = N * CARD_H + (N - 1) * 8 // 8px gap between cards

  const setR32 = (id, team) => setKnockoutPredictions(p => ({ ...p, r32: { ...p.r32, [id]: team } }))
  const setR16 = (id, team) => setKnockoutPredictions(p => ({ ...p, r16: { ...p.r16, [id]: team } }))
  const setQF  = (id, team) => setKnockoutPredictions(p => ({ ...p, quarter: { ...p.quarter, [id]: team } }))
  const setSF  = (id, team) => setKnockoutPredictions(p => ({ ...p, semi: { ...p.semi, [id]: team } }))

  return (
    <div style={{ overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none' }}>
      <div style={{ display: 'flex', gap: COL_GAP, alignItems: 'flex-start', paddingBottom: 8 }}>

        {/* LEFT: R32 → R16 → QF → SF */}
        <BracketCol title="Round of 32" matches={r32Matches.slice(0, 8)}  predictions={knockoutPredictions.r32}     onPick={setR32} totalH={totalH} />
        <BracketCol title="Round of 16" matches={r16Matches.slice(0, 4)}  predictions={knockoutPredictions.r16}     onPick={setR16} totalH={totalH} />
        <BracketCol title="Quarter Finals" matches={qfMatches.slice(0, 2)} predictions={knockoutPredictions.quarter} onPick={setQF}  totalH={totalH} />
        <BracketCol title="Semi Finals"  matches={sfMatches.slice(0, 1)}  predictions={knockoutPredictions.semi}    onPick={setSF}  totalH={totalH} />

        {/* CENTER: Final + 3rd */}
        <div style={{
          flexShrink: 0,
          width: CARD_W + 20,
          height: totalH + 28, // +28 for title row
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 12,
        }}>
          {/* Final */}
          <div>
            <div style={{ fontSize: 8, fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', marginBottom: 4 }}>🏆 Final</div>
            <div style={{ background: '#0f1729', border: '2px solid #fbbf24', borderRadius: 6, overflow: 'hidden', width: CARD_W + 20 }}>
              <div style={{ background: 'rgba(251,191,36,0.1)', padding: '2px 6px', fontSize: 8, fontWeight: 800, color: '#fbbf24', textAlign: 'center' }}>CHAMPION</div>
              {finalTeams.length === 2 ? finalTeams.map(team => (
                <button key={team} onClick={() => setKnockoutPredictions(p => ({ ...p, final: team }))}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 4, padding: '5px 6px', background: knockoutPredictions.final === team ? 'rgba(251,191,36,0.15)' : 'transparent', borderLeft: `2px solid ${knockoutPredictions.final === team ? '#fbbf24' : 'transparent'}`, border: 'none', cursor: 'pointer' }}>
                  <img src={`https://flagcdn.com/w40/${FLAGS[team] || 'un'}.png`} alt={team} style={{ width: 16, height: 11, objectFit: 'cover', borderRadius: 1 }} />
                  <span style={{ flex: 1, fontSize: 9, fontWeight: 700, color: knockoutPredictions.final === team ? '#fbbf24' : '#e2e8f0', textAlign: 'left' }}>{team}</span>
                  {knockoutPredictions.final === team && <span style={{ color: '#fbbf24', fontSize: 9 }}>🏆</span>}
                </button>
              )) : <p style={{ color: '#475569', fontSize: 9, textAlign: 'center', padding: '8px', fontStyle: 'italic', margin: 0 }}>Complete Semis</p>}
            </div>
          </div>

          {/* 3rd Place */}
          <div>
            <div style={{ fontSize: 8, fontWeight: 800, color: '#fb923c', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', marginBottom: 4 }}>🥉 3rd Place</div>
            <div style={{ background: '#0f1729', border: '1px solid rgba(251,146,60,0.4)', borderRadius: 6, overflow: 'hidden', width: CARD_W + 20 }}>
              <div style={{ background: 'rgba(251,146,60,0.08)', padding: '2px 6px', fontSize: 8, fontWeight: 800, color: '#fb923c', textAlign: 'center' }}>BRONZE</div>
              {sfMatches.every(m => knockoutPredictions.semi[m.id]) ? sfMatches.map(sfMatch => {
                const winner = knockoutPredictions.semi[sfMatch.id]
                const loser = winner === sfMatch.team1 ? sfMatch.team2 : sfMatch.team1
                if (!loser || loser === '?') return null
                return (
                  <button key={sfMatch.id} onClick={() => setKnockoutPredictions(p => ({ ...p, third_place: loser }))}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 4, padding: '5px 6px', background: knockoutPredictions.third_place === loser ? 'rgba(251,146,60,0.15)' : 'transparent', borderLeft: `2px solid ${knockoutPredictions.third_place === loser ? '#fb923c' : 'transparent'}`, border: 'none', cursor: 'pointer' }}>
                    <img src={`https://flagcdn.com/w40/${FLAGS[loser] || 'un'}.png`} alt={loser} style={{ width: 16, height: 11, objectFit: 'cover', borderRadius: 1 }} />
                    <span style={{ flex: 1, fontSize: 9, fontWeight: 700, color: knockoutPredictions.third_place === loser ? '#fb923c' : '#e2e8f0', textAlign: 'left' }}>{loser}</span>
                    {knockoutPredictions.third_place === loser && <span style={{ color: '#fb923c', fontSize: 9 }}>🥉</span>}
                  </button>
                )
              }) : <p style={{ color: '#475569', fontSize: 9, textAlign: 'center', padding: '8px', fontStyle: 'italic', margin: 0 }}>Complete Semis</p>}
            </div>
          </div>
        </div>

        {/* RIGHT: SF → QF → R16 → R32 */}
        <BracketCol title="Semi Finals"   matches={sfMatches.slice(1, 2)}  predictions={knockoutPredictions.semi}    onPick={setSF}  totalH={totalH} />
        <BracketCol title="Quarter Finals" matches={qfMatches.slice(2, 4)} predictions={knockoutPredictions.quarter} onPick={setQF}  totalH={totalH} />
        <BracketCol title="Round of 16"   matches={r16Matches.slice(4, 8)} predictions={knockoutPredictions.r16}     onPick={setR16} totalH={totalH} />
        <BracketCol title="Round of 32"   matches={r32Matches.slice(8, 16)} predictions={knockoutPredictions.r32}    onPick={setR32} totalH={totalH} />

      </div>
    </div>
  )
}

// ── MAIN ──
function Predictions() {
  const [groups, setGroups] = useState({})
  const [groupPredictions, setGroupPredictions] = useState({})
  const [thirdPlaceAdvancing, setThirdPlaceAdvancing] = useState([])
  const [knockoutPredictions, setKnockoutPredictions] = useState({ r32: {}, r16: {}, quarter: {}, semi: {}, third_place: '', final: '' })
  const [goldenBall, setGoldenBall] = useState('')
  const [silverBall, setSilverBall] = useState('')
  const [bronzeBall, setBronzeBall] = useState('')
  const [goldenBoot, setGoldenBoot] = useState(['', '', ''])
  const [goldenGlove, setGoldenGlove] = useState(['', '', ''])
  const [u21Award, setU21Award] = useState(['', '', ''])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('groups')
  const [locked, setLocked] = useState(false)
  const [awardsLocked, setAwardsLocked] = useState(false)

  const token = localStorage.getItem('token')
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  useEffect(() => {
    axios.get(`${API_URL}/api/groups`).then(res => {
      setGroups(res.data)
      const initial = {}
      Object.keys(res.data).forEach(g => { initial[g] = [...res.data[g]] })
      setGroupPredictions(initial)
      setLoading(false)
      if (new Date() >= new Date('2026-06-13T20:30:00Z')) { setLocked(true); setAwardsLocked(true) }
      const token = localStorage.getItem('token')
      if (token) {
        axios.get(`${API_URL}/api/predictions`, { headers: { Authorization: `Bearer ${token}` } })
          .then(saved => {
            if (saved.data.saved) {
              if (Object.keys(saved.data.group_predictions).length > 0) setGroupPredictions(saved.data.group_predictions)
              if (saved.data.third_place_advancing.length > 0) setThirdPlaceAdvancing(saved.data.third_place_advancing)
              if (Object.keys(saved.data.knockout_predictions).length > 0) setKnockoutPredictions(saved.data.knockout_predictions)
              if (saved.data.golden_ball) setGoldenBall(saved.data.golden_ball)
              if (saved.data.silver_ball) setSilverBall(saved.data.silver_ball)
              if (saved.data.bronze_ball) setBronzeBall(saved.data.bronze_ball)
              if (saved.data.golden_boot?.length) setGoldenBoot(saved.data.golden_boot)
              if (saved.data.golden_glove?.length) setGoldenGlove(saved.data.golden_glove)
              if (saved.data.u21_award?.length) setU21Award(saved.data.u21_award)
              setLocked(true)
              if (saved.data.golden_ball || saved.data.golden_boot?.some(v => v)) setAwardsLocked(true)
            }
          }).catch(() => {})
      }
    })
  }, [])

  const handleDragEnd = (groupName, event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const teams = groupPredictions[groupName]
    setGroupPredictions(prev => ({ ...prev, [groupName]: arrayMove(teams, teams.indexOf(active.id), teams.indexOf(over.id)) }))
  }

  const payload = () => ({
    group_predictions: groupPredictions, third_place_advancing: thirdPlaceAdvancing,
    knockout_predictions: knockoutPredictions, golden_ball: goldenBall, silver_ball: silverBall,
    bronze_ball: bronzeBall, golden_boot: goldenBoot, golden_glove: goldenGlove, u21_award: u21Award,
  })

  const saveProgress = async () => {
    if (!token) { toast.error('Please login to save!'); return }
    if (locked) { toast.error('Predictions are locked!'); return }
    setSaving(true)
    try {
      await axios.post(`${API_URL}/api/predictions`, payload(), { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Progress saved!')
    } catch { toast.error('Error saving. Please try again.') }
    setSaving(false)
  }

  const savePredictions = async () => {
    if (!token) { toast.error('Please login to save predictions!'); return }
    if (locked) { toast.error('Predictions are locked!'); return }
    setSaving(true)
    try {
      await axios.post(`${API_URL}/api/predictions`, payload(), { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Predictions saved and locked! 🔒')
      setLocked(true)
      if (goldenBall || goldenBoot.some(v => v)) setAwardsLocked(true)
    } catch { toast.error('Error saving. Please try again.') }
    setSaving(false)
  }

  const saveAwards = async () => {
    if (!token) { toast.error('Please login to save!'); return }
    if (awardsLocked) { toast.error('Award predictions are locked!'); return }
    setSaving(true)
    try {
      await axios.post(`${API_URL}/api/predictions`, payload(), { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Award predictions saved and locked! 🔒')
      setAwardsLocked(true)
    } catch { toast.error('Error saving. Please try again.') }
    setSaving(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 16 }}>Loading predictions...</p>
    </div>
  )

  const r32Matches = getR32Matches(groupPredictions, thirdPlaceAdvancing)
  const r16Matches = getR16Matches(knockoutPredictions.r32)
  const qfMatches  = getQFMatches(knockoutPredictions.r16)
  const sfMatches  = getSFMatches(knockoutPredictions.quarter)
  const finalTeams = getFinalTeams(knockoutPredictions.semi)

  const TABS = [
    { id: 'groups',   label: 'Group Stage' },
    { id: 'third',    label: '3rd Place' },
    { id: 'knockout', label: 'Knockout' },
    { id: 'awards',   label: 'Awards' },
    { id: 'picks',    label: 'Match Picks' },
    { id: 'second',   label: 'Second Chance', soon: true },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#var(--bg)', color: '#fff', fontFamily: 'Barlow, system-ui, sans-serif' }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, var(--accent), #8b5cf6, #ec4899, #14b8a6, #f59e0b, #84cc16, #6366f1)' }} />

      <div style={{ maxWidth: '100%', margin: '0 auto', padding: '32px 16px 80px' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>FIFA World Cup 2026</div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', fontFamily: 'Bebas Neue, sans-serif' }}>Your Predictions</h1>
          <p style={{ color: '#64748b', marginTop: 6, fontSize: 14 }}>Drag teams to rank each group, then fill in the knockout bracket.</p>
        </div>

        {locked && (
          <div style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>🔒</span>
            <div>
              <p style={{ fontWeight: 700, color: '#fbbf24', margin: 0, fontSize: 14 }}>Predictions Locked</p>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: 13, marginTop: 2 }}>
                {new Date() >= new Date('2026-06-11T19:00:00Z') ? 'The World Cup has started! See you at the Second Chance 😉' : "You've already submitted. They cannot be changed."}
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 24, scrollbarWidth: 'none' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ position: 'relative', flexShrink: 0, padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s', border: 'none', background: activeTab === tab.id ? 'var(--accent)' : 'rgba(255,255,255,0.05)', color: activeTab === tab.id ? '#fff' : '#94a3b8', boxShadow: activeTab === tab.id ? '0 4px 16px rgba(59,130,246,0.3)' : 'none' }}>
              {tab.label}
              {tab.soon && <span style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 5px', borderRadius: 20 }}>SOON</span>}
            </button>
          ))}
        </div>

        {/* Match Picks */}
        {activeTab === 'picks' && <MatchPicks token={token} />}

        {/* Group Stage */}
        {activeTab === 'groups' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {Object.entries(groups).map(([groupName], gi) => {
                const color = GROUP_COLORS[GROUP_LETTERS.indexOf(groupName)] || 'var(--accent)'
                return (
                  <motion.div key={groupName} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.04 }}
                    style={{ background: '#0d1526', border: `1px solid ${color}30`, borderRadius: 14, padding: 18, borderTop: `3px solid ${color}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <span style={{ width: 28, height: 28, borderRadius: 6, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#000', flexShrink: 0 }}>{groupName}</span>
                      <span style={{ fontWeight: 800, fontSize: 15, color: '#f1f5f9' }}>Group {groupName}</span>
                    </div>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={e => handleDragEnd(groupName, e)}>
                      <SortableContext items={groupPredictions[groupName] || []} strategy={verticalListSortingStrategy}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {groupPredictions[groupName]?.map((team, index) => (
                            <SortableTeam key={team} team={team} index={index} total={groupPredictions[groupName].length}
                              onMove={(from, to) => {
                                if (to < 0 || to >= groupPredictions[groupName].length) return
                                setGroupPredictions(prev => ({ ...prev, [groupName]: arrayMove(prev[groupName], from, to) }))
                              }} />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, paddingInline: 2 }}>
                      <span style={{ color: '#22c55e' }}>🟢 1st & 2nd advance</span>
                      <span style={{ color: '#f59e0b' }}>🟡 3rd maybe</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
            {!locked && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
                <button onClick={saveProgress} disabled={saving} style={{ background: 'linear-gradient(135deg, var(--accent), #1d4ed8)', color: '#fff', fontWeight: 700, fontSize: 14, padding: '12px 28px', borderRadius: 100, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(59,130,246,0.3)', opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'Saving...' : '💾 Save Group Stage'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3rd Place */}
        {activeTab === 'third' && (
          <div>
            <div style={{ background: '#0d1526', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14, padding: 20, marginBottom: 20, borderTop: '3px solid #f59e0b' }}>
              <h2 style={{ fontWeight: 800, fontSize: 18, color: '#fbbf24', margin: '0 0 6px' }}>Select 8 Best 3rd Place Teams</h2>
              <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 8px' }}>8 of the 12 third-place teams advance to the Round of 32.</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: thirdPlaceAdvancing.length === 8 ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${thirdPlaceAdvancing.length === 8 ? '#22c55e' : '#f59e0b'}40`, borderRadius: 100, padding: '4px 12px' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: thirdPlaceAdvancing.length === 8 ? '#22c55e' : '#fbbf24' }}>{thirdPlaceAdvancing.length}/8 selected</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
              {Object.entries(groups).map(([groupName], gi) => {
                const thirdTeam = groupPredictions[groupName]?.[2]
                if (!thirdTeam) return null
                const isSelected = thirdPlaceAdvancing.includes(thirdTeam)
                const color = GROUP_COLORS[GROUP_LETTERS.indexOf(groupName)] || 'var(--accent)'
                return (
                  <motion.div key={groupName} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.04 }}
                    onClick={() => {
                      if (isSelected) { setThirdPlaceAdvancing(prev => prev.filter(t => t !== thirdTeam)) }
                      else { if (thirdPlaceAdvancing.length >= 8) { toast.error('You can only select 8!'); return } setThirdPlaceAdvancing(prev => [...prev, thirdTeam]) }
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, cursor: 'pointer', background: isSelected ? `${color}12` : '#0d1526', border: `2px solid ${isSelected ? color : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.15s' }}>
                    <span style={{ width: 32, height: 32, borderRadius: 8, background: isSelected ? color : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: isSelected ? '#000' : '#64748b', flexShrink: 0 }}>{groupName}</span>
                    <img src={`https://flagcdn.com/w40/${FLAGS[thirdTeam] || 'un'}.png`} alt={thirdTeam} style={{ width: 36, height: 24, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9', margin: 0 }}>{thirdTeam}</p>
                      <p style={{ color: '#475569', fontSize: 11, margin: 0 }}>3rd — Group {groupName}</p>
                    </div>
                    {isSelected && <span style={{ color, fontSize: 16, fontWeight: 900 }}>✓</span>}
                  </motion.div>
                )
              })}
            </div>
            {!locked && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
                <button onClick={saveProgress} disabled={saving} style={{ background: 'linear-gradient(135deg, var(--accent), #1d4ed8)', color: '#fff', fontWeight: 700, fontSize: 14, padding: '12px 28px', borderRadius: 100, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(59,130,246,0.3)', opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'Saving...' : '💾 Save 3rd Place Picks'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Knockout */}
        {activeTab === 'knockout' && (
          <div>
            {Object.keys(groupPredictions).length < 12 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px' }}><p style={{ color: '#fbbf24', fontWeight: 700, fontSize: 16 }}>Complete Group Stage first!</p></div>
            ) : thirdPlaceAdvancing.length < 8 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px' }}><p style={{ color: '#fbbf24', fontWeight: 700, fontSize: 16 }}>Select all 8 third-place teams first!</p></div>
            ) : (
              <>
                <div style={{ background: '#0d1526', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 14, padding: 18, marginBottom: 20, borderTop: '3px solid var(--accent)' }}>
                  <h2 style={{ fontWeight: 800, fontSize: 18, color: '#93c5fd', margin: '0 0 4px' }}>Knockout Bracket</h2>
                  <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>Tap a team to advance them through the bracket.</p>
                </div>

                <KnockoutBracket
                  r32Matches={r32Matches}
                  r16Matches={r16Matches}
                  qfMatches={qfMatches}
                  sfMatches={sfMatches}
                  finalTeams={finalTeams}
                  knockoutPredictions={knockoutPredictions}
                  setKnockoutPredictions={setKnockoutPredictions}
                />

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 24 }}>
                  <button onClick={savePredictions} disabled={saving || locked}
                    style={{ background: locked ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #22c55e, #16a34a)', color: locked ? '#64748b' : '#000', fontWeight: 800, fontSize: 15, padding: '14px 40px', borderRadius: 100, border: 'none', cursor: locked ? 'not-allowed' : 'pointer', boxShadow: locked ? 'none' : '0 4px 20px rgba(34,197,94,0.3)', opacity: saving ? 0.7 : 1 }}>
                    {locked ? '🔒 Predictions Locked' : saving ? 'Saving...' : '🔒 Submit & Lock All Predictions'}
                  </button>
                  {!locked && <p style={{ color: '#475569', fontSize: 12 }}>Once submitted, predictions cannot be changed</p>}
                </div>
              </>
            )}
          </div>
        )}

        {/* Awards */}
        {activeTab === 'awards' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 480px))', gap: 16, justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: '#0d1526', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 14, padding: 20, borderTop: '3px solid #fbbf24' }}>
              <h2 style={{ color: '#fbbf24', fontWeight: 800, fontSize: 16, margin: '0 0 4px' }}>Best Players</h2>
              <p style={{ color: '#475569', fontSize: 12, margin: '0 0 14px' }}>Best overall players of the tournament voted by FIFA</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: '🥇 Golden Ball (15pts)', value: goldenBall, setter: setGoldenBall, ring: 'focus-within:ring-yellow-400' },
                  { label: '🥈 Silver Ball (10pts)', value: silverBall, setter: setSilverBall, ring: 'focus-within:ring-gray-400' },
                  { label: '🥉 Bronze Ball (5pts)', value: bronzeBall, setter: setBronzeBall, ring: 'focus-within:ring-orange-400' },
                ].map(({ label, value, setter, ring }) => (
                  <div key={label}>
                    <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6, fontWeight: 600 }}>{label}</label>
                    <PlayerSearch value={value} onChange={val => setter(val)} placeholder="Search player..." ringColor={ring} />
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              style={{ background: '#0d1526', border: '1px solid rgba(251,146,60,0.2)', borderRadius: 14, padding: 20, borderTop: '3px solid #fb923c' }}>
              <h2 style={{ color: '#fb923c', fontWeight: 800, fontSize: 16, margin: '0 0 4px' }}>Golden Boot</h2>
              <p style={{ color: '#475569', fontSize: 12, margin: '0 0 14px' }}>1st: 12pts · 2nd: 8pts · 3rd: 4pts</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {['1st Choice', '2nd Choice', '3rd Choice'].map((label, i) => (
                  <div key={label}>
                    <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6, fontWeight: 600 }}>{label}</label>
                    <PlayerSearch value={goldenBoot[i]} onChange={val => { const u = [...goldenBoot]; u[i] = val; setGoldenBoot(u) }} placeholder="Search player..." ringColor="focus-within:ring-orange-400" />
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              style={{ background: '#0d1526', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 14, padding: 20, borderTop: '3px solid #a855f7' }}>
              <h2 style={{ color: '#c084fc', fontWeight: 800, fontSize: 16, margin: '0 0 4px' }}>🌟 Best U21 Player</h2>
              <p style={{ color: '#475569', fontSize: 12, margin: '0 0 14px' }}>1st: 12pts · 2nd: 8pts · 3rd: 4pts — Born Jan 1, 2005 or later</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {['1st Choice', '2nd Choice', '3rd Choice'].map((label, i) => (
                  <div key={label}>
                    <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6, fontWeight: 600 }}>{label}</label>
                    <PlayerSearch value={u21Award[i]} onChange={val => { const u = [...u21Award]; u[i] = val; setU21Award(u) }} placeholder="Search U21 player..." ringColor="focus-within:ring-purple-400" playerList={U21_PLAYERS} />
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ background: '#0d1526', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 14, padding: 20, borderTop: '3px solid var(--accent)' }}>
              <h2 style={{ color: '#60a5fa', fontWeight: 800, fontSize: 16, margin: '0 0 4px' }}>Golden Glove</h2>
              <p style={{ color: '#475569', fontSize: 12, margin: '0 0 14px' }}>1st: 12pts · 2nd: 8pts · 3rd: 4pts</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {['1st Choice', '2nd Choice', '3rd Choice'].map((label, i) => (
                  <div key={label}>
                    <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6, fontWeight: 600 }}>{label}</label>
                    <PlayerSearch value={goldenGlove[i]} onChange={val => { const u = [...goldenGlove]; u[i] = val; setGoldenGlove(u) }} placeholder="Search player..." ringColor="focus-within:ring-blue-400" />
                  </div>
                ))}
              </div>
            </motion.div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <button onClick={saveAwards} disabled={saving || awardsLocked}
                style={{ background: awardsLocked ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #a855f7, #7c3aed)', color: awardsLocked ? '#64748b' : '#fff', fontWeight: 800, fontSize: 15, padding: '14px 36px', borderRadius: 100, border: 'none', cursor: awardsLocked ? 'not-allowed' : 'pointer', boxShadow: awardsLocked ? 'none' : '0 4px 20px rgba(168,85,247,0.3)', opacity: saving ? 0.7 : 1 }}>
                {awardsLocked ? '🔒 Awards Locked' : saving ? 'Saving...' : '🔒 Submit & Lock Award Predictions'}
              </button>
              {!awardsLocked && <p style={{ color: '#475569', fontSize: 12 }}>Once submitted, award predictions cannot be changed</p>}
            </div>
          </div>
        )}

        {/* Second Chance */}
        {activeTab === 'second' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🔄</div>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: '#f1f5f9', margin: '0 0 10px' }}>Second Chance</h2>
              <p style={{ color: '#64748b', fontSize: 16, margin: '0 0 6px' }}>Coming after the Group Stage ends!</p>
              <p style={{ color: '#475569', fontSize: 13, maxWidth: 420, margin: '0 auto 28px', lineHeight: 1.6 }}>Once all group matches finish on June 27, you'll get a fresh bracket prediction for the knockout stage.</p>
              <div style={{ background: '#0d1526', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 14, padding: '20px 32px', display: 'inline-block' }}>
                <p style={{ color: '#fbbf24', fontWeight: 800, fontSize: 16, margin: 0 }}>Opens: June 28, 2026</p>
                <p style={{ color: '#475569', fontSize: 13, margin: '4px 0 0' }}>After all group results are confirmed</p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} } input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; } input[type=number] { -moz-appearance: textfield; }`}</style>
    </div>
  )
}

export default Predictions