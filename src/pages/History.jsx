import { useState } from 'react'
import { motion } from 'framer-motion'
import API_URL from '../config'

const GROUP_COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e',
  '#06b6d4','#3b82f6','#8b5cf6','#ec4899',
  '#14b8a6','#f59e0b','#84cc16','#6366f1',
]

const FLAGS = {
  'Uruguay': 'uy', 'Italy': 'it', 'France': 'fr', 'Brazil': 'br',
  'West Germany': 'de', 'Germany': 'de', 'England': 'gb-eng',
  'Argentina': 'ar', 'Spain': 'es', 'Netherlands': 'nl',
  'Hungary': 'hu', 'Czechoslovakia': 'cz', 'Sweden': 'se',
  'Chile': 'cl', 'Portugal': 'pt', 'Poland': 'pl',
  'Belgium': 'be', 'Yugoslavia': 'rs', 'USA': 'us',
  'Mexico': 'mx', 'Bulgaria': 'bg', 'Croatia': 'hr',
  'South Korea': 'kr', 'Turkey': 'tr', 'Morocco': 'ma',
}

const TOURNAMENTS = [
  {
    year: 1930, host: 'Uruguay', champion: 'Uruguay', runnerUp: 'Argentina',
    score: '4–2', thirdPlace: 'USA', venue: 'Estadio Centenario, Montevideo',
    goldenBoot: { player: 'Guillermo Stábile', country: 'Argentina', goals: 8 },
    goldenBall: { player: 'José Nasazzi', country: 'Uruguay' },
    teams: 13, matches: 18,
  },
  {
    year: 1934, host: 'Italy', champion: 'Italy', runnerUp: 'Czechoslovakia',
    score: '2–1 (AET)', thirdPlace: 'Germany',
    venue: 'Stadio Nazionale PNF, Rome',
    goldenBoot: { player: 'Oldřich Nejedlý', country: 'Czechoslovakia', goals: 5 },
    goldenBall: { player: 'Giuseppe Meazza', country: 'Italy' },
    teams: 16, matches: 17,
  },
  {
    year: 1938, host: 'France', champion: 'Italy', runnerUp: 'Hungary',
    score: '4–2', thirdPlace: 'Brazil', venue: 'Stade Olympique de Colombes, Paris',
    goldenBoot: { player: 'Leônidas', country: 'Brazil', goals: 7 },
    goldenBall: { player: 'Leônidas', country: 'Brazil' },
    teams: 15, matches: 18,
  },
  {
    year: 1950, host: 'Brazil', champion: 'Uruguay', runnerUp: 'Brazil',
    score: '2–1', thirdPlace: 'Sweden', venue: 'Maracanã, Rio de Janeiro',
    goldenBoot: { player: 'Ademir', country: 'Brazil', goals: 9 },
    goldenBall: { player: 'Zizinho', country: 'Brazil' },
    teams: 13, matches: 22, note: 'Final group stage format',
  },
  {
    year: 1954, host: 'Switzerland', champion: 'West Germany', runnerUp: 'Hungary',
    score: '3–2', thirdPlace: 'Austria', venue: 'Wankdorf Stadium, Bern',
    goldenBoot: { player: 'Sándor Kocsis', country: 'Hungary', goals: 11 },
    goldenBall: { player: 'Ferenc Puskás', country: 'Hungary' },
    teams: 16, matches: 26,
  },
  {
    year: 1958, host: 'Sweden', champion: 'Brazil', runnerUp: 'Sweden',
    score: '5–2', thirdPlace: 'France', venue: 'Råsunda Stadium, Solna',
    goldenBoot: { player: 'Just Fontaine', country: 'France', goals: 13 },
    goldenBall: { player: 'Didi', country: 'Brazil' },
    teams: 16, matches: 35,
  },
  {
    year: 1962, host: 'Chile', champion: 'Brazil', runnerUp: 'Czechoslovakia',
    score: '3–1', thirdPlace: 'Chile', venue: 'Estadio Nacional, Santiago',
    goldenBoot: { player: 'Shared (6 players)', country: '', goals: 4 },
    goldenBall: { player: 'Garrincha', country: 'Brazil' },
    teams: 16, matches: 32,
  },
  {
    year: 1966, host: 'England', champion: 'England', runnerUp: 'West Germany',
    score: '4–2 (AET)', thirdPlace: 'Portugal', venue: 'Wembley Stadium, London',
    goldenBoot: { player: 'Eusébio', country: 'Portugal', goals: 9 },
    goldenBall: { player: 'Bobby Charlton', country: 'England' },
    teams: 16, matches: 32,
  },
  {
    year: 1970, host: 'Mexico', champion: 'Brazil', runnerUp: 'Italy',
    score: '4–1', thirdPlace: 'West Germany', venue: 'Estadio Azteca, Mexico City',
    goldenBoot: { player: 'Gerd Müller', country: 'West Germany', goals: 10 },
    goldenBall: { player: 'Pelé', country: 'Brazil' },
    teams: 16, matches: 32,
  },
  {
    year: 1974, host: 'West Germany', champion: 'West Germany', runnerUp: 'Netherlands',
    score: '2–1', thirdPlace: 'Poland', venue: 'Olympiastadion, Munich',
    goldenBoot: { player: 'Grzegorz Lato', country: 'Poland', goals: 7 },
    goldenBall: { player: 'Johan Cruyff', country: 'Netherlands' },
    teams: 16, matches: 38,
  },
  {
    year: 1978, host: 'Argentina', champion: 'Argentina', runnerUp: 'Netherlands',
    score: '3–1 (AET)', thirdPlace: 'Brazil', venue: 'Estadio Monumental, Buenos Aires',
    goldenBoot: { player: 'Mario Kempes', country: 'Argentina', goals: 6 },
    goldenBall: { player: 'Mario Kempes', country: 'Argentina' },
    teams: 16, matches: 38,
  },
  {
    year: 1982, host: 'Spain', champion: 'Italy', runnerUp: 'West Germany',
    score: '3–1', thirdPlace: 'Poland', venue: 'Santiago Bernabéu, Madrid',
    goldenBoot: { player: 'Paolo Rossi', country: 'Italy', goals: 6 },
    goldenBall: { player: 'Paolo Rossi', country: 'Italy' },
    teams: 24, matches: 52,
  },
  {
    year: 1986, host: 'Mexico', champion: 'Argentina', runnerUp: 'West Germany',
    score: '3–2', thirdPlace: 'France', venue: 'Estadio Azteca, Mexico City',
    goldenBoot: { player: 'Gary Lineker', country: 'England', goals: 6 },
    goldenBall: { player: 'Diego Maradona', country: 'Argentina' },
    teams: 24, matches: 52,
  },
  {
    year: 1990, host: 'Italy', champion: 'West Germany', runnerUp: 'Argentina',
    score: '1–0', thirdPlace: 'Italy', venue: 'Stadio Olimpico, Rome',
    goldenBoot: { player: 'Salvatore Schillaci', country: 'Italy', goals: 6 },
    goldenBall: { player: 'Salvatore Schillaci', country: 'Italy' },
    teams: 24, matches: 52,
  },
  {
    year: 1994, host: 'USA', champion: 'Brazil', runnerUp: 'Italy',
    score: '0–0 (3–2 pens)', thirdPlace: 'Sweden', venue: 'Rose Bowl, Los Angeles',
    goldenBoot: { player: 'Oleg Salenko / Hristo Stoichkov', country: '', goals: 6 },
    goldenBall: { player: 'Romário', country: 'Brazil' },
    teams: 24, matches: 52,
  },
  {
    year: 1998, host: 'France', champion: 'France', runnerUp: 'Brazil',
    score: '3–0', thirdPlace: 'Croatia', venue: 'Stade de France, Saint-Denis',
    goldenBoot: { player: 'Davor Šuker', country: 'Croatia', goals: 6 },
    goldenBall: { player: 'Ronaldo', country: 'Brazil' },
    teams: 32, matches: 64,
  },
  {
    year: 2002, host: 'South Korea / Japan', champion: 'Brazil', runnerUp: 'Germany',
    score: '2–0', thirdPlace: 'Turkey', venue: 'International Stadium, Yokohama',
    goldenBoot: { player: 'Ronaldo', country: 'Brazil', goals: 8 },
    goldenBall: { player: 'Oliver Kahn', country: 'Germany' },
    teams: 32, matches: 64,
  },
  {
    year: 2006, host: 'Germany', champion: 'Italy', runnerUp: 'France',
    score: '1–1 (5–3 pens)', thirdPlace: 'Germany', venue: 'Olympiastadion, Berlin',
    goldenBoot: { player: 'Miroslav Klose', country: 'Germany', goals: 5 },
    goldenBall: { player: 'Zinedine Zidane', country: 'France' },
    teams: 32, matches: 64,
  },
  {
    year: 2010, host: 'South Africa', champion: 'Spain', runnerUp: 'Netherlands',
    score: '1–0 (AET)', thirdPlace: 'Germany', venue: 'Soccer City, Johannesburg',
    goldenBoot: { player: 'Thomas Müller', country: 'Germany', goals: 5 },
    goldenBall: { player: 'Diego Forlán', country: 'Uruguay' },
    teams: 32, matches: 64,
  },
  {
    year: 2014, host: 'Brazil', champion: 'Germany', runnerUp: 'Argentina',
    score: '1–0 (AET)', thirdPlace: 'Netherlands', venue: 'Maracanã, Rio de Janeiro',
    goldenBoot: { player: 'James Rodríguez', country: 'Colombia', goals: 6 },
    goldenBall: { player: 'Lionel Messi', country: 'Argentina' },
    teams: 32, matches: 64,
  },
  {
    year: 2018, host: 'Russia', champion: 'France', runnerUp: 'Croatia',
    score: '4–2', thirdPlace: 'Belgium', venue: 'Luzhniki Stadium, Moscow',
    goldenBoot: { player: 'Harry Kane', country: 'England', goals: 6 },
    goldenBall: { player: 'Luka Modrić', country: 'Croatia' },
    teams: 32, matches: 64,
  },
  {
    year: 2022, host: 'Qatar', champion: 'Argentina', runnerUp: 'France',
    score: '3–3 (4–2 pens)', thirdPlace: 'Croatia', venue: 'Lusail Stadium, Qatar',
    goldenBoot: { player: 'Kylian Mbappé', country: 'France', goals: 8 },
    goldenBall: { player: 'Lionel Messi', country: 'Argentina' },
    teams: 32, matches: 64,
  },
]

