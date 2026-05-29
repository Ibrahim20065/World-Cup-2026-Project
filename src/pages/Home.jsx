import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center px-4 py-24">
        
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl font-extrabold text-green-400 mb-4"
        >
          World Cup 2026 🏆
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-gray-400 text-xl mb-10 max-w-xl"
        >
          Predict the champions. Track the scores. Compete with the world.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex gap-4"
        >
          <Link
            to="/signup"
            className="bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-3 rounded-full transition"
          >
            Get Started
          </Link>
          <Link
            to="/predictions"
            className="border border-green-500 hover:bg-green-500 hover:text-black text-green-400 font-bold px-8 py-3 rounded-full transition"
          >
            Make Predictions
          </Link>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-12 pb-20">
        {[
          { icon: '🎯', title: 'Predict', desc: 'Pick your winners from group stage all the way to the final' },
          { icon: '⚡', title: 'Live Scores', desc: 'Follow every match in real time with live updates' },
          { icon: '🏅', title: 'Leaderboard', desc: 'Compete with friends and climb the global rankings' },
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + i * 0.2 }}
            className="bg-gray-800 rounded-2xl p-8 text-center hover:border hover:border-green-500 transition"
          >
            <div className="text-5xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-bold text-green-400 mb-2">{feature.title}</h3>
            <p className="text-gray-400">{feature.desc}</p>
          </motion.div>
        ))}
      </div>

    </div>
  )
}

export default Home