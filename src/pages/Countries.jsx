import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import COUNTRY_DATA from '../countryData'
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

const GROUP_COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e',
  '#06b6d4','#3b82f6','#8b5cf6','#ec4899',
  '#14b8a6','#f59e0b','#84cc16','#6366f1',
]
const GROUP_LETTERS = ['A','B','C','D','E','F','G','H','I','J','K','L']

function Countries() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filteredGroups = Object.entries(GROUPS).reduce((acc, [group, teams]) => {
    const filtered = teams.filter(t => t.toLowerCase().includes(search.toLowerCase()))
    if (filtered.length > 0) acc[group] = filtered
    return acc
  }, {})

  const handleCountryClick = (country) => {
    navigate(`/countries/${country.toLowerCase().replace(/ /g, '-')}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080d1a', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Top color bar */}
      <div style={{
  height: 3,
  background: 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #14b8a6, #f59e0b, #84cc16, #6366f1)',
}} />      

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            FIFA World Cup 2026
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Countries <span style={{ color: '#3b82f6' }}>🌍</span>
          </h1>
          <p style={{ color: '#475569', fontSize: 14, margin: 0 }}>
            All 48 nations at World Cup 2026 — tap a country to see their full profile.
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: 360, marginBottom: 32 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15, pointerEvents: 'none' }}>🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search a country..."
            style={{
              width: '100%', background: '#0d1526',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#f1f5f9', padding: '10px 16px 10px 40px',
              borderRadius: 10, fontSize: 14, outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#3b82f6'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
        </div>

        {/* Groups grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {Object.entries(filteredGroups).map(([group, teams], gi) => {
            const color = GROUP_COLORS[GROUP_LETTERS.indexOf(group)] || '#3b82f6'
            return (
              <motion.div
                key={group}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.04 }}
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
                  padding: '14px 16px 12px',
                  borderBottom: `1px solid ${color}15`,
                }}>
                  <span style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: color, color: '#000',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 900, flexShrink: 0,
                  }}>{group}</span>
                  <span style={{ fontWeight: 800, fontSize: 15, color: '#f1f5f9' }}>Group {group}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: '#334155', fontWeight: 600 }}>
                    {teams.length} teams
                  </span>
                </div>

                {/* Team list */}
                <div style={{ padding: '8px 0' }}>
                  {teams.map((team, ti) => {
                    const hasData = !!COUNTRY_DATA[team]
                    return (
                      <button
                        key={team}
                        onClick={() => hasData && handleCountryClick(team)}
                        disabled={!hasData}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 16px', background: 'transparent', border: 'none',
                          cursor: hasData ? 'pointer' : 'not-allowed',
                          opacity: hasData ? 1 : 0.45,
                          transition: 'background 0.15s',
                          textAlign: 'left',
                        }}
                        onMouseEnter={e => { if (hasData) e.currentTarget.style.background = `${color}10` }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                      >
                        {/* Position badge */}
                        <span style={{
                          width: 20, height: 20, borderRadius: 5,
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 700, color: '#475569', flexShrink: 0,
                        }}>{ti + 1}</span>

                        <img
                          src={`https://flagcdn.com/w40/${FLAGS[team] || 'un'}.png`}
                          alt={team}
                          style={{ width: 34, height: 23, objectFit: 'cover', borderRadius: 3, flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
                          onError={e => { e.target.style.display = 'none' }}
                        />

                        <span style={{ flex: 1, fontWeight: 600, fontSize: 13, color: '#e2e8f0' }}>{team}</span>

                        {hasData ? (
                          <span style={{ fontSize: 11, fontWeight: 700, color: color, flexShrink: 0 }}>View →</span>
                        ) : (
                          <span style={{ fontSize: 10, fontWeight: 600, color: '#334155', flexShrink: 0 }}>Soon</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </div>

        {Object.keys(filteredGroups).length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <p style={{ color: '#475569', fontSize: 16, fontWeight: 600 }}>No countries found for "{search}"</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Countries
