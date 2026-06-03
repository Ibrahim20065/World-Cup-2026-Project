import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import CITY_DATA from '../cityData'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

function WorldCupMap() {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(null)

  const goToCity = (cityName) => {
    navigate(`/cities/${cityName.toLowerCase().replace(/ /g, '-')}`)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-extrabold text-green-400 mb-2"
      >
        Host Cities Map 🗺️
      </motion.h1>
      <p className="text-gray-400 mb-8">
        16 cities across USA, Mexico and Canada. Click any city to explore it and see its matches.
      </p>

      {/* Map */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 380, center: [-100, 40] }}
          style={{ width: '100%', height: 'auto' }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map(geo => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#1f2937"
                  stroke="#374151"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: '#283548', outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {/* City Markers */}
          {Object.entries(CITY_DATA).map(([cityName, city]) => (
            <Marker
              key={cityName}
              coordinates={city.coordinates}
              onMouseEnter={() => setHovered(cityName)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => goToCity(cityName)}
              style={{ default: { cursor: 'pointer' } }}
            >
              {/* Pulsing ring */}
              <circle r={hovered === cityName ? 9 : 6} fill="#22c55e" opacity={0.3}>
                <animate attributeName="r" from="6" to="12" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
              </circle>
              {/* Solid dot */}
              <circle r={hovered === cityName ? 6 : 4} fill="#22c55e" stroke="#fff" strokeWidth={1} />

              {/* City label on hover */}
              {hovered === cityName && (
                <text
                  textAnchor="middle"
                  y={-14}
                  style={{ fill: '#fff', fontSize: '11px', fontWeight: 'bold', pointerEvents: 'none' }}
                >
                  {cityName}
                </text>
              )}
            </Marker>
          ))}
        </ComposableMap>
      </div>

      {/* City quick-list below map */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
        {Object.entries(CITY_DATA).map(([cityName, city]) => (
          <button
            key={cityName}
            onClick={() => goToCity(cityName)}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-green-500 rounded-xl p-3 text-left transition flex items-center gap-3"
          >
            <img
              src={`https://flagcdn.com/w40/${city.flag}.png`}
              alt={city.country}
              className="w-7 h-5 object-cover rounded-sm flex-shrink-0"
              onError={(e) => { e.target.style.display = 'none' }}
            />
            <div className="min-w-0">
              <p className="text-white font-bold text-sm truncate">{cityName}</p>
              <p className="text-gray-500 text-xs truncate">{city.stadium}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default WorldCupMap