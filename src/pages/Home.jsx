import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../assets/AuthContext'
import API_URL from '../config'
import axios from 'axios'
import { useState } from 'react'
import { useColor } from '../assets/ColorContext'

const STATS = [
  { value: '48', label: 'Nations' },
  { value: '104', label: 'Matches' },
  { value: '16', label: 'Host Cities' },
  { value: '3', label: 'Countries' },
]

function FeedbackForm() {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim() || !message.trim()) return
    setSending(true)
    try {
      await axios.post(`${API_URL}/api/feedback`, { name, message })
      setSent(true)
    } catch {
      alert('Something went wrong. Try again!')
    }
    setSending(false)
  }

  if (sent) return (
    <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: '20px', textAlign: 'center' }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
      <p style={{ color: '#22c55e', fontWeight: 700, margin: 0 }}>Thanks for your feedback!</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input type="text" value={name} onChange={e => setName(e.target.value)}
        placeholder="Your name"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', padding: '10px 14px', borderRadius: 10, fontSize: 14, outline: 'none' }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
      <textarea value={message} onChange={e => setMessage(e.target.value)}
        placeholder="Your feedback..."
        rows={4}
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', padding: '10px 14px', borderRadius: 10, fontSize: 14, outline: 'none', resize: 'none' }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
      <button onClick={handleSubmit} disabled={sending || !name.trim() || !message.trim()}
        style={{ background: 'linear-gradient(135deg, var(--accent), #1d4ed8)', color: '#fff', fontWeight: 700, fontSize: 14, padding: '11px', borderRadius: 10, border: 'none', cursor: 'pointer', opacity: sending ? 0.7 : 1 }}>
        {sending ? 'Sending...' : 'Send Feedback'}
      </button>
    </div>
  )
}

