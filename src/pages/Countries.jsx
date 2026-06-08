import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import COUNTRY_DATA from '../countryData'

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
    <div className="min-h-screen bg-gray-900 text-white px-4 sm:px-6 py-8">

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl sm:text-4xl font-extrabold text-green-400 mb-2"
      >
        Countries 🌍
      </motion.h1>
      <p className="text-gray-400 text-sm sm:text-base mb-6">
        All 48 nations at World Cup 2026 — tap a country to see their full profile.
      </p>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search a country..."
        className="w-full max-w-md bg-gray-800 border border-gray-600 text-white px-5 py-3 rounded-full mb-8 focus:outline-none focus:border-green-500"
      />

      {/* Groups Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {Object.entries(filteredGroups).map(([group, teams]) => (
          <motion.div
            key={group}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-2xl p-4 sm:p-5 border border-gray-700"
          >
            <h2 className="text-green-400 font-extrabold text-lg mb-3">
              Group {group}
            </h2>

            <div className="flex flex-col gap-2">
              {teams.map(team => {
                const hasData = !!COUNTRY_DATA[team]
                return (
                  <button
                    key={team}
                    onClick={() => handleCountryClick(team)}
                    disabled={!hasData}
                    className={`flex items-center gap-3 p-3 rounded-xl transition text-left w-full ${
                      hasData
                        ? 'hover:bg-gray-700 active:bg-gray-600 cursor-pointer'
                        : 'opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <img
                      src={`https://flagcdn.com/w40/${FLAGS[team] || 'un'}.png`}
                      alt={team}
                      className="w-9 h-6 object-cover rounded-sm flex-shrink-0"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                    <span className="text-white font-medium flex-1 text-sm sm:text-base">{team}</span>
                    {hasData ? (
                      <span className="text-green-400 text-xs flex-shrink-0">View →</span>
                    ) : (
                      <span className="text-gray-600 text-xs flex-shrink-0">Soon</span>
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Countries