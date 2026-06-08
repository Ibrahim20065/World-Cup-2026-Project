import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useAuth } from '../assets/AuthContext'
import toast from 'react-hot-toast'

function Signup() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('signup')
  const [code, setCode] = useState('')
  const [pendingEmail, setPendingEmail] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSignup = async () => {
    setError('')
    if (password !== confirm) { setError('Passwords do not match!'); return }
    setLoading(true)
    try {
      await axios.post('http://192.168.100.3:5000/api/signup', { username, email, password })
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
      const response = await axios.post('http://192.168.100.3:5000/api/verify', {
        email: pendingEmail,
        code
      })
      login(response.data)
      toast.success('Welcome to WC2026! ⚽')
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid code, try again'
      setError(msg)
      toast.error(msg)
    }
    setLoading(false)
  }

  // ── VERIFICATION SCREEN ──
  if (step === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-800 p-6 sm:p-10 rounded-2xl w-full max-w-md shadow-lg text-center"
        >
          <div className="text-5xl mb-4">📧</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-green-400 mb-2">
            Check your email!
          </h1>
          <p className="text-gray-400 mb-2 text-sm sm:text-base">
            We sent a 6-digit code to:
          </p>
          <p className="text-white font-bold mb-6 text-sm break-all">{pendingEmail}</p>

          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            className="w-full bg-gray-700 text-white text-center text-3xl font-extrabold tracking-widest px-4 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-6"
          />

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <button
            onClick={handleVerify}
            disabled={loading || code.length !== 6}
            className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify & Enter ⚽'}
          </button>

          <p className="text-gray-500 text-xs mt-6">
            Didn't get it? Check your spam folder or{' '}
            <button onClick={() => setStep('signup')} className="text-green-400 hover:underline">
              go back
            </button>
          </p>
        </motion.div>
      </div>
    )
  }

  // ── SIGNUP SCREEN ──
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-800 p-6 sm:p-10 rounded-2xl w-full max-w-md shadow-lg"
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold text-green-400 mb-2 text-center">
          Join WC2026 ⚽
        </h1>
        <p className="text-gray-400 text-center mb-6 sm:mb-8 text-sm sm:text-base">
          Create an account and start predicting
        </p>

        <div className="flex flex-col gap-4 sm:gap-5">
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

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            onClick={handleSignup}
            disabled={loading}
            className="bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-lg transition mt-1 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </div>

        <p className="text-gray-400 text-center mt-6 text-sm">
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