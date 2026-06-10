import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import CITY_DATA from '../cityData'
import API_URL from '../config'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const GROUP_COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e',
  '#06b6d4','#3b82f6','#8b5cf6','#ec4899',
  '#14b8a6','#f59e0b','#84cc16','#6366f1',
]

// Country accent colors
const COUNTRY_COLORS = { us: '#3b82f6', mx: '#22c55e', ca: '#ef4444' }

function WorldCupMap() {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(null)

  const goToCity = (cityName) => {
    navigate(`/cities/${cityName.toLowerCase().replace(/ /g, '-')}`)
  }

  // Group cities by country
  const byCountry = Object.entries(CITY_DATA).reduce((acc, [name, city]) => {
    const key = city.country || 'USA'
    if (!acc[key]) acc[key] = []
    acc[key].push([name, city])
    return acc
  }, {})

  return (
    <div style={{ minHeight: '100vh', background: '#080d1a', color: '#fff', fontFamily: 'Barlow, system-ui, sans-serif' }}>

      {/* Top color bar */}
      <div style={{
  height: 3,
  background: 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #14b8a6, #f59e0b, #84cc16, #6366f1)',
}} />      

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            FIFA World Cup 2026
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.02em', fontFamily: 'Bebas Neue, sans-serif' }}>
            Host Cities <span style={{ color: '#3b82f6' }}>🗺️</span>
          </h1>
          <p style={{ color: '#475569', fontSize: 14, margin: 0 }}>
            16 cities across USA, Mexico and Canada — tap any city to explore it.
          </p>
        </div>

        {/* Host country pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { flag: 'us', name: 'United States', count: Object.values(CITY_DATA).filter(c => c.flag === 'us').length },
            { flag: 'mx', name: 'Mexico', count: Object.values(CITY_DATA).filter(c => c.flag === 'mx').length },
            { flag: 'ca', name: 'Canada', count: Object.values(CITY_DATA).filter(c => c.flag === 'ca').length },
          ].map(({ flag, name, count }) => (
            <div key={flag} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 100, padding: '6px 14px',
            }}>
              <img src={`https://flagcdn.com/w40/${flag}.png`} alt={name}
                style={{ width: 20, height: 14, objectFit: 'cover', borderRadius: 2 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>{name}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', background: 'rgba(255,255,255,0.06)', borderRadius: 100, padding: '1px 7px' }}>{count}</span>
            </div>
          ))}
        </div>

        {/* Map */}
        <div style={{
          background: '#0d1526', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16, overflow: 'hidden', marginBottom: 24,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 380, center: [-100, 40] }}
            style={{ width: '100%', height: 'auto', minHeight: '250px' }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map(geo => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#0f1729"
                    stroke="#1e2d45"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { fill: '#162036', outline: 'none' },
                      pressed: { outline: 'none' },
                    }}
                  />
                ))
              }
            </Geographies>

            {Object.entries(CITY_DATA).map(([cityName, city]) => {
              const isHovered = hovered === cityName
              const dotColor = city.flag === 'mx' ? '#22c55e' : city.flag === 'ca' ? '#ef4444' : '#3b82f6'
              return (
                <Marker
                  key={cityName}
                  coordinates={city.coordinates}
                  onMouseEnter={() => setHovered(cityName)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => goToCity(cityName)}
                  style={{ default: { cursor: 'pointer' } }}
                >
                  {/* Pulse ring */}
                  <circle r={isHovered ? 14 : 10} fill={dotColor} opacity={0.12} />
                  <circle r={isHovered ? 10 : 7} fill={dotColor} opacity={0.2} />
                  {/* Main dot */}
                  <circle r={isHovered ? 6 : 4} fill={dotColor} stroke="#fff" strokeWidth={1.5} />
                  {/* Label */}
                  {isHovered && (
                    <text
                      textAnchor="middle"
                      y={-16}
                      style={{
                        fill: '#fff', fontSize: '11px', fontWeight: 800,
                        pointerEvents: 'none', textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                      }}
                    >
                      {cityName}
                    </text>
                  )}
                </Marker>
              )
            })}
          </ComposableMap>
        </div>

        {/* City grid — grouped by country */}
        {Object.entries(byCountry).map(([country, cities]) => {
          const flagMap = { 'USA': 'us', 'Mexico': 'mx', 'Canada': 'ca' }
          const accentMap = { 'USA': '#3b82f6', 'Mexico': '#22c55e', 'Canada': '#ef4444' }
          const accent = accentMap[country] || '#3b82f6'
          const flagCode = flagMap[country] || 'us'

          return (
            <div key={country} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <img src={`https://flagcdn.com/w40/${flagCode}.png`} alt={country}
                  style={{ width: 28, height: 19, objectFit: 'cover', borderRadius: 3 }} />
                <span style={{ fontWeight: 800, fontSize: 14, color: '#94a3b8' }}>{country}</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>{cities.length} cities</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                {cities.map(([cityName, city]) => (
                  <button
                    key={cityName}
                    onClick={() => goToCity(cityName)}
                    style={{
                      background: '#0d1526',
                      border: `1px solid rgba(255,255,255,0.06)`,
                      borderLeft: `3px solid ${accent}`,
                      borderRadius: 10, padding: '12px 14px',
                      cursor: 'pointer', textAlign: 'left',
                      display: 'flex', alignItems: 'center', gap: 10,
                      transition: 'background 0.15s, border-color 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = `${accent}10`
                      e.currentTarget.style.borderColor = `${accent}50`
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#0d1526'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                      e.currentTarget.style.borderLeftColor = accent
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: `${accent}15`, border: `1px solid ${accent}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, flexShrink: 0,
                    }}>🏟️</div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cityName}</p>
                      <p style={{ color: '#334155', fontSize: 11, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{city.stadium}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default WorldCupMap