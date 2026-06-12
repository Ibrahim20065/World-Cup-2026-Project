import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import API_URL from '../config'

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
  '#06b6d4','#3b82f6','#8b5cf6','#ec4899',
  '#14b8a6','#f59e0b','#84cc16','#6366f1',
]
const GROUP_LETTERS = ['A','B','C','D','E','F','G','H','I','J','K','L']

const GROUPS = {
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

function getGroupColor(group) {
  const idx = GROUP_LETTERS.indexOf(group)
  return idx >= 0 ? GROUP_COLORS[idx] : '#3b82f6'
}

function GroupTable({ group, standings, color }) {
  const teams = GROUPS[group] || []

  // Sort teams by standings data, fallback to default order
  const sorted = [...teams].sort((a, b) => {
    const sa = standings[group]?.find(x => x.team === a) || { points: 0, gd: 0, gf: 0 }
    const sb = standings[group]?.find(x => x.team === b) || { points: 0, gd: 0, gf: 0 }
    if (sb.points !== sa.points) return sb.points - sa.points
    if (sb.gd !== sa.gd) return sb.gd - sa.gd
    return sb.gf - sa.gf
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#0d1526',
        border: `1px solid ${color}25`,
        borderTop: `3px solid ${color}`,
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      {/* Group header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: `${color}08`,
      }}>
        <span style={{
          width: 28, height: 28, borderRadius: 6,
          background: color, color: '#000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 900, flexShrink: 0,
        }}>{group}</span>
        <span style={{ fontWeight: 800, fontSize: 15, color: '#f1f5f9' }}>Group {group}</span>
      </div>

      {/* Table header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '24px 1fr 32px 32px 32px 32px 32px 32px 40px',
        padding: '6px 14px',
        fontSize: 10, fontWeight: 700, color: '#334155',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <span>#</span>
        <span>Team</span>
        <span style={{ textAlign: 'center' }}>P</span>
        <span style={{ textAlign: 'center' }}>W</span>
        <span style={{ textAlign: 'center' }}>D</span>
        <span style={{ textAlign: 'center' }}>L</span>
        <span style={{ textAlign: 'center' }}>GD</span>
        <span style={{ textAlign: 'center' }}>GF</span>
        <span style={{ textAlign: 'center' }}>Pts</span>
      </div>

      {/* Rows */}
      {sorted.map((team, i) => {
        const s = standings[group]?.find(x => x.team === team) || {
          played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0
        }
        const advancing = i < 2
        const maybe = i === 2
        const rowBg = advancing ? `${color}08` : 'transparent'

        return (
          <div key={team} style={{
            display: 'grid',
            gridTemplateColumns: '24px 1fr 32px 32px 32px 32px 32px 32px 40px',
            padding: '9px 14px',
            alignItems: 'center',
            borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.03)' : 'none',
            background: rowBg,
            borderLeft: advancing ? `3px solid ${color}` : maybe ? '3px solid #f59e0b' : '3px solid transparent',
            transition: 'background 0.15s',
          }}>
            <span style={{
              fontSize: 11, fontWeight: 800,
              color: advancing ? color : maybe ? '#f59e0b' : '#334155',
            }}>{i + 1}</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <img
                src={`https://flagcdn.com/w40/${FLAGS[team] || 'un'}.png`}
                alt={team}
                style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }}
                onError={e => { e.target.style.display = 'none' }}
              />
              <span style={{
                fontWeight: 700, fontSize: 13, color: '#e2e8f0',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{team}</span>
            </div>

            <span style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{s.played}</span>
            <span style={{ textAlign: 'center', fontSize: 13, color: '#22c55e', fontWeight: 600 }}>{s.won}</span>
            <span style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{s.drawn}</span>
            <span style={{ textAlign: 'center', fontSize: 13, color: '#ef4444', fontWeight: 600 }}>{s.lost}</span>
            <span style={{
              textAlign: 'center', fontSize: 13, fontWeight: 700,
              color: s.gd > 0 ? '#22c55e' : s.gd < 0 ? '#ef4444' : '#94a3b8',
            }}>{s.gd > 0 ? '+' : ''}{s.gd}</span>
            <span style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{s.gf}</span>
            <span style={{
              textAlign: 'center', fontSize: 15, fontWeight: 900,
              color: s.points > 0 ? color : '#475569',
            }}>{s.points}</span>
          </div>
        )
      })}

      {/* Legend */}
      <div style={{
        display: 'flex', gap: 12, padding: '8px 14px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(255,255,255,0.01)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: 1, background: color }} />
          <span style={{ fontSize: 10, color: '#334155', fontWeight: 600 }}>Advance</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: 1, background: '#f59e0b' }} />
          <span style={{ fontSize: 10, color: '#334155', fontWeight: 600 }}>Maybe 3rd</span>
        </div>
      </div>
    </motion.div>
  )
}

function Standings() {
  const [standings, setStandings] = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    axios.get(`${API_URL}/api/standings`)
      .then(res => { setStandings(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const displayGroups = filter === 'ALL' ? GROUP_LETTERS : [filter]

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
        <p style={{ color: '#3b82f6', fontWeight: 700, fontSize: 16 }}>Loading standings...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff', fontFamily: 'Barlow, system-ui, sans-serif' }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #14b8a6, #f59e0b, #84cc16, #6366f1)' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>FIFA World Cup 2026</div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.02em', fontFamily: 'Bebas Neue, sans-serif' }}>
            Group Standings 📊
          </h1>
          <p style={{ color: '#64748b', marginTop: 6, fontSize: 14 }}>
            Live group tables — updated after each match. Top 2 + best 8 third-place teams advance.
          </p>
        </div>

        {/* Group filter */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 28 }}>
          <button onClick={() => setFilter('ALL')}
            style={{
              padding: '6px 14px', borderRadius: 8, fontWeight: 700, fontSize: 12,
              cursor: 'pointer', border: 'none', transition: 'all 0.15s',
              background: filter === 'ALL' ? '#3b82f6' : 'rgba(255,255,255,0.05)',
              color: filter === 'ALL' ? '#fff' : '#64748b',
            }}>All Groups</button>
          {GROUP_LETTERS.map((g, i) => (
            <button key={g} onClick={() => setFilter(g)}
              style={{
                width: 36, height: 32, borderRadius: 8, fontWeight: 800, fontSize: 13,
                cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                background: filter === g ? GROUP_COLORS[i] : 'rgba(255,255,255,0.05)',
                color: filter === g ? '#000' : '#64748b',
              }}>{g}</button>
          ))}
        </div>

        {/* Group tables */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: filter === 'ALL' ? 'repeat(auto-fill, minmax(480px, 1fr))' : '1fr',
          gap: 16,
        }}>
          {displayGroups.map((g, i) => (
            <GroupTable
              key={g}
              group={g}
              standings={standings}
              color={getGroupColor(g)}
            />
          ))}
        </div>

        <style>{`
  @media (max-width: 640px) {
    .standings-grid > div > div {
      grid-template-columns: 20px 1fr 26px 26px 26px 32px !important;
    }
    .standings-grid > div > div span:nth-child(4),
    .standings-grid > div > div span:nth-child(5) {
      display: none;
    }
  }
`}</style>

<div className="standings-grid" style={{
  display: 'grid',
  gridTemplateColumns: filter === 'ALL' ? 'repeat(auto-fill, minmax(480px, 1fr))' : '1fr',
  gap: 16,
}}></div>

        {/* Last updated note */}
        <p style={{ color: '#334155', fontSize: 12, textAlign: 'center', marginTop: 32 }}>
          Standings are updated manually by the admin after each match. Refresh for the latest! 🔄
        </p>
      </div>

      <style>{`
  @media (max-width: 640px) {
    .standings-grid { grid-template-columns: 1fr !important; }
  }
`}</style>
    </div>
  )
}

export default Standings