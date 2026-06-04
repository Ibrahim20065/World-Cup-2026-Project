import { useState, useRef, useEffect } from 'react'
import PLAYERS from '../players'

function PlayerSearch({ value, onChange, placeholder, ringColor = 'focus-within:ring-green-500', playerList }) {
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const ref = useRef(null)

  const searchPool = playerList || PLAYERS

  useEffect(() => { setQuery(value || '') }, [value])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setShowSuggestions(false)
        const match = searchPool.find(p => p.name.toLowerCase() === query.toLowerCase())
        if (!match && query) {
          setQuery('')
          onChange('')
        }
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [query, searchPool, onChange])

  const handleChange = (val) => {
    setQuery(val)
    onChange(val)
    if (val.length >= 2) {
      const filtered = searchPool.filter(p =>
        p.name.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 6)
      setSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSelect = (player) => {
    setQuery(player.name)
    onChange(player.name)
    setSuggestions([])
    setShowSuggestions(false)
  }

  return (
    <div className="relative" ref={ref}>
      <div className={`flex items-center bg-gray-700 rounded-lg ring-2 ring-transparent ${ringColor} transition`}>
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          placeholder={placeholder || 'Search player...'}
          className="w-full bg-transparent text-white px-4 py-3 focus:outline-none"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); onChange(''); setSuggestions([]) }}
            className="px-3 text-gray-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl overflow-hidden">
          {suggestions.map((player) => (
            <button
              key={player.name}
              onMouseDown={() => handleSelect(player)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition text-left"
            >
              <img
                src={`https://flagcdn.com/w40/${player.flag}.png`}
                alt={player.country}
                className="w-7 h-5 object-cover rounded-sm flex-shrink-0"
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <span className="text-white font-medium flex-1">{player.name}</span>
              <span className="text-gray-400 text-xs">{player.country} · {player.position}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default PlayerSearch
