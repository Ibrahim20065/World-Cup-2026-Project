import { useState, useEffect } from 'react'

const WC_START = new Date('2026-06-11T19:00:00Z')

function getTimeLeft() {
  const now = new Date()
  const diff = WC_START - now

  if (diff <= 0) return null

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds }
}

function CountdownUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-extrabold text-green-400 tabular-nums leading-none">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">{label}</span>
    </div>
  )
}

function Footer() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft())

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
      <div className="max-w-5xl mx-auto px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">

        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="text-green-400 font-extrabold text-xl tracking-wide">⚽ WC2026</span>
          <span className="text-gray-500 text-xs">
            Made by <span className="text-gray-300 font-semibold">Ibrahim</span>
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          {timeLeft ? (
            <>
              <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">
                🏆 Kickoff in
              </p>
              <div className="flex items-center gap-4">
                <CountdownUnit value={timeLeft.days} label="Days" />
                <span className="text-gray-600 text-xl font-bold mb-3">:</span>
                <CountdownUnit value={timeLeft.hours} label="Hrs" />
                <span className="text-gray-600 text-xl font-bold mb-3">:</span>
                <CountdownUnit value={timeLeft.minutes} label="Min" />
                <span className="text-gray-600 text-xl font-bold mb-3">:</span>
                <CountdownUnit value={timeLeft.seconds} label="Sec" />
              </div>
            </>
          ) : (
            <p className="text-green-400 font-extrabold text-lg animate-pulse">
              🏆 The World Cup is ON!
            </p>
          )}
        </div>

        <div className="flex flex-col items-center md:items-end gap-1">
          <span className="text-gray-500 text-xs">© 2026 WC2026 Predictions</span>
          <span className="text-gray-600 text-xs">All rights reserved</span>
        </div>

      </div>
    </footer>
  )
}

export default Footer