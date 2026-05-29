import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function Signup() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const handleSignup = (e) => {
    e.preventDefault()
    if (password !== confirm) {
      alert('Passwords do not match!')
      return
    }
    console.log('Signing up:', username, email, password)
    // We'll connect this to Flask backend later
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-800 p-10 rounded-2xl w-full max-w-md shadow-lg"
      >
        {/* Title */}
        <h1 className="text-3xl font-extrabold text-green-400 mb-2 text-center">
          Join WC2026 ⚽
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Create an account and start predicting
        </p>

        {/* Form */}
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

          <button
            onClick={handleSignup}
            className="bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-lg transition mt-2"
          >
            Create Account
          </button>
        </div>

        {/* Login link */}
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