const FEATURES = [
  { icon: '🎯', title: 'Predict', desc: 'Pick every group, every bracket match, and every award — then watch your score climb in real time.', color: 'var(--accent)', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)' , link: '/predictions' },
  { icon: '⚡', title: 'Live Scores', desc: 'Goals, cards, and live match minutes — all updated automatically during every game.', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', link: '/livescores' },
  { icon: '🏅', title: 'Leaderboard', desc: 'See exactly where you stand among friends and family after every result.', color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)', link:'/leaderboard'},
  { icon: '🌍', title: 'Countries', desc: 'Explore all 48 squads, histories, and stats for every nation at the tournament.', color: '#a855f7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.25)', link: '/countries' },
  { icon: '🗺️', title: 'Host Cities', desc: 'Discover the 16 stadiums across USA, Mexico, and Canada hosting the matches.', color: '#ec4899', bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.25)' , link:'/map'},
  { icon: '🔄', title: 'Second Chance', desc: 'Group stage done? Get a fresh bracket prediction once the knockout stage begins.', color: '#06b6d4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.25)', link:'/predictions' },
]

const GROUP_COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','var(--accent)','#8b5cf6','#ec4899','#14b8a6','#f59e0b','#84cc16','#6366f1']
const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

export default function Home() {
  const { user } = useAuth()

  return (
    <div style={{ background: '#var(--bg)', minHeight: '100vh', color: '#fff', fontFamily: 'Barlow, system-ui, sans-serif' }}>

      {/* ── HERO ── */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.18) 0%, transparent 70%)' }} />
        <div style={{ height: 2, background: 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, var(--accent), #8b5cf6, #ec4899, #14b8a6, #f59e0b, #84cc16, #6366f1)' }} />

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '72px 24px 64px', textAlign: 'center', position: 'relative' }}>

          {/* Eyebrow */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 100, padding: '6px 16px', marginBottom: 28 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#93c5fd', letterSpacing: '0.08em', textTransform: 'uppercase' }}>June 11 – July 19, 2026</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }}
            style={{ fontSize: 'clamp(36px, 7vw, 72px)', fontWeight: 900, lineHeight: 1.05, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
            <span style={{ color: '#fff' }}>FIFA World Cup</span><br />
            <span style={{ background: 'linear-gradient(90deg, var(--accent), #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              2026 Predictions
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.7 }}
            style={{ fontSize: 'clamp(15px, 2.5vw, 19px)', color: '#94a3b8', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.6 }}>
            Pick every winner from group stage to the final. Score points for every correct call. Beat your friends.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={user ? '/livescores' : '/signup'}
              style={{ background: 'linear-gradient(135deg, var(--accent), #1d4ed8)', color: '#fff', fontWeight: 700, fontSize: 15, padding: '14px 32px', borderRadius: 100, textDecoration: 'none', transition: 'opacity 0.2s', boxShadow: '0 4px 24px rgba(59,130,246,0.35)' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              Get Started →
            </Link>
            <Link to="/predictions"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700, fontSize: 15, padding: '14px 32px', borderRadius: 100, textDecoration: 'none', transition: 'background 0.2s', backdropFilter: 'blur(8px)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
              Make Predictions
            </Link>
          </motion.div>

          {/* Update boxes — animated with motion */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 600, margin: '32px auto 0' }}
          >
            {/* v1.02 — latest */}
            <div style={{ padding: '16px 20px', background: '#0d1526', border: '1px solid rgba(34,197,94,0.2)', borderLeft: '4px solid #22c55e', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 16 }}>🆕</span>
                <span style={{ fontWeight: 800, fontSize: 15, color: '#86efac' }}>Update v1.02</span>
                <span style={{ fontSize: 11, color: '#334155', fontWeight: 600, marginLeft: 'auto' }}>June 15, 2026</span>
              </div>
              <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  '⚙️ Account Settings — change username, email, password, toggle notifications, delete account',
                  '🎯 Qualification tracker — see which teams advanced and which are eliminated with custom messages',
                  '🌍 Local time display — all match times shown in your own timezone automatically',
                  '🔒 Per-match locking — each match locks independently 10 minutes before its own kickoff',
                  '🏆 Live scoring — points awarded automatically within 5 minutes of a match finishing',
                  '🔄 Permanent scores — finished match scores never reset or disappear',
                ].map((item, i) => (
                  <li key={i} style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.5 }}>{item}</li>
                ))}
              </ul>
            </div>

            {/* v1.01 — older, faded */}
            <div style={{ padding: '16px 20px', background: '#0d1526', border: '1px solid rgba(59,130,246,0.12)', borderLeft: '4px solid #3b82f6', borderRadius: 12, opacity: 0.6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 16 }}>📋</span>
                <span style={{ fontWeight: 800, fontSize: 15, color: '#93c5fd' }}>Update v1.01</span>
                <span style={{ fontSize: 11, color: '#334155', fontWeight: 600, marginLeft: 'auto' }}>June 12, 2026</span>
              </div>
              <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  '📊 Group Standings page — live tables updated after each match',
                  '🎨 Theme color changer — pick your accent color in the navbar',
                  '⚽ Live Scores — now powered by TheSportsDB, updates after FT',
                  '🔒 Prediction locking — Group Stage & 3rd Place save without locking, Knockout submits lock permanently',
                  '🏆 Mini Leagues — create and join private leagues with invite codes',
                  '🌍 Background color — changes with your selected theme',
                  '📧 Email verification — secure signup with 6-digit code',
                ].map((item, i) => (
                  <li key={i} style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.5 }}>{item}</li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.6 }}
            style={{ display: 'flex', gap: 0, justifyContent: 'center', marginTop: 64, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', maxWidth: 480, marginInline: 'auto' }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ flex: 1, padding: '20px 8px', textAlign: 'center', borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── GROUP COLOR LEGEND ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 56px' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {GROUPS.map((g, i) => (
            <Link key={g} to="/predictions"
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', border: `1px solid ${GROUP_COLORS[i]}40`, borderRadius: 8, padding: '6px 12px', textDecoration: 'none', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = `${GROUP_COLORS[i]}18`}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: GROUP_COLORS[i], flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#cbd5e1' }}>Group {g}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 80px' }}>
  <div style={{ textAlign: 'center', marginBottom: 40 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Everything in one place</div>
    <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, margin: 0, color: '#f1f5f9' }}>Built for the tournament</h2>
  </div>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
    {FEATURES.map((f, i) => (
      <Link key={i} to={f.link} style={{ textDecoration: 'none' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * i, duration: 0.5 }}
          style={{ background: f.bg, border: `1px solid ${f.border}`, borderRadius: 16, padding: '24px', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
          whileHover={{ y: -6, scale: 1.02 }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: f.color, marginBottom: 8 }}>{f.title}</div>
          <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{f.desc}</div>
        </motion.div>
      </Link>
    ))}
  </div>
</div>

      {/* ── BOTTOM CTA BANNER ── */}
      <div style={{ padding: '0 24px 80px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ maxWidth: 900, margin: '0 auto', background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(34,197,94,0.1))', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 20, padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 'clamp(20px, 4vw, 30px)', fontWeight: 800, marginBottom: 12 }}>Ready to predict the champion?</div>
          <div style={{ color: '#94a3b8', fontSize: 14, marginBottom: 28, maxWidth: 400, margin: '0 auto 28px' }}>
            Predictions lock when the first match kicks off on June 11 at 19:00 UTC.
          </div>
          <Link to={user ? '/predictions' : '/signup'}
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#000', fontWeight: 800, fontSize: 15, padding: '14px 36px', borderRadius: 100, textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 24px rgba(34,197,94,0.3)', transition: 'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            {user ? 'Go to Predictions' : 'Sign Up Free'}
          </Link>
        </motion.div>

        {/* ── ABOUT SECTION ── */}
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 0 80px' }}>
          <div style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '40px 32px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>About</div>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: '#f1f5f9', margin: '0 0 12px', letterSpacing: '-0.02em' }}>Developed by Ibrahim Mohammad</h2>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, margin: '0 0 16px' }}>
                  This is my first ever full-stack project — built from scratch during the FIFA World Cup 2026. A passion project combining my love for football and software development.
                </p>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  Built with React, Flask, and a lot of late nights. If you enjoy it, share it with your friends and fight against each other to see who finishes on top of the leaderboard!
                </p>
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Send Feedback</div>
                <FeedbackForm />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}