import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import CITY_DATA from '../cityData'

function CityProfile() {
  const { name } = useParams()
  const navigate = useNavigate()
  const [matches, setMatches] = useState([])

  // Convert URL param back to city name
  const cityName = Object.keys(CITY_DATA).find(
    c => c.toLowerCase().replace(/ /g, '-') === name
  )
  const city = cityName ? CITY_DATA[cityName] : null

  // Fetch matches and filter by this city's stadium
  useEffect(() => {
    if (!city) return
    axios.get('http://127.0.0.1:5000/api/matches').then(res => {
      const cityMatches = res.data.filter(m =>
        m.venue && (m.venue.includes(city.stadium) || m.venue.includes(cityName))
      )
      setMatches(cityMatches)
    })
  }, [cityName])

  if (!city) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white gap-4">
        <p className="text-2xl font-bold text-gray-400">City not found 🚧</p>
        <button onClick={() => navigate('/map')}
          className="bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-3 rounded-full">
          ← Back to Map
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero */}
      <div className="bg-gray-800 border-b border-gray-700 px-8 py-12">
        <button onClick={() => navigate('/map')}
          className="text-gray-400 hover:text-green-400 text-sm mb-6 transition">
          ← Back to Map
        </button>
        <div className="flex items-center gap-6">
          <img src={`https://flagcdn.com/w160/${city.flag}.png`} alt={city.country}
            className="w-28 h-18 object-cover rounded-xl shadow-2xl border-2 border-gray-600"
            onError={(e) => { e.target.style.display = 'none' }} />
          <div>
            <h1 className="text-5xl font-extrabold mb-1">{cityName}</h1>
            <p className="text-green-400 font-bold text-lg">🏟️ {city.stadium}</p>
            <div className="flex gap-4 text-gray-400 text-sm mt-2">
              <span>👥 {city.population || 'TBD'}</span>
              <span>🪑 {city.capacity.toLocaleString()} capacity</span>
              <span className="text-yellow-400">{city.hosts}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-10 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* City Info */}
        <div>
          <h2 className="text-2xl font-extrabold text-green-400 mb-4">About {cityName}</h2>
          <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 flex flex-col gap-4">
            {city.founded && (
              <div className="flex justify-between border-b border-gray-700 pb-3">
                <span className="text-gray-400 text-sm">Founded</span>
                <span className="text-white font-medium text-sm">{city.founded}</span>
              </div>
            )}
            {city.funFact && (
              <div className="border-b border-gray-700 pb-3">
                <p className="text-gray-400 text-sm mb-1">Did you know?</p>
                <p className="text-white text-sm">{city.funFact}</p>
              </div>
            )}
            {city.teams.length > 0 && (
              <div className="border-b border-gray-700 pb-3">
                <p className="text-gray-400 text-sm mb-2">🏆 Local Teams</p>
                <div className="flex flex-wrap gap-2">
                  {city.teams.map(team => (
                    <span key={team} className="bg-gray-700 text-white text-xs px-3 py-1 rounded-full">{team}</span>
                  ))}
                </div>
              </div>
            )}
            {city.attractions.length > 0 && (
              <div>
                <p className="text-gray-400 text-sm mb-2">📍 Attractions</p>
                <div className="flex flex-wrap gap-2">
                  {city.attractions.map(a => (
                    <span key={a} className="bg-green-500 bg-opacity-20 text-green-400 text-xs px-3 py-1 rounded-full">{a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Matches Hosted */}
        <div>
          <h2 className="text-2xl font-extrabold text-green-400 mb-4">
            Matches Hosted ({matches.length})
          </h2>
          {matches.length === 0 ? (
            <p className="text-gray-500 text-sm">No matches found for this venue.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {matches.map(match => (
                <motion.div key={match.id}
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs font-bold">Group {match.group} · Match {match.id}</span>
                    <span className="text-gray-500 text-xs">{match.date} · {match.time}</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 mt-2">
                    <span className="text-white font-bold text-sm">{match.home}</span>
                    <span className="text-green-400 text-xs">vs</span>
                    <span className="text-white font-bold text-sm">{match.away}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CityProfile