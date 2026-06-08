import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'

function Signup() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('signup') // 'signup' or 'verify'
  const [code, setCode] = useState('')
  const [pendingEmail, setPendingEmail] = useState('')
  const navigate = useNavigate()

  const handleSignup = async () => {
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match!')
      return
    }

    setLoading(true)

    try {
      await axios.post('http://127.0.0.1:5000/api/signup', {
        username,
        email,
        password
      })

      // Move to verification step
      setPendingEmail(email)
      setStep('verify')

    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    }

    setLoading(false)
  }

  const handleVerify = async () => {
    setError('')
    setLoading(true)

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/verify', {
        email: pendingEmail,
        code
      })

      // Log them in directly
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('username', response.data.username)
      localStorage.setItem('is_admin', response.data.is_admin)

      navigate('/')
      window.location.reload()

    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code, try again')
    }

    setLoading(false)
  }

  // ── VERIFICATION SCREEN ──
  if (step === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-800 p-10 rounded-2xl w-full max-w-md shadow-lg text-center"
        >
          <div className="text-5xl mb-4">📧</div>
          <h1 className="text-3xl font-extrabold text-green-400 mb-2">
            Check your email!
          </h1>
          <p className="text-gray-400 mb-2">
            We sent a 6-digit code to:
          </p>
          <p className="text-white font-bold mb-8">{pendingEmail}</p>

          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            className="w-full bg-gray-700 text-white text-center text-3xl font-extrabold tracking-widest px-4 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-6"
          />

          {error && (
            <p className="text-red-400 text-sm mb-4">{error}</p>
          )}

          <button
            onClick={handleVerify}
            disabled={loading || code.length !== 6}
            className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify & Enter ⚽'}
          </button>

          <p className="text-gray-500 text-xs mt-6">
            Didn't get it? Check your spam folder or{' '}
            <button
              onClick={() => setStep('signup')}
              className="text-green-400 hover:underline"
            >
              go back
            </button>
          </p>
        </motion.div>
      </div>
    )
  }

  // ── SIGNUP SCREEN ──
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-800 p-10 rounded-2xl w-full max-w-md shadow-lg"
      >
        <h1 className="text-3xl font-extrabold text-green-400 mb-2 text-center">
          Join WC2026 ⚽
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Create an account and start predicting
        </p>

        <div className="flex flex-col gap-5">
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. ibrahim_wc"
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm mb-1 block">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            onClick={handleSignup}
            disabled={loading}
            className="bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-lg transition mt-2 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </div>

        <p className="text-gray-400 text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-green-400 hover:underline font-medium">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Signup