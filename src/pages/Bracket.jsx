import { useState, useEffect } from 'react'
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

const CARD_H = 56
const CARD_W = 120
const COL_GAP = 8

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

function Bracket() {
  const [r32, setR32] = useState([])
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/second-chance/matchups`),
      axios.get(`${API_URL}/api/knockout-results`),
    ]).then(([matchupsRes, resultsRes]) => {
      const byNum = {}
      matchupsRes.data.forEach(m => { byNum[m.match] = m })
      const order = [74, 77, 73, 75, 83, 84, 81, 82, 76, 78, 79, 80, 86, 88, 85, 87]
      setR32(order.map(n => byNum[n]).filter(Boolean))
      const rMap = {}
      resultsRes.data.forEach(r => { rMap[r.match_id] = r })
      setResults(rMap)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const N = 8
  const totalH = N * CARD_H + (N - 1) * 8

  const r16Left = [
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

  const enrichedResults = { ...results }
  ;[...r16Left, ...r16Right].forEach(({ mid, t1, t2 }) => {
    enrichedResults[mid] = { ...(results[mid] || {}), match_id: mid, team1: t1 || 'TBD', team2: t2 || 'TBD', winner: results[mid]?.winner || null }
  })

  const qfLeft = [
    { mid: 97,  t1: enrichedResults[89]?.winner, t2: enrichedResults[90]?.winner },
    { mid: 98,  t1: enrichedResults[93]?.winner, t2: enrichedResults[94]?.winner },
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

  const teamRow = (team, isWinner, goldColor = false) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 6px', background: isWinner ? (goldColor ? 'rgba(251,191,36,0.15)' : 'rgba(34,197,94,0.1)') : 'transparent', borderLeft: `2px solid ${isWinner ? (goldColor ? '#fbbf24' : '#22c55e') : 'transparent'}` }}>
      {team && team !== 'TBD' && <img src={`https://flagcdn.com/w40/${FLAGS[team] || 'un'}.png`} alt={team} style={{ width: 16, height: 11, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />}
      <span style={{ flex: 1, fontSize: 9, fontWeight: 700, color: isWinner ? (goldColor ? '#fbbf24' : '#22c55e') : (!team || team === 'TBD') ? '#475569' : '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team || 'TBD'}</span>
      {isWinner && <span style={{ fontSize: 9 }}>{goldColor ? '🏆' : '✓'}</span>}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff', fontFamily: 'Barlow, system-ui, sans-serif' }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #14b8a6, #f59e0b, #84cc16, #6366f1)' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px 80px' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>FIFA World Cup 2026</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 900, margin: 0, fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.05em' }}>Live Bracket</h1>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 100, animation: 'livePulse 2s infinite' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
              LIVE
            </span>
          </div>
          <p style={{ color: '#475569', fontSize: 14, margin: 0 }}>Official knockout bracket — updated as teams progress.</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
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
                    {teamRow(finalist1, champion === finalist1, true)}
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
                    {teamRow(finalist2, champion === finalist2, true)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 8, fontWeight: 800, color: '#fb923c', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', marginBottom: 4 }}>🥉 3rd Place</div>
                  <div style={{ background: '#0f1729', border: '1px solid rgba(251,146,60,0.4)', borderRadius: 6, overflow: 'hidden', width: CARD_W + 20 }}>
                    <div style={{ background: 'rgba(251,146,60,0.08)', padding: '2px 6px', fontSize: 8, fontWeight: 800, color: '#fb923c', textAlign: 'center' }}>BRONZE</div>
                    {[sf101loser, sf102loser].map((team, i) => (
                      <div key={i}>
                        {i === 1 && <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 6px', background: enrichedResults[103]?.winner === team ? 'rgba(251,146,60,0.15)' : 'transparent' }}>
                          {team && <img src={`https://flagcdn.com/w40/${FLAGS[team] || 'un'}.png`} alt={team} style={{ width: 16, height: 11, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />}
                          <span style={{ flex: 1, fontSize: 9, fontWeight: 700, color: enrichedResults[103]?.winner === team ? '#fb923c' : team ? '#e2e8f0' : '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team || 'TBD'}</span>
                          {enrichedResults[103]?.winner === team && <span style={{ fontSize: 9 }}>🥉</span>}
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

      <style>{`@keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.6} }`}</style>
    </div>
  )
}

export default Bracket