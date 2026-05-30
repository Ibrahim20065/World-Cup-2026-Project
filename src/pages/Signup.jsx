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
  const navigate = useNavigate()

  const handleSignup = async () => {
    setError('')

    // Check passwords match before sending to backend
    if (password !== confirm) {
      setError('Passwords do not match!')
      return
    }

    setLoading(true)

    try {
      // Send signup data to Flask backend
      await axios.post('http://127.0.0.1:5000/api/signup', {
        username,
        email,
        password
      })

      // Redirect to login page after successful signup
      navigate('/login')

    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    }

    setLoading(false)
  }

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

          {/* Show error message if signup fails */}
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