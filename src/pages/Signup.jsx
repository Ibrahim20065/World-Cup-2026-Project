import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useAuth } from '../assets/AuthContext'
import toast from 'react-hot-toast'

const GROUP_COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e',
  '#06b6d4','#3b82f6','#8b5cf6','#ec4899',
  '#14b8a6','#f59e0b','#84cc16','#6366f1',
]

const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#f1f5f9', padding: '12px 14px',
  borderRadius: 10, fontSize: 14, outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.2s',
}

const labelStyle = {
  color: '#64748b', fontSize: 12, fontWeight: 600,
  display: 'block', marginBottom: 6,
  textTransform: 'uppercase', letterSpacing: '0.06em',
}

function Signup() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('signup')
  const [code, setCode] = useState('')
  const [pendingEmail, setPendingEmail] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSignup = async () => {
    if (password !== confirm) { toast.error('Passwords do not match!'); return }
    setLoading(true)
    try {
      await axios.post('http://192.168.100.3:5000/api/signup', { username, email, password })
      setPendingEmail(email)
      setStep('verify')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong')
    }
    setLoading(false)
  }

  const handleVerify = async () => {
    setLoading(true)
    try {
      const response = await axios.post('http://192.168.100.3:5000/api/verify', { email: pendingEmail, code })
      login(response.data)
      toast.success('Welcome to WC2026! ⚽')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid code, try again')
    }
    setLoading(false)
  }

  // ── VERIFY SCREEN ──
  if (step === 'verify') {
    return (
      <div style={{ minHeight: '100vh', background: '#080d1a', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ display: 'flex', height: 3 }}>
          {GROUP_COLORS.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
          <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(34,197,94,0.08) 0%, transparent 70%)' }} />
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
            <div style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '36px 32px', boxShadow: '0 24px 64px rgba(0,0,0,0.5)', textAlign: 'center' }}>

              {/* Icon */}
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, margin: '0 auto 20px',
              }}>📧</div>

              <h1 style={{ fontSize: 22, fontWeight: 900, color: '#f1f5f9', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                Check your email
              </h1>
              <p style={{ color: '#475569', fontSize: 14, margin: '0 0 6px' }}>We sent a 6-digit code to:</p>
              <p style={{ color: '#22c55e', fontWeight: 700, fontSize: 14, margin: '0 0 28px', wordBreak: 'break-all' }}>{pendingEmail}</p>

              {/* Code input */}
              <input
                type="text" value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000" maxLength={6}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)',
                  border: `2px solid ${code.length === 6 ? '#22c55e' : 'rgba(255,255,255,0.08)'}`,
                  color: '#f1f5f9', textAlign: 'center',
                  fontSize: 32, fontWeight: 900, letterSpacing: '0.3em',
                  padding: '16px', borderRadius: 12, outline: 'none',
                  boxSizing: 'border-box', marginBottom: 20,
                  transition: 'border-color 0.2s',
                }}
              />

              {/* Progress dots */}
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
                {[0,1,2,3,4,5].map(i => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: i < code.length ? '#22c55e' : 'rgba(255,255,255,0.08)',
                    transition: 'background 0.15s',
                  }} />
                ))}
              </div>

              <button onClick={handleVerify} disabled={loading || code.length !== 6}
                style={{
                  width: '100%',
                  background: code.length === 6 && !loading ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'rgba(255,255,255,0.06)',
                  color: code.length === 6 && !loading ? '#000' : '#475569',
                  fontWeight: 800, fontSize: 15, padding: '13px',
                  borderRadius: 10, border: 'none',
                  cursor: code.length === 6 && !loading ? 'pointer' : 'not-allowed',
                  boxShadow: code.length === 6 ? '0 4px 16px rgba(34,197,94,0.3)' : 'none',
                  transition: 'all 0.2s',
                }}>
                {loading ? 'Verifying...' : 'Verify & Enter →'}
              </button>

              <p style={{ color: '#334155', fontSize: 12, marginTop: 20 }}>
                Didn't get it? Check your spam or{' '}
                <button onClick={() => setStep('signup')}
                  style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: 0 }}>
                  go back
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // ── SIGNUP SCREEN ──
  return (
    <div style={{ minHeight: '100vh', background: '#080d1a', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif' }}>

      <div style={{ display: 'flex', height: 3 }}>
        {GROUP_COLORS.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,130,246,0.1) 0%, transparent 70%)' }} />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 420, position: 'relative' }}>

          <div style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '36px 32px', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>

            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, margin: '0 auto 14px',
                boxShadow: '0 8px 24px rgba(59,130,246,0.3)',
              }}>⚽</div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: '#f1f5f9', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                Join WC2026
              </h1>
              <p style={{ color: '#475569', fontSize: 14, margin: 0 }}>
                Create your account and start predicting
              </p>
            </div>

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              <div>
                <label style={labelStyle}>Username</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. ibrahim_wc" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
              </div>

              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
              </div>

              <div>
                <label style={labelStyle}>Confirm Password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    ...inputStyle,
                    borderColor: confirm && password && confirm !== password ? '#ef4444' : 'rgba(255,255,255,0.08)',
                  }}
                  onFocus={e => e.target.style.borderColor = confirm !== password ? '#ef4444' : '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = confirm && password && confirm !== password ? '#ef4444' : 'rgba(255,255,255,0.08)'} />
                {confirm && password && confirm !== password && (
                  <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4, fontWeight: 600 }}>Passwords don't match</p>
                )}
              </div>

              <button onClick={handleSignup} disabled={loading}
                style={{
                  background: loading ? 'rgba(59,130,246,0.5)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: '#fff', fontWeight: 800, fontSize: 15,
                  padding: '13px', borderRadius: 10, border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4,
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(59,130,246,0.3)',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.88' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}>
                {loading ? 'Creating account...' : 'Create Account →'}
              </button>
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              <span style={{ color: '#334155', fontSize: 12, fontWeight: 600 }}>Already have an account?</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            </div>

            <Link to="/login" style={{
              display: 'block', textAlign: 'center',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#94a3b8', fontWeight: 700, fontSize: 14,
              padding: '12px', borderRadius: 10, textDecoration: 'none',
              transition: 'background 0.15s, color 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#f1f5f9' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#94a3b8' }}>
              Sign in instead
            </Link>
          </div>

          <p style={{ textAlign: 'center', color: '#334155', fontSize: 12, marginTop: 20 }}>
            Predictions lock June 11 at 19:00 UTC ⏱️
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Signup