const CHAMPION_TITLES = TOURNAMENTS.reduce((acc, t) => {
  const c = t.champion
  acc[c] = (acc[c] || 0) + 1
  return acc
}, {})

const TITLE_COLORS = {
  'Brazil': '#22c55e', 'Germany': '#3b82f6', 'Italy': '#06b6d4',
  'Argentina': '#60a5fa', 'France': '#8b5cf6', 'Uruguay': '#f59e0b',
  'England': '#ef4444', 'Spain': '#f97316',
}

export default function History() {
  const [selectedYear, setSelectedYear] = useState(null)
  const [filter, setFilter] = useState('ALL')

  const champions = Object.entries(CHAMPION_TITLES).sort((a, b) => b[1] - a[1])

  const filtered = filter === 'ALL'
    ? TOURNAMENTS
    : TOURNAMENTS.filter(t => t.champion === filter || t.runnerUp === filter)

  const selected = TOURNAMENTS.find(t => t.year === selectedYear)

  return (
    <div style={{ minHeight: '100vh', background: '#080d1a', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Top color bar */}
      <div style={{
  height: 3,
  background: 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #14b8a6, #f59e0b, #84cc16, #6366f1)',
}} />      

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            FIFA World Cup
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Tournament History <span style={{ color: '#fbbf24' }}>🏆</span>
          </h1>
          <p style={{ color: '#475569', fontSize: 14, margin: 0 }}>
            Every World Cup from 1930 to 2022 — champions, results, and award winners.
          </p>
        </div>

        {/* All-time titles */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
            All-Time Champions
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {champions.map(([country, titles]) => {
              const color = TITLE_COLORS[country] || '#64748b'
              const isActive = filter === country
              return (
                <button key={country} onClick={() => setFilter(isActive ? 'ALL' : country)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: isActive ? `${color}20` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isActive ? color + '50' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 100, padding: '6px 14px', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}>
                  <img src={`https://flagcdn.com/w40/${FLAGS[country] || 'un'}.png`} alt={country}
                    style={{ width: 20, height: 14, objectFit: 'cover', borderRadius: 2 }}
                    onError={e => { e.target.style.display = 'none' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: isActive ? color : '#94a3b8' }}>{country}</span>
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%', background: color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 900, color: '#000',
                  }}>{titles}</span>
                </button>
              )
            })}
            {filter !== 'ALL' && (
              <button onClick={() => setFilter('ALL')}
                style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: '#475569', fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 100, cursor: 'pointer' }}>
                Clear ✕
              </button>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...filtered].reverse().map((t, i) => {
            const champColor = TITLE_COLORS[t.champion] || '#fbbf24'
            const isSelected = selectedYear === t.year
            return (
              <motion.div key={t.year}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                {/* Main row */}
                <div
                  onClick={() => setSelectedYear(isSelected ? null : t.year)}
                  style={{
                    background: isSelected ? `${champColor}08` : '#0d1526',
                    border: `1px solid ${isSelected ? champColor + '30' : 'rgba(255,255,255,0.06)'}`,
                    borderLeft: `4px solid ${champColor}`,
                    borderRadius: isSelected ? '12px 12px 0 0' : 12,
                    padding: '14px 18px', cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr 1fr auto',
                    alignItems: 'center', gap: 12,
                  }}>

                  {/* Year */}
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#f1f5f9', lineHeight: 1 }}>{t.year}</div>
                    <div style={{ fontSize: 10, color: '#334155', fontWeight: 600, marginTop: 2 }}>{t.host}</div>
                  </div>

                  {/* Champion */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: `${champColor}20`, border: `1px solid ${champColor}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, flexShrink: 0,
                    }}>🏆</div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <img src={`https://flagcdn.com/w40/${FLAGS[t.champion] || 'un'}.png`} alt={t.champion}
                          style={{ width: 22, height: 15, objectFit: 'cover', borderRadius: 2 }}
                          onError={e => { e.target.style.display = 'none' }} />
                        <span style={{ fontWeight: 800, fontSize: 14, color: champColor }}>{t.champion}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                        <img src={`https://flagcdn.com/w40/${FLAGS[t.runnerUp] || 'un'}.png`} alt={t.runnerUp}
                          style={{ width: 22, height: 15, objectFit: 'cover', borderRadius: 2 }}
                          onError={e => { e.target.style.display = 'none' }} />
                        <span style={{ fontSize: 12, color: '#64748b' }}>{t.runnerUp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div style={{ display: 'none' }} className="score-col">
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 12px', display: 'inline-block' }}>
                      <span style={{ fontWeight: 900, fontSize: 15, color: '#f1f5f9', letterSpacing: '0.05em' }}>{t.score}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#334155', marginTop: 4 }}>Final score</div>
                  </div>

                  {/* Awards preview */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                    <div style={{ textAlign: 'right', display: 'none' }} className="awards-preview">
                      <div style={{ fontSize: 11, color: '#475569' }}>👟 {t.goldenBoot.player.split('/')[0].trim().split(' ').slice(-1)[0]}</div>
                      <div style={{ fontSize: 11, color: '#475569' }}>⚽ {t.goldenBall.player.split(' ').slice(-1)[0]}</div>
                    </div>
                    <span style={{ color: isSelected ? '#94a3b8' : '#334155', fontSize: 16, transition: 'transform 0.2s', display: 'inline-block', transform: isSelected ? 'rotate(180deg)' : 'none' }}>▼</span>
                  </div>
                </div>

                {/* Expanded details */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{
                      background: `${champColor}05`,
                      border: `1px solid ${champColor}20`,
                      borderTop: 'none', borderRadius: '0 0 12px 12px',
                      padding: '16px 18px',
                      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: 16,
                    }}>

                    {/* Final result */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Final</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <img src={`https://flagcdn.com/w40/${FLAGS[t.champion] || 'un'}.png`} alt={t.champion}
                          style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }} />
                        <span style={{ fontWeight: 800, fontSize: 13, color: champColor }}>{t.champion}</span>
                      </div>
                      <div style={{ fontWeight: 900, fontSize: 20, color: '#f1f5f9', margin: '4px 0', letterSpacing: '0.05em' }}>{t.score}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img src={`https://flagcdn.com/w40/${FLAGS[t.runnerUp] || 'un'}.png`} alt={t.runnerUp}
                          style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }} />
                        <span style={{ fontSize: 13, color: '#64748b' }}>{t.runnerUp}</span>
                      </div>
                    </div>

                    {/* Golden Boot */}
                    <div style={{ background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.15)', borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#fb923c', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>👟 Golden Boot</div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#f1f5f9', marginBottom: 4 }}>{t.goldenBoot.player}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {t.goldenBoot.country && (
                          <img src={`https://flagcdn.com/w40/${FLAGS[t.goldenBoot.country] || 'un'}.png`} alt={t.goldenBoot.country}
                            style={{ width: 18, height: 12, objectFit: 'cover', borderRadius: 2 }}
                            onError={e => { e.target.style.display = 'none' }} />
                        )}
                        <span style={{ fontSize: 12, color: '#64748b' }}>{t.goldenBoot.country}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 800, color: '#fb923c' }}>{t.goldenBoot.goals} goals</span>
                      </div>
                    </div>

                    {/* Golden Ball */}
                    <div style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>⚽ Golden Ball</div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#f1f5f9', marginBottom: 4 }}>{t.goldenBall.player}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <img src={`https://flagcdn.com/w40/${FLAGS[t.goldenBall.country] || 'un'}.png`} alt={t.goldenBall.country}
                          style={{ width: 18, height: 12, objectFit: 'cover', borderRadius: 2 }}
                          onError={e => { e.target.style.display = 'none' }} />
                        <span style={{ fontSize: 12, color: '#64748b' }}>{t.goldenBall.country}</span>
                      </div>
                    </div>

                    {/* Tournament info */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Tournament</div>
                      {[
                        { label: '🏟️ Final venue', value: t.venue },
                        { label: '🥉 3rd Place', value: t.thirdPlace },
                        { label: '⚽ Teams', value: t.teams },
                        { label: '🎮 Matches', value: t.matches },
                      ].map(row => (
                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
                          <span style={{ fontSize: 11, color: '#475569', flexShrink: 0 }}>{row.label}</span>
                          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textAlign: 'right' }}>{row.value}</span>
                        </div>
                      ))}
                      {t.note && <p style={{ fontSize: 10, color: '#334155', marginTop: 6, fontStyle: 'italic' }}>* {t.note}</p>}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      <style>{`
        @media (min-width: 640px) {
          .score-col { display: block !important; }
          .awards-preview { display: block !important; }
        }
      `}</style>
    </div>
  )
}