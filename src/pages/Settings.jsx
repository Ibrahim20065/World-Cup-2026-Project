import { useState, useEffect } from "react";
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import API_URL from '../config'
import { useAuth } from '../assets/AuthContext'

function Settings() {
  const navigate = useNavigate()
  const { user, logout, setUser } = useAuth() || {}
  const token = localStorage.getItem('token')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Profile data
  const [username, setUsername] = useState('')
  const [currentEmail, setCurrentEmail] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(true)

  // Username form
  const [newUsername, setNewUsername] = useState('')

  // Email form
  const [newEmail, setNewEmail] = useState('')
  const [emailStep, setEmailStep] = useState('input') // 'input' | 'verify'
  const [emailCode, setEmailCode] = useState('')

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    axios.get(`${API_URL}/api/settings/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setUsername(res.data.username)
        setNewUsername(res.data.username)
        setCurrentEmail(res.data.email)
        setEmailNotifications(res.data.email_notifications)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // ── Username ──
  const saveUsername = async () => {
    if (!newUsername.trim() || newUsername.trim().length < 3) {
      toast.error('Username must be at least 3 characters')
      return
    }
    if (newUsername === username) return
    setSaving(true)
    try {
      const res = await axios.post(`${API_URL}/api/settings/username`, { username: newUsername.trim() }, { headers: { Authorization: `Bearer ${token}` } })
      setUsername(res.data.username)
      localStorage.setItem('username', res.data.username)
      toast.success('Username updated! ✅')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update username')
    }
    setSaving(false)
  }

  // ── Email ──
  const requestEmailChange = async () => {
    if (!newEmail.trim() || !newEmail.includes('@')) {
      toast.error('Enter a valid email')
      return
    }
    setSaving(true)
    try {
      await axios.post(`${API_URL}/api/settings/email`, { email: newEmail.trim().toLowerCase() }, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Verification code sent! 📧')
      setEmailStep('verify')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send code')
    }
    setSaving(false)
  }

  const verifyEmailChange = async () => {
    if (emailCode.length !== 6) {
      toast.error('Enter the 6-digit code')
      return
    }
    setSaving(true)
    try {
      const res = await axios.post(`${API_URL}/api/settings/email/verify`, {
        email: newEmail.trim().toLowerCase(), code: emailCode
      }, { headers: { Authorization: `Bearer ${token}` } })
      setCurrentEmail(res.data.email)
      setNewEmail('')
      setEmailCode('')
      setEmailStep('input')
      toast.success('Email updated! ✅')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid code')
    }
    setSaving(false)
  }

  // ── Password ──
  const savePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Fill in all password fields')
      return
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setSaving(true)
    try {
      await axios.post(`${API_URL}/api/settings/password`, {
        current_password: currentPassword, new_password: newPassword
      }, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Password updated! ✅')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password')
    }
    setSaving(false)
  }

  // ── Notifications ──
  const toggleNotifications = async () => {
    const newVal = !emailNotifications
    setEmailNotifications(newVal)
    try {
      await axios.post(`${API_URL}/api/settings/notifications`, { enabled: newVal }, { headers: { Authorization: `Bearer ${token}` } })
      toast.success(newVal ? 'Email notifications enabled' : 'Email notifications disabled')
    } catch {
      setEmailNotifications(!newVal)
      toast.error('Failed to update')
    }
  }

  // ── Delete account ──
  const deleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Enter your password to confirm')
      return
    }
    setSaving(true)
    try {
      await axios.delete(`${API_URL}/api/settings/delete-account`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { password: deletePassword }
      })
      toast.success('Account deleted')
      localStorage.clear()
      navigate('/')
      window.location.reload()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete account')
    }
    setSaving(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#3b82f6', fontWeight: 700, fontSize: 16 }}>Loading settings...</p>
    </div>
  )

  const cardStyle = {
    background: '#0d1526', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14, padding: 20,
  }
  const labelStyle = { color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6, fontWeight: 600 }
  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#f1f5f9', fontSize: 14, padding: '10px 14px', borderRadius: 10, outline: 'none', boxSizing: 'border-box',
  }
  const btnStyle = (color, disabled) => ({
    background: disabled ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg, ${color}, ${color}cc)`,
    color: disabled ? '#64748b' : '#fff', fontWeight: 700, fontSize: 13,
    padding: '10px 22px', borderRadius: 10, border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1,
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff', fontFamily: 'Barlow, system-ui, sans-serif' }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #14b8a6, #f59e0b, #84cc16, #6366f1)' }} />

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 16px 80px' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>FIFA World Cup 2026</div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.02em', fontFamily: 'Bebas Neue, sans-serif' }}>
            Account Settings ⚙️
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Manage your profile, security, and preferences.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Username */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={cardStyle}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#93c5fd', margin: '0 0 4px' }}>👤 Username</h2>
            <p style={{ color: '#475569', fontSize: 12, margin: '0 0 14px' }}>Current: <span style={{ color: '#94a3b8', fontWeight: 600 }}>{username}</span></p>
            <label style={labelStyle}>New Username</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={newUsername} onChange={e => setNewUsername(e.target.value)} style={inputStyle} placeholder="Enter new username" />
              <button onClick={saveUsername} disabled={saving || newUsername === username} style={btnStyle('#3b82f6', saving || newUsername === username)}>Save</button>
            </div>
          </motion.div>

          {/* Email */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={cardStyle}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#93c5fd', margin: '0 0 4px' }}>📧 Email Address</h2>
            <p style={{ color: '#475569', fontSize: 12, margin: '0 0 14px' }}>Current: <span style={{ color: '#94a3b8', fontWeight: 600 }}>{currentEmail}</span></p>

            {emailStep === 'input' ? (
              <>
                <label style={labelStyle}>New Email</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} style={inputStyle} placeholder="new@email.com" />
                  <button onClick={requestEmailChange} disabled={saving} style={btnStyle('#3b82f6', saving)}>Send Code</button>
                </div>
              </>
            ) : (
              <>
                <p style={{ color: '#22c55e', fontSize: 12, margin: '0 0 10px' }}>Code sent to {newEmail} — check your inbox!</p>
                <label style={labelStyle}>Verification Code</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={emailCode} onChange={e => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))} style={{ ...inputStyle, letterSpacing: '0.3em', textAlign: 'center', fontWeight: 800 }} placeholder="000000" maxLength={6} />
                  <button onClick={verifyEmailChange} disabled={saving} style={btnStyle('#22c55e', saving)}>Confirm</button>
                </div>
                <button onClick={() => { setEmailStep('input'); setEmailCode('') }} style={{ background: 'none', border: 'none', color: '#475569', fontSize: 12, marginTop: 8, cursor: 'pointer', textDecoration: 'underline' }}>Cancel</button>
              </>
            )}
          </motion.div>

          {/* Password */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={cardStyle}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#93c5fd', margin: '0 0 4px' }}>🔒 Password</h2>
            <p style={{ color: '#475569', fontSize: 12, margin: '0 0 14px' }}>Update your password regularly to keep your account secure.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={labelStyle}>Current Password</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={inputStyle} placeholder="••••••••" />
              </div>
              <div>
                <label style={labelStyle}>New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle} placeholder="••••••••" />
              </div>
              <div>
                <label style={labelStyle}>Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} placeholder="••••••••" />
              </div>
              <button onClick={savePassword} disabled={saving} style={{ ...btnStyle('#3b82f6', saving), alignSelf: 'flex-start' }}>Update Password</button>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: '#93c5fd', margin: '0 0 4px' }}>🔔 Email Notifications</h2>
                <p style={{ color: '#475569', fontSize: 12, margin: 0 }}>Get match reminders and result updates via email.</p>
              </div>
              <button onClick={toggleNotifications}
                style={{
                  width: 48, height: 28, borderRadius: 100, border: 'none', cursor: 'pointer',
                  background: emailNotifications ? '#22c55e' : 'rgba(255,255,255,0.1)',
                  position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                }}>
                <span style={{
                  position: 'absolute', top: 3, left: emailNotifications ? 23 : 3,
                  width: 22, height: 22, borderRadius: '50%', background: '#fff',
                  transition: 'left 0.2s',
                }} />
              </button>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ ...cardStyle, border: '1px solid rgba(239,68,68,0.2)', borderTop: '3px solid #ef4444' }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#f87171', margin: '0 0 4px' }}>⚠️ Danger Zone</h2>
            <p style={{ color: '#475569', fontSize: 12, margin: '0 0 14px' }}>Permanently delete your account and all your predictions. This cannot be undone.</p>
            <button onClick={() => setShowDeleteModal(true)}
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontWeight: 700, fontSize: 13, padding: '10px 22px', borderRadius: 10, cursor: 'pointer' }}>
              Delete My Account
            </button>
          </motion.div>

        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ background: '#0d1526', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 }}>
            <h3 style={{ fontWeight: 800, fontSize: 18, color: '#f87171', margin: '0 0 8px' }}>Delete Account?</h3>
            <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 16px', lineHeight: 1.5 }}>
              This will permanently delete your account, predictions, and league memberships. This action <strong>cannot be undone</strong>.
            </p>
            <label style={labelStyle}>Enter your password to confirm</label>
            <input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} style={{ ...inputStyle, marginBottom: 16 }} placeholder="••••••••" />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowDeleteModal(false); setDeletePassword('') }}
                style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#64748b', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={deleteAccount} disabled={saving}
                style={{ flex: 2, padding: '12px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Settings