import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import COUNTRY_DATA from '../countryData'
import PLAYERS from '../players'

// ============================================================
// RESULT COLOR — color code each World Cup result
// ============================================================
function resultColor(result) {
  if (result.includes('🏆')) return 'bg-yellow-500 text-black'
  if (result.includes('Runners Up')) return 'bg-gray-400 text-black'
  if (result.includes('3rd') || result.includes('4th')) return 'bg-orange-500 text-white'
  if (result.includes('Semi')) return 'bg-blue-500 text-white'
  if (result.includes('Quarter')) return 'bg-blue-400 text-white'
  if (result.includes('Round of 16')) return 'bg-indigo-500 text-white'
  if (result.includes('TBD')) return 'bg-green-500 text-black'
  return 'bg-gray-700 text-gray-300'
}

function CountryProfile() {
  const { name } = useParams()
  const navigate = useNavigate()

  // Convert URL param back to country name
  const countryName = name
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  const data = COUNTRY_DATA[countryName]

  // Country not found or no data yet
  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white gap-4">
        <p className="text-2xl font-bold text-gray-400">Profile coming soon for {countryName} 🚧</p>
        <button
          onClick={() => navigate('/countries')}
          className="bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-3 rounded-full"
        >
          ← Back to Countries
        </button>
      </div>
    )
  }

  // Get squad from players.js
  const squad = PLAYERS.filter(p => p.country === countryName)
  const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward']

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {/* Hero Banner */}
      <div className="relative bg-gray-800 border-b border-gray-700 px-8 py-12">
        <button
          onClick={() => navigate('/countries')}
          className="text-gray-400 hover:text-green-400 text-sm mb-6 flex items-center gap-1 transition"
        >
          ← Back to Countries
        </button>

        <div className="flex items-center gap-6">
          {/* Big Flag */}
          <img
            src={`https://flagcdn.com/w160/${data.flag}.png`}
            alt={countryName}
            className="w-32 h-22 object-cover rounded-xl shadow-2xl border-2 border-gray-600"
            onError={(e) => { e.target.style.display = 'none' }}
          />

          {/* Country Info */}
          <div>
            <h1 className="text-5xl font-extrabold text-white mb-1">{countryName}</h1>
            <p className="text-green-400 font-bold text-lg mb-2">{data.best_result}</p>
            <div className="flex gap-4 text-gray-400 text-sm">
              <span>🏅 {data.confederation}</span>
              <span>📊 FIFA Rank #{data.fifa_ranking}</span>
              <span>👕 Group {data.group_2026}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-10 max-w-6xl mx-auto">

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            { label: 'World Cup Titles', value: data.titles, icon: '🏆' },
            { label: 'Appearances', value: data.all_time_appearances, icon: '🌍' },
            { label: 'Total Wins', value: data.total_wins, icon: '✅' },
            { label: 'Goals Scored', value: data.goals_scored, icon: '⚽' },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-800 rounded-2xl p-5 border border-gray-700 text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-extrabold text-green-400">{stat.value}</div>
              <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* World Cup History Timeline */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-2xl font-extrabold text-green-400 mb-6">
              📅 World Cup History
            </h2>
            <div className="flex flex-col gap-2">
              {data.history.map(entry => (
                <div
                  key={entry.year}
                  className="flex items-center gap-4 bg-gray-800 rounded-xl px-4 py-3 border border-gray-700"
                >
                  <span className="text-gray-400 font-bold w-12 text-sm">{entry.year}</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${resultColor(entry.result)}`}>
                    {entry.result}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column */}
          <div className="flex flex-col gap-8">

            {/* Records */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl font-extrabold text-green-400 mb-4">
                🏅 Records & Stats
              </h2>
              <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 flex flex-col gap-4">
                {[
                  { label: 'Coach', value: data.coach },
                  { label: 'Captain', value: data.captain },
                  { label: 'Top Scorer', value: `${data.top_scorer.name} (${data.top_scorer.goals} goals)` },
                  { label: 'Most Capped', value: `${data.most_capped.name} (${data.most_capped.caps} caps)` },
                  { label: 'Total Matches', value: `${data.total_matches} (W${data.total_wins} D${data.total_draws} L${data.total_losses})` },
                  { label: 'Goals Conceded', value: data.goals_conceded },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center border-b border-gray-700 pb-3 last:border-0 last:pb-0">
                    <span className="text-gray-400 text-sm">{item.label}</span>
                    <span className="text-white font-medium text-sm text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Title Years */}
            {data.title_years.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h2 className="text-2xl font-extrabold text-green-400 mb-4">
                  🏆 Title Years
                </h2>
                <div className="flex flex-wrap gap-3">
                  {data.title_years.map(year => (
                    <span
                      key={year}
                      className="bg-yellow-500 text-black font-extrabold px-5 py-2 rounded-full text-lg"
                    >
                      {year}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Squad Section */}
        {squad.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-extrabold text-green-400 mb-6">
              👕 2026 Squad
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {positions.map(pos => {
                const posPlayers = squad.filter(p => p.position === pos)
                if (posPlayers.length === 0) return null
                return (
                  <div key={pos} className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
                    <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">
                      {pos === 'Goalkeeper' ? '🧤' : pos === 'Defender' ? '🛡️' : pos === 'Midfielder' ? '⚙️' : '⚡'} {pos}s
                    </h3>
                    <div className="flex flex-col gap-2">
                      {posPlayers.map(player => (
                        <div
                          key={player.name}
                          className="flex items-center gap-3 bg-gray-700 rounded-lg px-3 py-2"
                        >
                          <img
                            src={`https://flagcdn.com/w40/${player.flag}.png`}
                            alt={player.country}
                            className="w-7 h-5 object-cover rounded-sm"
                          />
                          <span className="text-white font-medium text-sm">{player.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  )
}

export default CountryProfile