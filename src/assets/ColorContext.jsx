import { createContext, useContext, useState, useEffect } from 'react'

const ColorContext = createContext()

const COLOR_BACKGROUNDS = {
  '#3b82f6': '#080d1a',
  '#22c55e': '#061a0d',
  '#8b5cf6': '#0d0818',
  '#ef4444': '#1a0808',
  '#f97316': '#1a0e06',
  '#fbbf24': '#1a1506',
  '#f1f5f9': '#0f1117',
}

const COLOR_NAVBARS = {
  '#3b82f6': 'rgba(8,13,26,0.95)',
  '#22c55e': 'rgba(6,26,13,0.95)',
  '#8b5cf6': 'rgba(13,8,24,0.95)',
  '#ef4444': 'rgba(26,8,8,0.95)',
  '#f97316': 'rgba(26,14,6,0.95)',
  '#fbbf24': 'rgba(26,21,6,0.95)',
  '#f1f5f9': 'rgba(15,17,23,0.95)',
}

export function ColorProvider({ children }) {
  const [accent, setAccent] = useState(() => localStorage.getItem('accentColor') || '#3b82f6')

  const changeColor = (color) => {
    setAccent(color)
    localStorage.setItem('accentColor', color)
    document.documentElement.style.setProperty('--accent', color)
    document.documentElement.style.setProperty('--bg', COLOR_BACKGROUNDS[color] || '#080d1a')
    document.documentElement.style.setProperty('--navbar-bg', COLOR_NAVBARS[color] || 'rgba(8,13,26,0.95)')
  }

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accent)
    document.documentElement.style.setProperty('--bg', COLOR_BACKGROUNDS[accent] || '#080d1a')
    document.documentElement.style.setProperty('--navbar-bg', COLOR_NAVBARS[accent] || 'rgba(8,13,26,0.95)')
  }, [])

  return (
    <ColorContext.Provider value={{ accent, changeColor }}>
      {children}
    </ColorContext.Provider>
  )
}

export function useColor() {
  return useContext(ColorContext)
}