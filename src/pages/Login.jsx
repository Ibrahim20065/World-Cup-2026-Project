import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    console.log('Logging in with:', email, password)
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
          Welcome Back ⚽
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Log in and witness World Cup glory!
        </p>

        {/* Form */}
        <div className="flex flex-col gap-5">
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

          <button
            onClick={handleLogin}
            className="bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-lg transition mt-2"
          >
            Login
          </button>
        </div>

        {/* Sign up link */}
        <p className="text-gray-400 text-center mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-green-400 hover:underline font-medium">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Login