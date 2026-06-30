import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  'Bosnia & Herzegovina': 'ba',
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

const CONTINENTS = {
  'CONCACAF': ['Mexico', 'USA', 'Canada', 'Panama', 'Haiti', 'Curacao'],
  'CONMEBOL': ['Brazil', 'Argentina', 'Colombia', 'Ecuador', 'Uruguay', 'Paraguay', 'Chile'],
  'UEFA': ['Germany', 'France', 'Spain', 'England', 'Netherlands', 'Portugal', 'Belgium', 'Croatia', 'Austria', 'Switzerland', 'Scotland', 'Sweden', 'Norway', 'Czech Republic'],
  'CAF': ['Morocco', 'Senegal', 'Egypt', 'Ivory Coast', 'Ghana', 'South Africa', 'Tunisia', 'Algeria', 'DR Congo'],
  'AFC': ['Japan', 'South Korea', 'Australia', 'Iran', 'Saudi Arabia', 'Qatar', 'Jordan', 'Uzbekistan', 'Iraq'],
  'OFC': ['New Zealand'],
  'Other': ['Bosnia & Herzegovina', 'Bosnia', 'Turkey', 'Cape Verde'],
}

const CONTINENT_COLORS = {
  'CONCACAF': '#ef4444',
  'CONMEBOL': '#22c55e',
  'UEFA':     '#3b82f6',
  'CAF':      '#f59e0b',
  'AFC':      '#8b5cf6',
  'OFC':      '#06b6d4',
  'Other':    '#64748b',
}

function getContinent(team) {
  for (const [continent, teams] of Object.entries(CONTINENTS)) {
    if (teams.includes(team)) return continent
  }
  return 'Other'
}

const CARD_H = 56
const CARD_W = 130
const COL_GAP = 10

