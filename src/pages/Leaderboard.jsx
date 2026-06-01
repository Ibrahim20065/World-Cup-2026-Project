import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

// ============================================================
// RANK MEDAL — top 3 get special medals
// ============================================================
function RankBadge({ rank }) {
  if (rank === 1) return <span className="text-2xl">🥇</span>
  if (rank === 2) return <span className="text-2xl">🥈</span>
  if (rank === 3) return <span className="text-2xl">🥉</span>
  return (
    <span className="text-gray-400 font-bold w-8 text-center">
      #{rank}
    </span>
  )
}

// ============================================================
// LEADERBOARD PAGE
// ============================================================
function Leaderboard() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const currentUser = localStorage.getItem('username')

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/api/leaderboard')
      .then(res => {
        setPlayers(res.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Find current user's rank
  const myRank = players.find(p => p.username === currentUser)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-green-400 text-xl animate-pulse">Loading leaderboard...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-extrabold text-green-400 mb-2"
      >
        Leaderboard 🏅
      </motion.h1>
      <p className="text-gray-400 mb-8">
        Rankings update automatically as World Cup predictions come true.
      </p>

      {/* My Rank Card */}
      {myRank && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 border border-green-500 rounded-2xl p-5 mb-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <RankBadge rank={myRank.rank} />
            <div>
              <p className="text-green-400 font-bold text-lg">{myRank.username}</p>
              <p className="text-gray-400 text-sm">Your current rank</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold text-white">{myRank.points}</p>
            <p className="text-gray-400 text-sm">points</p>
          </div>
        </motion.div>
      )}

      {/* Top 3 Podium */}
      {players.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-10">
          {/* 2nd Place */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center bg-gray-800 rounded-2xl p-5 w-32 border border-gray-600"
            style={{ height: '160px', justifyContent: 'flex-end' }}
          >
            <span className="text-3xl mb-2">🥈</span>
            <p className="text-white font-bold text-sm text-center truncate w-full text-center">
              {players[1]?.username}
            </p>
            <p className="text-gray-400 text-xs">{players[1]?.points} pts</p>
          </motion.div>

          {/* 1st Place */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center bg-gray-800 rounded-2xl p-5 w-36 border border-yellow-500"
            style={{ height: '200px', justifyContent: 'flex-end' }}
          >
            <span className="text-4xl mb-2">🥇</span>
            <p className="text-yellow-400 font-extrabold text-sm text-center truncate w-full text-center">
              {players[0]?.username}
            </p>
            <p className="text-gray-400 text-xs">{players[0]?.points} pts</p>
          </motion.div>

          {/* 3rd Place */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center bg-gray-800 rounded-2xl p-5 w-32 border border-gray-600"
            style={{ height: '130px', justifyContent: 'flex-end' }}
          >
            <span className="text-3xl mb-2">🥉</span>
            <p className="text-white font-bold text-sm text-center truncate w-full text-center">
              {players[2]?.username}
            </p>
            <p className="text-gray-400 text-xs">{players[2]?.points} pts</p>
          </motion.div>
        </div>
      )}

      {/* Full Rankings Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden"
      >
        {/* Table Header */}
        <div className="grid grid-cols-12 px-6 py-3 border-b border-gray-700 text-gray-400 text-xs uppercase tracking-wider">
          <span className="col-span-1">Rank</span>
          <span className="col-span-7">Player</span>
          <span className="col-span-4 text-right">Points</span>
        </div>

        {/* Table Rows */}
        {players.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No players yet 👀</p>
            <p className="text-gray-600 text-sm mt-2">
              Be the first to sign up and make predictions!
            </p>
          </div>
        ) : (
          players.map((player, index) => (
            <motion.div
              key={player.username}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`grid grid-cols-12 px-6 py-4 border-b border-gray-700 last:border-0 items-center transition ${
                player.username === currentUser
                  ? 'bg-green-500 bg-opacity-10 border-l-4 border-l-green-500'
                  : 'hover:bg-gray-700'
              }`}
            >
              {/* Rank */}
              <div className="col-span-1 flex items-center">
                <RankBadge rank={player.rank} />
              </div>

              {/* Username */}
              <div className="col-span-7 flex items-center gap-3">
                {/* Avatar circle */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                  player.rank === 1 ? 'bg-yellow-500 text-black' :
                  player.rank === 2 ? 'bg-gray-400 text-black' :
                  player.rank === 3 ? 'bg-orange-500 text-white' :
                  'bg-gray-700 text-white'
                }`}>
                  {player.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className={`font-bold ${
                    player.username === currentUser ? 'text-green-400' : 'text-white'
                  }`}>
                    {player.username}
                    {player.username === currentUser && (
                      <span className="text-green-500 text-xs ml-2">(You)</span>
                    )}
                    {player.is_admin && (
                      <span className="text-yellow-400 text-xs ml-2">⭐ Admin</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Points */}
              <div className="col-span-4 text-right">
                <span className={`font-extrabold text-lg ${
                  player.rank === 1 ? 'text-yellow-400' :
                  player.rank === 2 ? 'text-gray-300' :
                  player.rank === 3 ? 'text-orange-400' :
                  'text-white'
                }`}>
                  {player.points}
                </span>
                <span className="text-gray-500 text-xs ml-1">pts</span>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Info note */}
      <p className="text-gray-600 text-xs text-center mt-6">
        Points are awarded automatically when predictions match real results ⚡
      </p>
    </div>
  )
}

export default Leaderboard