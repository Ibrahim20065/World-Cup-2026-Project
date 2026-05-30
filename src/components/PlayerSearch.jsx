import { useState } from 'react'
import PLAYERS from '../players'

// ============================================================
// PLAYER SEARCH — reusable autocomplete input for award picks
// ============================================================
function PlayerSearch({ value, onChange, placeholder, ringColor = 'focus-within:ring-green-500' }) {
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Filter players based on what user types
  const handleChange = (val) => {
    setQuery(val)
    onChange(val)

    if (val.length >= 2) {
      const filtered = PLAYERS.filter(p =>
        p.name.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 6) // show max 6 suggestions
      setSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  // When user clicks a suggestion
  const handleSelect = (player) => {
    setQuery(player.name)
    onChange(player.name)
    setSuggestions([])
    setShowSuggestions(false)
  }

  return (
    <div className="relative">
      {/* Input field */}
      <div className={`flex items-center bg-gray-700 rounded-lg ring-2 ring-transparent ${ringColor} transition`}>
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          placeholder={placeholder || 'Search player...'}
          className="w-full bg-transparent text-white px-4 py-3 focus:outline-none"
        />
        {/* Clear button */}
        {query && (
          <button
            onClick={() => { setQuery(''); onChange(''); setSuggestions([]) }}
            className="px-3 text-gray-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl overflow-hidden">
          {suggestions.map((player) => (
            <button
              key={player.name}
              onMouseDown={() => handleSelect(player)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition text-left"
            >
              {/* Country flag */}
              <img
                src={`https://flagcdn.com/w40/${player.flag}.png`}
                alt={player.country}
                className="w-7 h-5 object-cover rounded-sm flex-shrink-0"
                onError={(e) => { e.target.style.display = 'none' }}
              />
              {/* Player name */}
              <span className="text-white font-medium flex-1">{player.name}</span>
              {/* Country + position */}
              <span className="text-gray-400 text-xs">{player.country} · {player.position}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default PlayerSearch