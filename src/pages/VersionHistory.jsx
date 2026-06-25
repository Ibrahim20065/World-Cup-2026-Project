import { motion } from 'framer-motion'

const VERSIONS = [
  {
    version: 'v1.03',
    date: 'June 26, 2026',
    color: '#ef4444',
    label: 'Latest',
    changes: [
      { icon: '📋', text: 'Version History page — dedicated changelog page showing all app updates' },
      { icon: '👤', text: 'Profile dropdown — avatar now opens a clean dropdown with Settings, Admin and Logout' },
      { icon: '📱', text: 'Mobile login fix — app no longer redirects logged-in users to the login page on mobile' },
      { icon: '🏆', text: 'Live scoring improved — fallback search added so scores like Australia vs Turkey and Curaçao are never missed' },
      { icon: '⚽', text: 'Match day switching fixed — match picks only switch to next day when ALL matches of the day have kicked off' },
      { icon: '🌍', text: 'Timezone fix — dates now correctly change after midnight in all timezones worldwide' },
      { icon: '🔄', text: 'Scores on refresh — live scores no longer flash blank when the page refreshes during a match' },
      { icon: '🎯', text: 'R32 seeding fixed — projected bracket now uses the exact official FIFA 3rd place seeding rules' },
      { icon: '📧', text: 'Match pick reminders — email notification sent 1 hour before the first match of each day closes, only if you haven\'t made your picks yet' },
    ],
  },
  {
    version: 'v1.02',
    date: 'June 15, 2026',
    color: '#22c55e',
    label: null,
    changes: [
      { icon: '⚙️', text: 'Account Settings — change username, email, password, toggle notifications, delete account' },
      { icon: '🎯', text: 'Qualification tracker — see which teams advanced and which are eliminated with custom messages' },
      { icon: '🗂️', text: 'Projected R32 bracket — live bracket based on current standings, updates after every matchday' },
      { icon: '🥉', text: 'Best 3rd Place rankings — live table showing all 12 third-place teams ranked' },
      { icon: '🌍', text: 'Local time display — all match times shown in your own timezone automatically' },
      { icon: '🔒', text: 'Per-match locking — each match locks independently 10 minutes before its own kickoff' },
      { icon: '🏆', text: 'Live scoring — points awarded automatically within 5 minutes of a match finishing' },
      { icon: '🔄', text: 'Permanent scores — finished match scores never reset or disappear' },
      { icon: '📱', text: 'Vercel Analytics — page view tracking added' },
    ],
  },
  {
    version: 'v1.01',
    date: 'June 12, 2026',
    color: '#3b82f6',
    label: null,
    changes: [
      { icon: '📊', text: 'Group Standings page — live tables updated after each match' },
      { icon: '🎨', text: 'Theme color changer — pick your accent color in the navbar' },
      { icon: '⚽', text: 'Live Scores — powered by TheSportsDB, updates automatically after FT' },
      { icon: '🔒', text: 'Prediction locking — Group Stage & 3rd Place save without locking, Knockout submits lock permanently' },
      { icon: '🏆', text: 'Mini Leagues — create and join private leagues with invite codes' },
      { icon: '🌍', text: 'Background color — changes with your selected theme' },
      { icon: '📧', text: 'Email verification — secure signup with 6-digit code' },
    ],
  },
  {
    version: 'v1.00',
    date: 'June 11, 2026',
    color: '#8b5cf6',
    label: 'Launch',
    changes: [
      { icon: '🎯', text: 'Group stage predictions — drag and drop teams to rank each group' },
      { icon: '🏆', text: 'Knockout bracket — full tournament bracket from R32 to the Final' },
      { icon: '🥉', text: '3rd place predictions — pick your 8 best third-place teams' },
      { icon: '🏅', text: 'Awards predictions — Golden Ball, Boot, Glove and Best U21 player' },
      { icon: '⚽', text: 'Match Picks — predict exact scores for every group stage match' },
      { icon: '📊', text: 'Leaderboard — real-time rankings among all users' },
      { icon: '🌍', text: 'Countries — explore all 48 squads at the tournament' },
      { icon: '🗺️', text: 'Host Cities — discover all 16 stadiums across USA, Mexico and Canada' },
      { icon: '📖', text: 'World Cup History — explore past World Cup tournaments' },
    ],
  },
]

export default function VersionHistory() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff', fontFamily: 'Barlow, system-ui, sans-serif' }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, var(--accent), #8b5cf6, #ec4899, #14b8a6, #f59e0b, #84cc16, #6366f1)' }} />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 16px 80px' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>WC2026 App</div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, margin: '0 0 10px', letterSpacing: '-0.02em', fontFamily: 'Bebas Neue, sans-serif' }}>
            Version History 📋
          </h1>
          <p style={{ color: '#64748b', fontSize: 15, margin: 0, lineHeight: 1.6 }}>
            A full changelog of every update made to the WC2026 Predictions app. Built by Ibrahim Mohammad.
          </p>
        </motion.div>

        {/* Timeline */}
        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{ position: 'absolute', left: 19, top: 0, bottom: 0, width: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1 }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {VERSIONS.map((v, vi) => (
              <motion.div key={v.version}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: vi * 0.1 }}
                style={{ display: 'flex', gap: 24 }}>

                {/* Circle on timeline */}
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 2 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${v.color}18`, border: `2px solid ${v.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: v.color, boxShadow: `0 0 8px ${v.color}` }} />
                  </div>
                </div>

                {/* Card */}
                <div style={{ flex: 1, background: '#0d1526', border: `1px solid ${v.color}25`, borderTop: `3px solid ${v.color}`, borderRadius: 14, padding: '20px 24px', marginBottom: 4 }}>
                  {/* Version header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 900, fontSize: 22, color: v.color, fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.05em' }}>
                      {v.version}
                    </span>
                    {v.label && (
                      <span style={{ fontSize: 10, fontWeight: 800, color: v.color, background: `${v.color}18`, border: `1px solid ${v.color}40`, padding: '2px 8px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {v.label}
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: '#334155', fontWeight: 600, marginLeft: 'auto' }}>{v.date}</span>
                  </div>

                  {/* Changes list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {v.changes.map((change, ci) => (
                      <motion.div key={ci}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: vi * 0.1 + ci * 0.04 }}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{change.icon}</span>
                        <span style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{change.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ color: '#334155', fontSize: 12, textAlign: 'center', marginTop: 48 }}>
          Built with React, Flask, and a lot of late nights ☕ — by Ibrahim Mohammad
        </motion.p>
      </div>
    </div>
  )
}