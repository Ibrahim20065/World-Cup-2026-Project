import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import PlayerSearch from '../components/PlayerSearch'

// ============================================================
// FLAG MAP — country name to country code for flag images
// ============================================================
const FLAGS = {
  'Mexico': 'mx', 'South Korea': 'kr', 'South Africa': 'za', 'Czech Republic': 'cz',
  'Canada': 'ca', 'Switzerland': 'ch', 'Qatar': 'qa', 'Bosnia': 'ba',
  'Brazil': 'br', 'Scotland': 'gb-sct', 'Morocco': 'ma', 'Haiti': 'ht',
  'USA': 'us', 'Australia': 'au', 'Paraguay': 'py', 'Turkey': 'tr',
  'Germany': 'de', 'Ecuador': 'ec', 'Ivory Coast': 'ci', 'Curacao': 'cw',
  'Netherlands': 'nl', 'Japan': 'jp', 'Sweden': 'se', 'Tunisia': 'tn',
  'Belgium': 'be', 'New Zealand': 'nz', 'Egypt': 'eg', 'Iran': 'ir',
  'Spain': 'es', 'Uruguay': 'uy', 'Saudi Arabia': 'sa', 'Cape Verde': 'cv',
  'France': 'fr', 'Norway': 'no', 'Senegal': 'sn', 'Iraq': 'iq',
  'Argentina': 'ar', 'Austria': 'at', 'Jordan': 'jo', 'Algeria': 'dz',
  'Portugal': 'pt', 'Colombia': 'co', 'Uzbekistan': 'uz', 'DR Congo': 'cd',
  'England': 'gb-eng', 'Croatia': 'hr', 'Ghana': 'gh', 'Panama': 'pa',
}

// ============================================================
// POSITION BADGE COLORS
// ============================================================
const BADGE = ['bg-green-500 text-black', 'bg-blue-500 text-white', 'bg-yellow-500 text-black', 'bg-red-500 text-white']
const POSITION_LABEL = ['1st', '2nd', '3rd', '4th']

// ============================================================
// SORTABLE TEAM ITEM — each draggable team row
// ============================================================
function SortableTeam({ team, index }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: team })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  }

  const code = FLAGS[team] || 'un'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-3 bg-gray-700 hover:bg-gray-600 rounded-lg px-4 py-3 cursor-grab active:cursor-grabbing transition"
    >
      {/* Position badge */}
      <span className={`font-bold text-xs w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0 ${BADGE[index]}`}>
        {POSITION_LABEL[index]}
      </span>

      {/* Flag image from CDN */}
      <img
        src={`https://flagcdn.com/w40/${code}.png`}
        alt={team}
        className="w-8 h-5 object-cover rounded-sm"
        onError={(e) => { e.target.style.display = 'none' }}
      />

      {/* Team name */}
      <span className="flex-1 font-medium text-white">{team}</span>

      {/* Drag handle */}
      <span className="text-gray-500 text-lg select-none">⠿</span>
    </div>
  )
}