// ── Live Bracket — fetches real R32 matchups from backend ──
function R32Card({ match }) {
  const tbd1 = !match.team1 || match.team1 === '?'
  const tbd2 = !match.team2 || match.team2 === '?'
  return (
    <div style={{ background: '#0f1729', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden', width: CARD_W }}>
      <div style={{ background: 'rgba(255,255,255,0.04)', padding: '2px 6px', fontSize: 8, fontWeight: 700, color: '#64748b', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>M{match.match}</div>
      {[{ team: match.team1, tbd: tbd1 }, { team: match.team2, tbd: tbd2 }].map(({ team, tbd }, i) => (
        <div key={i}>
          {i === 1 && <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 6px', opacity: tbd ? 0.3 : 1 }}>
            {!tbd && <img src={`https://flagcdn.com/w40/${FLAGS[team] || 'un'}.png`} alt={team} style={{ width: 16, height: 11, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />}
            <span style={{ flex: 1, fontSize: 9, fontWeight: 700, color: tbd ? '#475569' : '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tbd ? 'TBD' : team}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyCard() {
  return (
    <div style={{ background: '#0f1729', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden', width: CARD_W }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2px 6px', fontSize: 8, fontWeight: 700, color: '#334155', textAlign: 'center' }}>TBD</div>
      {[0, 1].map(i => (
        <div key={i}>
          {i === 1 && <div style={{ height: 1, background: 'rgba(255,255,255,0.04)' }} />}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 6px' }}>
            <div style={{ width: 16, height: 11, borderRadius: 1, background: 'rgba(255,255,255,0.04)', flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 9, fontWeight: 600, color: '#334155' }}>TBD</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function BracketCol({ title, count, matches, totalH, isR32 = false }) {
  const slotH = totalH / count
  return (
    <div style={{ flexShrink: 0, width: CARD_W }}>
      <div style={{ fontSize: 8, fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', marginBottom: 6 }}>{title}</div>
      <div style={{ position: 'relative', height: totalH }}>
        {Array.from({ length: count }).map((_, i) => {
          const top = i * slotH + (slotH - CARD_H) / 2
          const match = matches?.[i]
          return (
            <div key={i} style={{ position: 'absolute', top, left: 0 }}>
              {isR32 && match ? <R32Card match={match} /> : <EmptyCard />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function KnockoutCard({ match_id, results }) {
  const result = results[match_id]
  const team1 = result?.team1 || 'TBD'
  const team2 = result?.team2 || 'TBD'
  const winner = result?.winner || null
  const tbd1 = team1 === 'TBD'
  const tbd2 = team2 === 'TBD'
  return (
    <div style={{ background: '#0f1729', border: `1px solid ${winner ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 6, overflow: 'hidden', width: CARD_W }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2px 6px', fontSize: 8, fontWeight: 700, color: '#334155', textAlign: 'center', textTransform: 'uppercase' }}>M{match_id}</div>
      {[{ team: team1, tbd: tbd1 }, { team: team2, tbd: tbd2 }].map(({ team, tbd }, i) => {
        const isWinner = winner === team
        return (
          <div key={i}>
            {i === 1 && <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 6px', opacity: tbd ? 0.3 : 1, background: isWinner ? 'rgba(34,197,94,0.1)' : 'transparent', borderLeft: `2px solid ${isWinner ? '#22c55e' : 'transparent'}` }}>
              {!tbd && <img src={`https://flagcdn.com/w40/${FLAGS[team] || 'un'}.png`} alt={team} style={{ width: 16, height: 11, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />}
              <span style={{ flex: 1, fontSize: 9, fontWeight: 700, color: isWinner ? '#22c55e' : tbd ? '#475569' : '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tbd ? 'TBD' : team}</span>
              {isWinner && <span style={{ fontSize: 8, color: '#22c55e' }}>✓</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function KnockoutBracketCol({ title, matchIds, results, totalH }) {
  const count = matchIds.length
  const slotH = totalH / count
  return (
    <div style={{ flexShrink: 0, width: CARD_W }}>
      <div style={{ fontSize: 8, fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', marginBottom: 6 }}>{title}</div>
      <div style={{ position: 'relative', height: totalH }}>
        {matchIds.map((mid, i) => {
          const top = i * slotH + (slotH - CARD_H) / 2
          return (
            <div key={mid} style={{ position: 'absolute', top, left: 0 }}>
              {mid ? <KnockoutCard match_id={mid} results={results} /> : <EmptyCard />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LiveBracketTab() {
  const [r32, setR32] = useState([])
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/second-chance/matchups`),
      axios.get(`${API_URL}/api/knockout-results`),
    ]).then(([matchupsRes, resultsRes]) => {
      // Reorder R32 into bracket visual order
      const byNum = {}
      matchupsRes.data.forEach(m => { byNum[m.match] = m })
      const order = [74, 77, 73, 75, 83, 84, 81, 82, 76, 78, 79, 80, 86, 88, 85, 87]
      setR32(order.map(n => byNum[n]).filter(Boolean))

      // Build results map keyed by match_id
      const rMap = {}
      resultsRes.data.forEach(r => { rMap[r.match_id] = r })
      setResults(rMap)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const N = 8
  const totalH = N * CARD_H + (N - 1) * 8

  // Wire R16 teams from R32 winners
  // R16 match IDs and their R32 feeder matches
  const r16Left  = [
    { mid: 89, t1: results[74]?.winner, t2: results[77]?.winner },
    { mid: 90, t1: results[73]?.winner, t2: results[75]?.winner },
    { mid: 93, t1: results[83]?.winner, t2: results[84]?.winner },
    { mid: 94, t1: results[81]?.winner, t2: results[82]?.winner },
  ]
  const r16Right = [
    { mid: 91, t1: results[76]?.winner, t2: results[78]?.winner },
    { mid: 92, t1: results[79]?.winner, t2: results[80]?.winner },
    { mid: 95, t1: results[86]?.winner, t2: results[88]?.winner },
    { mid: 96, t1: results[85]?.winner, t2: results[87]?.winner },
  ]

  // Merge computed teams into results map for KnockoutCard to use
  const enrichedResults = { ...results }
  ;[...r16Left, ...r16Right].forEach(({ mid, t1, t2 }) => {
    enrichedResults[mid] = { ...(results[mid] || {}), match_id: mid, team1: t1 || 'TBD', team2: t2 || 'TBD', winner: results[mid]?.winner || null }
  })

  const qfLeft = [
    { mid: 97, t1: enrichedResults[89]?.winner, t2: enrichedResults[90]?.winner },
    { mid: 98, t1: enrichedResults[93]?.winner, t2: enrichedResults[94]?.winner },
  ]
  const qfRight = [
    { mid: 99,  t1: enrichedResults[91]?.winner, t2: enrichedResults[92]?.winner },
    { mid: 100, t1: enrichedResults[95]?.winner, t2: enrichedResults[96]?.winner },
  ]
  ;[...qfLeft, ...qfRight].forEach(({ mid, t1, t2 }) => {
    enrichedResults[mid] = { ...(results[mid] || {}), match_id: mid, team1: t1 || 'TBD', team2: t2 || 'TBD', winner: results[mid]?.winner || null }
  })

  const sfLeft  = [{ mid: 101, t1: enrichedResults[97]?.winner,  t2: enrichedResults[98]?.winner  }]
  const sfRight = [{ mid: 102, t1: enrichedResults[99]?.winner,  t2: enrichedResults[100]?.winner }]
  ;[...sfLeft, ...sfRight].forEach(({ mid, t1, t2 }) => {
    enrichedResults[mid] = { ...(results[mid] || {}), match_id: mid, team1: t1 || 'TBD', team2: t2 || 'TBD', winner: results[mid]?.winner || null }
  })

  const finalist1 = enrichedResults[101]?.winner
  const finalist2 = enrichedResults[102]?.winner
  const champion  = enrichedResults[104]?.winner
  const sf101loser = enrichedResults[101]?.winner ? (enrichedResults[101].winner === enrichedResults[101].team1 ? enrichedResults[101].team2 : enrichedResults[101].team1) : null
  const sf102loser = enrichedResults[102]?.winner ? (enrichedResults[102].winner === enrichedResults[102].team1 ? enrichedResults[102].team2 : enrichedResults[102].team1) : null

  const finalResult = {
    104: { match_id: 104, team1: finalist1 || 'TBD', team2: finalist2 || 'TBD', winner: champion || null }
  }
  const thirdResult = {
    103: { match_id: 103, team1: sf101loser || 'TBD', team2: sf102loser || 'TBD', winner: enrichedResults[103]?.winner || null }
  }

  const teamRow = (team, isWinner) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 6px', background: isWinner ? 'rgba(251,191,36,0.15)' : 'transparent', borderLeft: `2px solid ${isWinner ? '#fbbf24' : 'transparent'}` }}>
      {team && team !== 'TBD' && <img src={`https://flagcdn.com/w40/${FLAGS[team] || 'un'}.png`} alt={team} style={{ width: 16, height: 11, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />}
      <span style={{ flex: 1, fontSize: 9, fontWeight: 700, color: isWinner ? '#fbbf24' : (!team || team === 'TBD') ? '#475569' : '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team || 'TBD'}</span>
      {isWinner && <span style={{ fontSize: 9 }}>🏆</span>}
    </div>
  )

  return (
    <div>
      <div style={{ background: '#0d1526', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 14, padding: '16px 20px', marginBottom: 24, borderTop: '3px solid #3b82f6', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h2 style={{ fontWeight: 900, fontSize: 20, color: '#93c5fd', margin: 0, fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.05em' }}>LIVE BRACKET</h2>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 100, animation: 'livePulse 2s infinite' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
              LIVE
            </span>
          </div>
          <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>Knockout stage is underway! Results update as teams progress.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 20px' }}>
          <p style={{ color: '#3b82f6', fontWeight: 700, fontSize: 16 }}>Loading bracket...</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none', paddingBottom: 8 }}>
          <div style={{ display: 'flex', gap: COL_GAP, alignItems: 'flex-start', paddingBottom: 8, minWidth: 'max-content' }}>

            {/* LEFT R32 */}
            <BracketCol title="Round of 32" count={8} matches={r32.slice(0, 8)} totalH={totalH} isR32={true} />

            {/* LEFT R16 */}
            <KnockoutBracketCol title="Round of 16" matchIds={r16Left.map(m => m.mid)} results={enrichedResults} totalH={totalH} />

            {/* LEFT QF */}
            <KnockoutBracketCol title="Quarter Finals" matchIds={qfLeft.map(m => m.mid)} results={enrichedResults} totalH={totalH} />

            {/* LEFT SF */}
            <KnockoutBracketCol title="Semi Finals" matchIds={sfLeft.map(m => m.mid)} results={enrichedResults} totalH={totalH} />

            {/* CENTRE */}
            <div style={{ flexShrink: 0, width: CARD_W + 20, height: totalH + 28, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
              <div>
                <div style={{ fontSize: 8, fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', marginBottom: 4 }}>🏆 Final</div>
                <div style={{ background: '#0f1729', border: `2px solid ${champion ? '#22c55e' : '#fbbf24'}`, borderRadius: 6, overflow: 'hidden', width: CARD_W + 20 }}>
                  <div style={{ background: champion ? 'rgba(34,197,94,0.1)' : 'rgba(251,191,36,0.1)', padding: '2px 6px', fontSize: 8, fontWeight: 800, color: champion ? '#22c55e' : '#fbbf24', textAlign: 'center' }}>
                    {champion ? '🏆 CHAMPION' : 'CHAMPION'}
                  </div>
                  {teamRow(finalist1, champion === finalist1)}
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
                  {teamRow(finalist2, champion === finalist2)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 8, fontWeight: 800, color: '#fb923c', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', marginBottom: 4 }}>🥉 3rd Place</div>
                <div style={{ background: '#0f1729', border: '1px solid rgba(251,146,60,0.4)', borderRadius: 6, overflow: 'hidden', width: CARD_W + 20 }}>
                  <div style={{ background: 'rgba(251,146,60,0.08)', padding: '2px 6px', fontSize: 8, fontWeight: 800, color: '#fb923c', textAlign: 'center' }}>BRONZE</div>
                  {[sf101loser, sf102loser].map((team, i) => (
                    <div key={i}>
                      {i === 1 && <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 6px', background: thirdResult[103]?.winner === team ? 'rgba(251,146,60,0.15)' : 'transparent' }}>
                        {team && <img src={`https://flagcdn.com/w40/${FLAGS[team] || 'un'}.png`} alt={team} style={{ width: 16, height: 11, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />}
                        <span style={{ flex: 1, fontSize: 9, fontWeight: 700, color: thirdResult[103]?.winner === team ? '#fb923c' : team ? '#e2e8f0' : '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team || 'TBD'}</span>
                        {thirdResult[103]?.winner === team && <span style={{ fontSize: 9 }}>🥉</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT SF */}
            <KnockoutBracketCol title="Semi Finals" matchIds={sfRight.map(m => m.mid)} results={enrichedResults} totalH={totalH} />

            {/* RIGHT QF */}
            <KnockoutBracketCol title="Quarter Finals" matchIds={qfRight.map(m => m.mid)} results={enrichedResults} totalH={totalH} />

            {/* RIGHT R16 */}
            <KnockoutBracketCol title="Round of 16" matchIds={r16Right.map(m => m.mid)} results={enrichedResults} totalH={totalH} />

            {/* RIGHT R32 */}
            <BracketCol title="Round of 32" count={8} matches={r32.slice(8, 16)} totalH={totalH} isR32={true} />
          </div>
        </div>
      )}
    </div>
  )
}

function GroupTable({ group, standings, color }) {
  const teams = GROUPS[group] || []
  const sorted = [...teams].sort((a, b) => {
    const sa = standings[group]?.find(x => x.team === a) || { points: 0, gd: 0, gf: 0 }
    const sb = standings[group]?.find(x => x.team === b) || { points: 0, gd: 0, gf: 0 }
    if (sb.points !== sa.points) return sb.points - sa.points
    if (sb.gd !== sa.gd) return sb.gd - sa.gd
    return sb.gf - sa.gf
  })
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: '#0d1526', border: `1px solid ${color}25`, borderTop: `3px solid ${color}`, borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: `${color}08` }}>
        <span style={{ width: 28, height: 28, borderRadius: 6, background: color, color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, flexShrink: 0 }}>{group}</span>
        <span style={{ fontWeight: 800, fontSize: 15, color: '#f1f5f9' }}>Group {group}</span>
      </div>
      <div className="table-header" style={{ display: 'grid', gridTemplateColumns: '24px 1fr 32px 32px 32px 32px 32px 32px 40px', padding: '6px 14px', fontSize: 10, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <span>#</span><span>Team</span>
        <span className="stat-value" style={{ textAlign: 'center' }}>P</span>
        <span className="stat-value" style={{ textAlign: 'center' }}>W</span>
        <span className="stat-value" style={{ textAlign: 'center' }}>D</span>
        <span className="stat-value" style={{ textAlign: 'center' }}>L</span>
        <span className="stat-value" style={{ textAlign: 'center' }}>GD</span>
        <span className="stat-value" style={{ textAlign: 'center' }}>GF</span>
        <span className="stat-value" style={{ textAlign: 'center' }}>Pts</span>
      </div>
      {sorted.map((team, i) => {
        const s = standings[group]?.find(x => x.team === team) || { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 }
        const advancing = i < 2
        const maybe = i === 2
        return (
          <div key={team} className="table-row" style={{ display: 'grid', gridTemplateColumns: '24px 1fr 32px 32px 32px 32px 32px 32px 40px', padding: '9px 14px', alignItems: 'center', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.03)' : 'none', background: advancing ? `${color}08` : 'transparent', borderLeft: advancing ? `3px solid ${color}` : maybe ? '3px solid #f59e0b' : '3px solid transparent' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: advancing ? color : maybe ? '#f59e0b' : '#334155' }}>{i + 1}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <img className="team-flag" src={`https://flagcdn.com/w40/${FLAGS[team] || 'un'}.png`} alt={team} style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
              <span className="team-name" style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team}</span>
            </div>
            <span className="stat-value" style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{s.played}</span>
            <span className="stat-value" style={{ textAlign: 'center', fontSize: 13, color: '#22c55e', fontWeight: 600 }}>{s.won}</span>
            <span className="stat-value" style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{s.drawn}</span>
            <span className="stat-value" style={{ textAlign: 'center', fontSize: 13, color: '#ef4444', fontWeight: 600 }}>{s.lost}</span>
            <span className="stat-value" style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: s.gd > 0 ? '#22c55e' : s.gd < 0 ? '#ef4444' : '#94a3b8' }}>{s.gd > 0 ? '+' : ''}{s.gd}</span>
            <span style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{s.gf}</span>
            <span style={{ textAlign: 'center', fontSize: 15, fontWeight: 900, color: s.points > 0 ? color : '#475569' }}>{s.points}</span>
          </div>
        )
      })}
      <div style={{ display: 'flex', gap: 12, padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
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

function ThirdPlaceTab({ standings }) {
  const thirds = GROUP_LETTERS.map(g => {
    const teams = GROUPS[g] || []
    const sorted = [...teams].sort((a, b) => {
      const sa = standings[g]?.find(x => x.team === a) || { points: 0, gd: 0, gf: 0 }
      const sb = standings[g]?.find(x => x.team === b) || { points: 0, gd: 0, gf: 0 }
      if (sb.points !== sa.points) return sb.points - sa.points
      if (sb.gd !== sa.gd) return sb.gd - sa.gd
      return sb.gf - sa.gf
    })
    const thirdTeam = sorted[2]
    const s = standings[g]?.find(x => x.team === thirdTeam) || { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 }
    return { team: thirdTeam, group: g, ...s }
  }).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.gd !== a.gd) return b.gd - a.gd
    return b.gf - a.gf
  })
  const hasData = thirds.some(t => t.played > 0)
  return (
    <div>
      <div style={{ background: '#0d1526', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14, padding: '16px 20px', marginBottom: 24, borderTop: '3px solid #f59e0b', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <h2 style={{ fontWeight: 900, fontSize: 20, color: '#fbbf24', margin: '0 0 4px', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.05em' }}>BEST 3RD PLACE RANKINGS</h2>
          <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>Top 8 advance to the Round of 32. Ranked by points, then goal difference, then goals scored.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: '#22c55e' }} />
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Advancing (Top 8)</span>
        </div>
      </div>
      {!hasData ? (
        <div style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '48px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
          <p style={{ color: '#475569', fontSize: 16, fontWeight: 600, margin: 0 }}>No standings data yet — check back once matches begin!</p>
        </div>
      ) : (
        <div style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
          <div className="third-header" style={{ display: 'grid', gridTemplateColumns: '28px 28px 1fr 36px 36px 36px 36px 44px 44px 44px 44px', padding: '8px 16px', fontSize: 10, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
            <span></span><span>#</span><span>Team</span>
            <span style={{ textAlign: 'center' }}>P</span><span style={{ textAlign: 'center' }}>W</span>
            <span style={{ textAlign: 'center' }}>D</span><span style={{ textAlign: 'center' }}>L</span>
            <span style={{ textAlign: 'center' }}>GF</span><span style={{ textAlign: 'center' }}>GA</span>
            <span style={{ textAlign: 'center' }}>GD</span><span style={{ textAlign: 'center' }}>Pts</span>
          </div>
          {thirds.map((t, i) => {
            const advancing = i < 8
            const groupColor = getGroupColor(t.group)
            return (
              <motion.div key={t.team || i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="third-row"
                style={{ display: 'grid', gridTemplateColumns: '28px 28px 1fr 36px 36px 36px 36px 44px 44px 44px 44px', padding: '10px 16px', alignItems: 'center', borderBottom: i < 11 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: advancing ? 'rgba(34,197,94,0.04)' : 'transparent', borderLeft: advancing ? '3px solid #22c55e' : i === 8 ? '3px solid rgba(239,68,68,0.3)' : '3px solid transparent' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {advancing ? <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.6)' }} /> : <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(239,68,68,0.4)' }} />}
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: advancing ? '#22c55e' : '#334155' }}>{i + 1}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <img src={`https://flagcdn.com/w40/${FLAGS[t.team] || 'un'}.png`} alt={t.team} style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2, flexShrink: 0, filter: advancing ? 'none' : 'grayscale(50%)' }} onError={e => { e.target.style.display = 'none' }} />
                  <span style={{ fontWeight: 700, fontSize: 13, color: advancing ? '#e2e8f0' : '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.team || '—'}</span>
                  <span style={{ fontSize: 9, fontWeight: 800, color: groupColor, background: `${groupColor}18`, border: `1px solid ${groupColor}30`, padding: '1px 0', borderRadius: 4, flexShrink: 0, width: 18, textAlign: 'center', display: 'inline-block' }}>{t.group}</span>
                </div>
                <span style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{t.played}</span>
                <span style={{ textAlign: 'center', fontSize: 13, color: '#22c55e', fontWeight: 600 }}>{t.won}</span>
                <span style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{t.drawn}</span>
                <span style={{ textAlign: 'center', fontSize: 13, color: '#ef4444', fontWeight: 600 }}>{t.lost}</span>
                <span style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{t.gf}</span>
                <span style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{t.ga}</span>
                <span style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: t.gd > 0 ? '#22c55e' : t.gd < 0 ? '#ef4444' : '#94a3b8' }}>{t.gd > 0 ? '+' : ''}{t.gd}</span>
                <span style={{ textAlign: 'center', fontSize: 15, fontWeight: 900, color: advancing ? '#22c55e' : '#475569' }}>{t.points}</span>
              </motion.div>
            )
          })}
          <div style={{ display: 'flex', gap: 16, padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.6)' }} /><span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>Advancing to R32 (top 8)</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(239,68,68,0.4)' }} /><span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>Eliminated</span></div>
          </div>
        </div>
      )}
    </div>
  )
}

function QualificationTab({ qualification }) {
  const advanced = qualification.filter(t => t.status === 'advanced')
  const eliminated = qualification.filter(t => t.status === 'eliminated')
  const [glowTeam, setGlowTeam] = useState(null)

  // Group advanced teams by continent
  const advancedByContinent = {}
  advanced.forEach(t => {
    const continent = getContinent(t.team)
    if (!advancedByContinent[continent]) advancedByContinent[continent] = []
    advancedByContinent[continent].push(t)
  })

  // Group eliminated teams by continent
  const eliminatedByContinent = {}
  eliminated.forEach(t => {
    const continent = getContinent(t.team)
    if (!eliminatedByContinent[continent]) eliminatedByContinent[continent] = []
    eliminatedByContinent[continent].push(t)
  })

  const continentOrder = ['UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC', 'OFC', 'Other']

  return (
    <div>
      {/* ADVANCED */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
          <h2 style={{ fontWeight: 900, fontSize: 20, color: '#22c55e', margin: 0, fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.05em' }}>ADVANCED TO ROUND OF 32</h2>
          <span style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', fontSize: 12, fontWeight: 800, padding: '2px 10px', borderRadius: 100 }}>{advanced.length} / 32</span>
        </div>

        {advanced.length === 0 ? (
          <div style={{ background: '#0d1526', border: '1px solid rgba(34,197,94,0.1)', borderRadius: 14, padding: '32px 20px', textAlign: 'center' }}>
            <p style={{ color: '#334155', fontSize: 14, fontWeight: 600, margin: 0 }}>No teams have advanced yet — check back soon!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {continentOrder.map(continent => {
              const teams = advancedByContinent[continent]
              if (!teams || teams.length === 0) return null
              const color = CONTINENT_COLORS[continent]
              return (
                <div key={continent}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 4, height: 20, borderRadius: 2, background: color }} />
                    <span style={{ fontWeight: 800, fontSize: 14, color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{continent}</span>
                    <span style={{ background: `${color}18`, border: `1px solid ${color}30`, color, fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 100 }}>{teams.length}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                    {teams.map((t, i) => (
                      <motion.div key={t.team} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                        onClick={() => setGlowTeam(glowTeam?.team === t.team ? null : t)}
                        style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 12, padding: '14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                        whileHover={{ scale: 1.03 }}>
                        <div style={{ position: 'relative' }}>
                          <img src={`https://flagcdn.com/w80/${FLAGS[t.team] || 'un'}.png`} alt={t.team} style={{ width: 56, height: 38, objectFit: 'cover', borderRadius: 6 }} onError={e => { e.target.style.display = 'none' }} />
                          <span style={{ position: 'absolute', top: -6, right: -6, fontSize: 14 }}>✅</span>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 12, color: '#e2e8f0', textAlign: 'center' }}>{t.team}</span>
                        <span style={{ fontSize: 10, color: '#22c55e', fontWeight: 600 }}>Group {t.group}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <AnimatePresence>
          {glowTeam?.status === 'advanced' && glowTeam.message && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              style={{ marginTop: 16, background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.04))', border: '1px solid rgba(34,197,94,0.3)', borderLeft: '4px solid #22c55e', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <img src={`https://flagcdn.com/w40/${FLAGS[glowTeam.team] || 'un'}.png`} alt={glowTeam.team} style={{ width: 32, height: 22, objectFit: 'cover', borderRadius: 4, flexShrink: 0, marginTop: 2 }} />
              <div><p style={{ color: '#22c55e', fontWeight: 800, fontSize: 14, margin: '0 0 4px' }}>🟢 {glowTeam.team} advance!</p><p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>{glowTeam.message}</p></div>
              <button onClick={() => setGlowTeam(null)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 16, marginLeft: 'auto' }}>✕</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ELIMINATED */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
          <h2 style={{ fontWeight: 900, fontSize: 20, color: '#ef4444', margin: 0, fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.05em' }}>ELIMINATED</h2>
          <span style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 12, fontWeight: 800, padding: '2px 10px', borderRadius: 100 }}>{eliminated.length} teams</span>
        </div>

        {eliminated.length === 0 ? (
          <div style={{ background: '#0d1526', border: '1px solid rgba(239,68,68,0.1)', borderRadius: 14, padding: '32px 20px', textAlign: 'center' }}>
            <p style={{ color: '#334155', fontSize: 14, fontWeight: 600, margin: 0 }}>No teams eliminated yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {continentOrder.map(continent => {
              const teams = eliminatedByContinent[continent]
              if (!teams || teams.length === 0) return null
              const color = CONTINENT_COLORS[continent]
              return (
                <div key={continent}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 4, height: 20, borderRadius: 2, background: color }} />
                    <span style={{ fontWeight: 800, fontSize: 14, color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{continent}</span>
                    <span style={{ background: `${color}18`, border: `1px solid ${color}30`, color, fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 100 }}>{teams.length}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                    {teams.map((t, i) => (
                      <motion.div key={t.team} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                        onClick={() => setGlowTeam(glowTeam?.team === t.team ? null : t)}
                        style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12, padding: '14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', opacity: 0.7 }}
                        whileHover={{ opacity: 1, scale: 1.03 }}>
                        <div style={{ position: 'relative', filter: 'grayscale(60%)' }}>
                          <img src={`https://flagcdn.com/w80/${FLAGS[t.team] || 'un'}.png`} alt={t.team} style={{ width: 56, height: 38, objectFit: 'cover', borderRadius: 6 }} onError={e => { e.target.style.display = 'none' }} />
                          <span style={{ position: 'absolute', top: -6, right: -6, fontSize: 14 }}>❌</span>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 12, color: '#64748b', textAlign: 'center' }}>{t.team}</span>
                        <span style={{ fontSize: 10, color: '#475569', fontWeight: 600 }}>Group {t.group}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <AnimatePresence>
          {glowTeam?.status === 'eliminated' && glowTeam.message && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              style={{ marginTop: 16, background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02))', border: '1px solid rgba(239,68,68,0.25)', borderLeft: '4px solid #ef4444', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <img src={`https://flagcdn.com/w40/${FLAGS[glowTeam.team] || 'un'}.png`} alt={glowTeam.team} style={{ width: 32, height: 22, objectFit: 'cover', borderRadius: 4, flexShrink: 0, marginTop: 2, filter: 'grayscale(50%)' }} />
              <div><p style={{ color: '#f87171', fontWeight: 800, fontSize: 14, margin: '0 0 4px' }}>🔴 {glowTeam.team} eliminated</p><p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>{glowTeam.message}</p></div>
              <button onClick={() => setGlowTeam(null)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 16, marginLeft: 'auto' }}>✕</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Standings() {
  const [standings, setStandings] = useState({})
  const [qualification, setQualification] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [activeTab, setActiveTab] = useState('standings')

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/standings`),
      axios.get(`${API_URL}/api/qualification`),
    ]).then(([sRes, qRes]) => {
      setStandings(sRes.data)
      setQualification(qRes.data)
      setLoading(false)
    }).catch(() => setLoading(false))
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
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>FIFA World Cup 2026</div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.02em', fontFamily: 'Bebas Neue, sans-serif' }}>Group Standings 📊</h1>
          <p style={{ color: '#64748b', marginTop: 6, fontSize: 14 }}>Live group tables — updated after each match. Top 2 + best 8 third-place teams advance.</p>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', paddingTop: 4 }}>
          {[
            { id: 'standings',     label: '📊 Group Tables' },
            { id: 'third',         label: '🥉 Best 3rd Place' },
            { id: 'bracket',       label: '🗂️ Live Bracket', live: true },
            { id: 'qualification', label: '🏆 Qualification' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', border: 'none', transition: 'all 0.15s', background: activeTab === tab.id ? '#3b82f6' : 'rgba(255,255,255,0.05)', color: activeTab === tab.id ? '#fff' : '#64748b', boxShadow: activeTab === tab.id ? '0 4px 14px rgba(59,130,246,0.3)' : 'none' }}>
              {tab.label}
              {tab.live && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', fontSize: 8, fontWeight: 800, padding: '1px 5px', borderRadius: 100, animation: 'livePulse 2s infinite' }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                  LIVE
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'standings' && (
          <>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 28 }}>
              <button onClick={() => setFilter('ALL')} style={{ padding: '6px 14px', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer', border: 'none', background: filter === 'ALL' ? '#3b82f6' : 'rgba(255,255,255,0.05)', color: filter === 'ALL' ? '#fff' : '#64748b' }}>All Groups</button>
              {GROUP_LETTERS.map((g, i) => (
                <button key={g} onClick={() => setFilter(g)} style={{ width: 36, height: 32, borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: 'pointer', border: 'none', background: filter === g ? GROUP_COLORS[i] : 'rgba(255,255,255,0.05)', color: filter === g ? '#000' : '#64748b' }}>{g}</button>
              ))}
            </div>
            <div className="standings-grid" style={{ display: 'grid', gridTemplateColumns: filter === 'ALL' ? 'repeat(auto-fill, minmax(480px, 1fr))' : '1fr', gap: 16 }}>
              {displayGroups.map(g => <GroupTable key={g} group={g} standings={standings} color={getGroupColor(g)} />)}
            </div>
            <p style={{ color: '#334155', fontSize: 12, textAlign: 'center', marginTop: 32 }}>Standings are updated manually by the admin after each match. Refresh for the latest! 🔄</p>
          </>
        )}

        {activeTab === 'third'         && <ThirdPlaceTab standings={standings} />}
        {activeTab === 'qualification' && <QualificationTab qualification={qualification} />}
      </div>

      {activeTab === 'bracket' && (
        <div style={{ padding: '0 16px 80px' }}>
          <LiveBracketTab />
        </div>
      )}

      <style>{`
        @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @media (max-width: 640px) {
          .standings-grid { grid-template-columns: 1fr !important; }
          .table-header, .table-row { grid-template-columns: 18px 1fr 22px 22px 22px 28px !important; padding: 6px 6px !important; }
          .table-header span:nth-child(4), .table-header span:nth-child(5), .table-header span:nth-child(7),
          .table-row span:nth-child(4), .table-row span:nth-child(5), .table-row span:nth-child(7) { display: none !important; }
          .team-flag { width: 18px !important; height: 12px !important; }
          .team-name { font-size: 11px !important; }
          .stat-value { font-size: 11px !important; }

          .third-header, .third-row {
            grid-template-columns: 20px 20px 1fr 32px 36px !important;
            padding: 8px 8px !important;
          }
          .third-header span:nth-child(4), .third-header span:nth-child(5), .third-header span:nth-child(6), .third-header span:nth-child(7), .third-header span:nth-child(8), .third-header span:nth-child(9),
          .third-row span:nth-child(4), .third-row span:nth-child(5), .third-row span:nth-child(6), .third-row span:nth-child(7), .third-row span:nth-child(8), .third-row span:nth-child(9) {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}

export default Standings