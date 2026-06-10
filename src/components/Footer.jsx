import { useState, useEffect } from 'react'
import wc2026 from '../assets/wc2026-logo.png'

const WC_START = new Date('2026-06-11T19:00:00Z')

const GROUP_COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e',
  '#06b6d4','#3b82f6','#8b5cf6','#ec4899',
  '#14b8a6','#f59e0b','#84cc16','#6366f1',
]

function getTimeLeft() {
  const diff = WC_START - new Date()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  }
}

function CountdownUnit({ value, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 44 }}>
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8, padding: '8px 10px', minWidth: 44, textAlign: 'center',
        fontVariantNumeric: 'tabular-nums',
      }}>
        <span style={{ fontSize: 22, fontWeight: 900, color: '#f1f5f9', lineHeight: 1 }}>
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span style={{ fontSize: 9, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 5 }}>
        {label}
      </span>
    </div>
  )
}

function Footer() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft())

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <footer style={{
      background: '#080d1a',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      fontFamily: 'Barlow, system-ui, sans-serif',
      marginTop: 'auto',
    }}>
      {/* Bottom color bar */}
      <div style={{
  height: 2,
  background: 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #14b8a6, #f59e0b, #84cc16, #6366f1)',
}} />

      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '28px 24px',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center',
        justifyContent: 'space-between', gap: 24,
      }}>

        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img 
                src={wc2026}
                alt="WC2026"
                style={{ width: 36, height: 36, objectFit: 'contain' }}
              />
            <span style={{ fontWeight: 900, fontSize: 16, color: '#f1f5f9', letterSpacing: '-0.02em' }}>WC2026</span>
          </div>
          <span style={{ fontSize: 11, color: '#334155' }}>
            Made by <span style={{ color: '#475569', fontWeight: 600 }}>Ibrahim Mohammad</span>
          </span>
        </div>

        {/* Countdown */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          {timeLeft ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Kickoff in
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <CountdownUnit value={timeLeft.days} label="Days" />
                <span style={{ color: '#1e2d45', fontSize: 20, fontWeight: 700, marginTop: 8 }}>:</span>
                <CountdownUnit value={timeLeft.hours} label="Hrs" />
                <span style={{ color: '#1e2d45', fontSize: 20, fontWeight: 700, marginTop: 8 }}>:</span>
                <CountdownUnit value={timeLeft.minutes} label="Min" />
                <span style={{ color: '#1e2d45', fontSize: 20, fontWeight: 700, marginTop: 8 }}>:</span>
                <CountdownUnit value={timeLeft.seconds} label="Sec" />
              </div>
            </>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 100, padding: '8px 20px',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontWeight: 800, fontSize: 15, color: '#22c55e' }}>The World Cup is ON!</span>
            </div>
          )}
        </div>

        {/* Copyright */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{ fontSize: 11, color: '#334155' }}>© 2026 WC2026 Predictions</span>
          <span style={{ fontSize: 10, color: '#1e2d45' }}>All rights reserved</span>
        </div>

      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </footer>
  )
}

export default Footer