// ============================================================
// MAIN PREDICTIONS COMPONENT
// ============================================================
function Predictions() {
  const [groups, setGroups] = useState({})
  const [groupPredictions, setGroupPredictions] = useState({})
  const [goldenBall, setGoldenBall] = useState('')
  const [silverBall, setSilverBall] = useState('')
  const [bronzeBall, setBronzeBall] = useState('')
  const [goldenBoot, setGoldenBoot] = useState(['', '', ''])
  const [goldenGlove, setGoldenGlove] = useState(['', '', ''])
  const [u21Award, setU21Award] = useState(['', '', ''])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('groups')

  const token = localStorage.getItem('token')

  // Sensors for drag detection
  const sensors = useSensors(useSensor(PointerSensor))

  // Fetch groups on load
  useEffect(() => {
    axios.get('http://127.0.0.1:5000/api/groups').then(res => {
      setGroups(res.data)
      const initial = {}
      Object.keys(res.data).forEach(g => { initial[g] = [...res.data[g]] })
      setGroupPredictions(initial)
      setLoading(false)
    })
  }, [])

  // Handle drag end for a specific group
  const handleDragEnd = (groupName, event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const teams = groupPredictions[groupName]
    const oldIndex = teams.indexOf(active.id)
    const newIndex = teams.indexOf(over.id)
    setGroupPredictions(prev => ({
      ...prev,
      [groupName]: arrayMove(teams, oldIndex, newIndex)
    }))
  }

  // Save predictions
  const savePredictions = async () => {
    if (!token) { setMessage('Please login to save predictions!'); return }
    setSaving(true)
    try {
      await axios.post('http://127.0.0.1:5000/api/predictions', {
        group_predictions: groupPredictions,
        golden_ball: goldenBall,
        silver_ball: silverBall,
        bronze_ball: bronzeBall,
        golden_boot: goldenBoot,
        golden_glove: goldenGlove,
        u21_award: u21Award,
      }, { headers: { Authorization: `Bearer ${token}` } })
      setMessage('Predictions saved! ✅')
    } catch {
      setMessage('Error saving. Please try again.')
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-green-400 text-xl animate-pulse">Loading groups...</p>
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
        Your Predictions 🎯
      </motion.h1>
      <p className="text-gray-400 mb-8">
        Drag teams to set their finishing position in each group. Fill in award predictions below.
      </p>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        {['groups', 'awards'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-full font-bold capitalize transition ${
              activeTab === tab
                ? 'bg-green-500 text-black'
                : 'border border-green-500 text-green-400 hover:bg-green-500 hover:text-black'
            }`}
          >
            {tab === 'groups' ? '🗂 Group Stage' : '🏆 Awards'}
          </button>
        ))}
      </div>

      {/* GROUP STAGE */}
      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(groups).map(([groupName, teams]) => (
            <motion.div
              key={groupName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-2xl p-5 border border-gray-700"
            >
              <h2 className="text-green-400 font-extrabold text-lg mb-4">
                Group {groupName}
              </h2>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(groupName, e)}
              >
                <SortableContext
                  items={groupPredictions[groupName] || []}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-2">
                    {groupPredictions[groupName]?.map((team, index) => (
                      <SortableTeam key={team} team={team} index={index} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              <div className="flex justify-between mt-3 text-xs px-1">
                <span className="text-green-400">🟢 1st & 2nd advance</span>
                <span className="text-yellow-400">🟡 3rd maybe</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* AWARDS */}
      {activeTab === 'awards' && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

    {/* Ballon d'Or Awards */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
    >
      <h2 className="text-yellow-400 font-extrabold text-lg mb-4">⚽Best Players in the World Cup</h2>
      <div className="flex flex-col gap-4">
        {[
          { label: '🥇 Golden Ball (15pts)', value: goldenBall, setter: setGoldenBall, ring: 'focus-within:ring-yellow-400' },
          { label: '🥈 Silver Ball (10pts)', value: silverBall, setter: setSilverBall, ring: 'focus-within:ring-gray-400' },
          { label: '🥉 Bronze Ball (5pts)', value: bronzeBall, setter: setBronzeBall, ring: 'focus-within:ring-orange-400' },
        ].map(({ label, value, setter, ring }) => (
          <div key={label}>
            <label className="text-gray-300 text-sm mb-1 block">{label}</label>
            <PlayerSearch
              value={value}
              onChange={(val) => setter(val)}
              placeholder="Search player..."
              ringColor={ring}
            />
          </div>
        ))}
      </div>
    </motion.div>

    {/* Golden Boot */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
    >
      <h2 className="text-orange-400 font-extrabold text-lg mb-1">👟 Golden Boot</h2>
      <p className="text-gray-500 text-xs mb-4">1st: 12pts · 2nd: 8pts · 3rd: 4pts</p>
      <div className="flex flex-col gap-4">
        {['1st Choice', '2nd Choice', '3rd Choice'].map((label, i) => (
          <div key={label}>
            <label className="text-gray-300 text-sm mb-1 block">{label}</label>
            <PlayerSearch
              value={goldenBoot[i]}
              onChange={(val) => {
                const updated = [...goldenBoot]
                updated[i] = val
                setGoldenBoot(updated)
              }}
              placeholder="Search player..."
              ringColor="focus-within:ring-orange-400"
            />
          </div>
        ))}
      </div>
    </motion.div>

    {/* Golden Glove */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
    >
      <h2 className="text-blue-400 font-extrabold text-lg mb-1">🧤 Golden Glove</h2>
      <p className="text-gray-500 text-xs mb-4">1st: 12pts · 2nd: 8pts · 3rd: 4pts</p>
      <div className="flex flex-col gap-4">
        {['1st Choice', '2nd Choice', '3rd Choice'].map((label, i) => (
          <div key={label}>
            <label className="text-gray-300 text-sm mb-1 block">{label}</label>
            <PlayerSearch
              value={goldenGlove[i]}
              onChange={(val) => {
                const updated = [...goldenGlove]
                updated[i] = val
                setGoldenGlove(updated)
              }}
              placeholder="Search player..."
              ringColor="focus-within:ring-blue-400"
            />
          </div>
        ))}
      </div>
    </motion.div>

    {/* U21 Award */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
    >
      <h2 className="text-purple-400 font-extrabold text-lg mb-1">🌟 Best U21 Player</h2>
      <p className="text-gray-500 text-xs mb-4">1st: 12pts · 2nd: 8pts · 3rd: 4pts</p>
      <div className="flex flex-col gap-4">
        {['1st Choice', '2nd Choice', '3rd Choice'].map((label, i) => (
          <div key={label}>
            <label className="text-gray-300 text-sm mb-1 block">{label}</label>
            <PlayerSearch
              value={u21Award[i]}
              onChange={(val) => {
                const updated = [...u21Award]
                updated[i] = val
                setU21Award(updated)
              }}
              placeholder="Search player..."
              ringColor="focus-within:ring-purple-400"
            />
          </div>
        ))}
      </div>
    </motion.div>

  </div>
)}

      {/* Save Button */}
      <div className="mt-10 flex flex-col items-center gap-3">
        {message && (
          <p className={`text-sm font-medium ${message.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}
        <button
          onClick={savePredictions}
          disabled={saving}
          className="bg-green-500 hover:bg-green-400 text-black font-extrabold px-12 py-4 rounded-full text-lg transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Predictions 🎯'}
        </button>
      </div>

    </div>
  )
}

export default Predictions