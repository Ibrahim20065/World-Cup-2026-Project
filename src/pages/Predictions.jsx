import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import PlayerSearch from '../components/PlayerSearch'
import PLAYERS from '../players'
import toast from 'react-hot-toast'

// ============================================================
// FLAG MAP
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

const BADGE = ['bg-green-500 text-black', 'bg-blue-500 text-white', 'bg-yellow-500 text-black', 'bg-red-500 text-white']
const POSITION_LABEL = ['1st', '2nd', '3rd', '4th']


// ============================================================
// U21 ELIGIBLE PLAYERS — born on or after January 1, 2005
// Official FIFA cutoff for Best Young Player Award
// ============================================================
const U21_NAMES = new Set([
  // Spain
  'Lamine Yamal', 'Pau Cubarsi', 'Marc Pubill', 'Victor Munoz',
  // France
  'Warren Zaire-Emery', 'Desire Doue',
  // England
  'Kobbie Mainoo', "Nico O'Reilly",
  // Germany
  'Lennart Karl',
  // Turkey
  'Arda Guler', 'Kenan Yildiz', 'Can Uzun',
  // Brazil
  'Endrick', 'Rayan',
  // Argentina
  'Nico Paz',
  // Croatia
  'Luka Vuskovic',
  // Ecuador
  'Kendry Paez',
  // Netherlands
  'Jorrel Hato',
  // Sweden
  'Lucas Bergvall', 'Taha Ali',
  // Australia
  'Nestory Irankunda',
  // Morocco
  'Ayoub Bouaddi',
  // Mexico
  'Gilberto Mora', 'Mateo Chavez',
  // Belgium
  'Mike Penders', 'Nathan Ngoy',
  // Ivory Coast
  'Yan Diomande', 'Oumar Diakite',
  // Norway
  'Antonio Nusa',
  // Senegal
  'Ibrahim Mbaye',
  // Czech Republic
  'Lukas Hornicek', 'Stepan Chaloupek',
  // Scotland
  'Findlay Curtis', 'Tyler Fletcher', 'Ben Gannon-Doak',
  // South Africa
  'Khulumani Ndamane', 'Kamogelo Sebelebele',
  // Algeria
  'Ibrahim Maza',
  // Uzbekistan
  'Abbosbek Fayzullaev',
  //Egypt
  'Hamza Abdel Karim',
])

// Filter players.js to only U21 eligible
const U21_PLAYERS = PLAYERS.filter(p => U21_NAMES.has(p.name))

// ============================================================
// SORTABLE TEAM
// ============================================================
function SortableTeam({ team, index }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: team })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 50 : 'auto' }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className="flex items-center gap-3 bg-gray-700 hover:bg-gray-600 rounded-lg px-4 py-3 cursor-grab active:cursor-grabbing transition">
      <span className={`font-bold text-xs w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0 ${BADGE[index]}`}>
        {POSITION_LABEL[index]}
      </span>
      <img src={`https://flagcdn.com/w40/${FLAGS[team] || 'un'}.png`} alt={team}
        className="w-8 h-5 object-cover rounded-sm" onError={(e) => { e.target.style.display = 'none' }} />
      <span className="flex-1 font-medium text-white">{team}</span>
      <span className="text-gray-500 text-lg select-none">⠿</span>
    </div>
  )
}
// ============================================================
// AUTO-ASSIGN 3RD PLACE TEAMS TO R32 SLOTS
// Uses bipartite matching — each team goes to exactly one slot
// based on their group's eligibility
// ============================================================
function autoAssign3rdPlace(thirdPlaceAdvancing, groupPredictions) {
  // Map each selected team to their group
  const teamToGroup = {}
  Object.keys(groupPredictions).forEach(g => {
    const thirdTeam = groupPredictions[g]?.[2]
    if (thirdTeam && thirdPlaceAdvancing.includes(thirdTeam)) {
      teamToGroup[thirdTeam] = g
    }
  })

  const slots = [
    { slot: 't74', eligible: ['A','B','C','D','F'], winnerGroup: 'E' },
    { slot: 't77', eligible: ['C','D','F','G','H'], winnerGroup: 'I' },
    { slot: 't79', eligible: ['C','E','F','H','I'], winnerGroup: 'A' },
    { slot: 't80', eligible: ['E','H','I','J','K'], winnerGroup: 'L' },
    { slot: 't81', eligible: ['B','E','F','I','J'], winnerGroup: 'D' },
    { slot: 't82', eligible: ['A','E','H','I','J'], winnerGroup: 'G' },
    { slot: 't85', eligible: ['E','F','G','I','J'], winnerGroup: 'B' },
    { slot: 't87', eligible: ['D','E','I','J','L'], winnerGroup: 'K' },
  ]

  // Can this team go in this slot?
  const isEligible = (team, slot) =>
    slot.eligible.includes(teamToGroup[team]) &&
    teamToGroup[team] !== slot.winnerGroup

  // Bipartite matching using augmenting paths (Kuhn's algorithm)
  const teamMatch = {}  // team -> slotId it's matched to

  const findSlotById = (id) => slots.find(s => s.slot === id)

  function augment(slot, visited) {
    for (const team of thirdPlaceAdvancing) {
      if (visited.has(team)) continue
      if (!isEligible(team, slot)) continue
      visited.add(team)
      const currentSlotId = teamMatch[team]
      // Either team is free, OR the slot it's in can find another team
      if (!currentSlotId || augment(findSlotById(currentSlotId), visited)) {
        teamMatch[team] = slot.slot
        return true
      }
    }
    return false
  }

  // Try to match every slot
  for (const slot of slots) {
    augment(slot, new Set())
  }

  // Build slot -> team mapping
  const assigned = {}
  Object.keys(teamMatch).forEach(team => {
    assigned[teamMatch[team]] = team
  })

  return assigned
}
// ============================================================
// OFFICIAL FIFA R32 MATCHUPS — correct structure
// For 3rd place slots, user assigns manually via dropdown
// ============================================================
function getR32Matches(gp, thirdPlaceAdvancing) {
  const w = g => gp[g]?.[0] || '?'
  const r = g => gp[g]?.[1] || '?'

  // Auto-assign 3rd place teams to slots
  const assignments = thirdPlaceAdvancing.length === 8
    ? autoAssign3rdPlace(thirdPlaceAdvancing, gp)
    : {}

  const t = slot => assignments[slot] || '?'

  return [
    { id: 'r32_73', match: 73, team1: r('A'), team2: r('B'),    is3rd: false },
    { id: 'r32_74', match: 74, team1: w('E'), team2: t('t74'),  is3rd: true  },
    { id: 'r32_75', match: 75, team1: w('F'), team2: r('C'),    is3rd: false },
    { id: 'r32_76', match: 76, team1: w('C'), team2: r('F'),    is3rd: false },
    { id: 'r32_77', match: 77, team1: w('I'), team2: t('t77'),  is3rd: true  },
    { id: 'r32_78', match: 78, team1: r('E'), team2: r('I'),    is3rd: false },
    { id: 'r32_79', match: 79, team1: w('A'), team2: t('t79'),  is3rd: true  },
    { id: 'r32_80', match: 80, team1: w('L'), team2: t('t80'),  is3rd: true  },
    { id: 'r32_81', match: 81, team1: w('D'), team2: t('t81'),  is3rd: true  },
    { id: 'r32_82', match: 82, team1: w('G'), team2: t('t82'),  is3rd: true  },
    { id: 'r32_83', match: 83, team1: r('K'), team2: r('L'),    is3rd: false },
    { id: 'r32_84', match: 84, team1: w('H'), team2: r('J'),    is3rd: false },
    { id: 'r32_85', match: 85, team1: w('B'), team2: t('t85'),  is3rd: true  },
    { id: 'r32_86', match: 86, team1: w('J'), team2: r('H'),    is3rd: false },
    { id: 'r32_87', match: 87, team1: w('K'), team2: t('t87'),  is3rd: true  },
    { id: 'r32_88', match: 88, team1: r('D'), team2: r('G'),    is3rd: false },
  ].sort((a, b) => a.match - b.match)
}

// ============================================================
// R16 — winners of consecutive R32 matches face each other
// ============================================================
function getR16Matches(r32Preds) {
  const w = id => r32Preds[id] || '?'
  return [
    { id: 'r16_1', match: 'R16-1', team1: w('r32_73'), team2: w('r32_74'), is3rd: false },
    { id: 'r16_2', match: 'R16-2', team1: w('r32_75'), team2: w('r32_76'), is3rd: false },
    { id: 'r16_3', match: 'R16-3', team1: w('r32_77'), team2: w('r32_78'), is3rd: false },
    { id: 'r16_4', match: 'R16-4', team1: w('r32_79'), team2: w('r32_80'), is3rd: false },
    { id: 'r16_5', match: 'R16-5', team1: w('r32_81'), team2: w('r32_82'), is3rd: false },
    { id: 'r16_6', match: 'R16-6', team1: w('r32_83'), team2: w('r32_84'), is3rd: false },
    { id: 'r16_7', match: 'R16-7', team1: w('r32_85'), team2: w('r32_86'), is3rd: false },
    { id: 'r16_8', match: 'R16-8', team1: w('r32_87'), team2: w('r32_88'), is3rd: false },
  ]
}

function getQFMatches(r16Preds) {
  const w = id => r16Preds[id] || '?'
  return [
    { id: 'qf_1', match: 'QF-1', team1: w('r16_1'), team2: w('r16_2'), is3rd: false },
    { id: 'qf_2', match: 'QF-2', team1: w('r16_3'), team2: w('r16_4'), is3rd: false },
    { id: 'qf_3', match: 'QF-3', team1: w('r16_5'), team2: w('r16_6'), is3rd: false },
    { id: 'qf_4', match: 'QF-4', team1: w('r16_7'), team2: w('r16_8'), is3rd: false },
  ]
}

function getSFMatches(qfPreds) {
  const w = id => qfPreds[id] || '?'
  return [
    { id: 'sf_1', match: 'SF-1', team1: w('qf_1'), team2: w('qf_2'), is3rd: false },
    { id: 'sf_2', match: 'SF-2', team1: w('qf_3'), team2: w('qf_4'), is3rd: false },
  ]
}

function getFinalTeams(sfPreds) {
  return ['sf_1', 'sf_2'].map(id => sfPreds[id]).filter(Boolean)
}

// ============================================================
// BRACKET MATCH — compact match box for the bracket view
// ============================================================
function TeamRow({ team, prediction, matchId, onPick }) {
  return (
    <button
      onClick={() => team !== '?' && onPick(matchId, team)}
      disabled={team === '?'}
      className={`w-full flex items-center gap-2 px-3 py-2 transition ${
        prediction === team
          ? 'bg-green-500 bg-opacity-20 border-l-4 border-green-500'
          : 'hover:bg-gray-700 border-l-4 border-transparent'
      } disabled:opacity-40`}
    >
      {team !== '?' ? (
        <img src={`https://flagcdn.com/w40/${FLAGS[team] || 'un'}.png`} alt={team}
          className="w-6 h-4 object-cover rounded-sm flex-shrink-0"
          onError={(e) => { e.target.style.display = 'none' }} />
      ) : (
        <span className="w-6 h-4 flex items-center justify-center text-gray-600 text-xs">·</span>
      )}
      <span className={`text-xs font-bold truncate flex-1 text-left ${
        team === '?' ? 'text-gray-600 italic' : prediction === team ? 'text-green-400' : 'text-white'
      }`}>
        {team === '?' ? 'TBD' : team}
      </span>
      {prediction === team && team !== '?' && <span className="text-green-400 text-xs">✓</span>}
    </button>
  )
}

function BracketMatch({ match, prediction, onPick }) {
  const team1 = match.team1 || '?'
  const team2 = match.team2 || '?'

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden w-36 sm:w-44 flex-shrink-0">
      <div className="text-gray-600 text-[10px] text-center py-1 bg-gray-900 font-bold">
        {typeof match.match === 'number' ? `Match ${match.match}` : match.match}
      </div>
      <TeamRow team={team1} prediction={prediction} matchId={match.id} onPick={onPick} />
      <div className="h-px bg-gray-700"></div>
      <TeamRow team={team2} prediction={prediction} matchId={match.id} onPick={onPick} />
    </div>
  )
}

// ============================================================
// BRACKET COLUMN — one round of the bracket
// ============================================================
function BracketColumn({ title, matches, predictions, onPick }) {
  return (
    <div className="flex flex-col flex-shrink-0">
      <h4 className="text-green-400 font-bold text-xs uppercase tracking-wider mb-3 text-center">
        {title}
      </h4>
      <div className="flex flex-col justify-around gap-3 flex-1">
        {matches.map(match => (
          <BracketMatch key={match.id} match={match} prediction={predictions[match.id]} onPick={onPick} />
        ))}
      </div>
    </div>
  )
}
// ============================================================
// MAIN PREDICTIONS COMPONENT
// ============================================================
function Predictions() {
  const [groups, setGroups] = useState({})
  const [groupPredictions, setGroupPredictions] = useState({})
  const [thirdPlaceAdvancing, setThirdPlaceAdvancing] = useState([])
  const [knockoutPredictions, setKnockoutPredictions] = useState({
    r32: {}, r16: {}, quarter: {}, semi: {}, third_place: '', final: ''
  })
  const [goldenBall, setGoldenBall] = useState('')
  const [silverBall, setSilverBall] = useState('')
  const [bronzeBall, setBronzeBall] = useState('')
  const [goldenBoot, setGoldenBoot] = useState(['', '', ''])
  const [goldenGlove, setGoldenGlove] = useState(['', '', ''])
  const [u21Award, setU21Award] = useState(['', '', ''])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('groups')
  const [locked, setLocked] = useState(false)
  const [awardsLocked, setAwardsLocked] = useState(false)

  const token = localStorage.getItem('token')
  const sensors = useSensors(useSensor(PointerSensor))

useEffect(() => {
    axios.get('http://192.168.100.3:5000/api/groups').then(res => {
      setGroups(res.data)
      const initial = {}
      Object.keys(res.data).forEach(g => { initial[g] = [...res.data[g]] })
      setGroupPredictions(initial)
      setLoading(false)
      const LOCK_TIME = new Date('2026-06-11T19:00:00Z')
      if (new Date() >= LOCK_TIME){
        setLocked(true)
        setAwardsLocked(true)
      }

      // Load saved predictions if user is logged in
      const token = localStorage.getItem('token')
      if (token) {
        axios.get('http://192.168.100.3:5000/api/predictions', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(saved => {
          if (saved.data.saved) {
            // Restore all saved predictions
            if (Object.keys(saved.data.group_predictions).length > 0) {
              setGroupPredictions(saved.data.group_predictions)
            }
            if (saved.data.third_place_advancing.length > 0) {
              setThirdPlaceAdvancing(saved.data.third_place_advancing)
            }
            if (Object.keys(saved.data.knockout_predictions).length > 0) {
              setKnockoutPredictions(saved.data.knockout_predictions)
            }
            if (saved.data.golden_ball) setGoldenBall(saved.data.golden_ball)
            if (saved.data.silver_ball) setSilverBall(saved.data.silver_ball)
            if (saved.data.bronze_ball) setBronzeBall(saved.data.bronze_ball)
            if (saved.data.golden_boot?.length) setGoldenBoot(saved.data.golden_boot)
            if (saved.data.golden_glove?.length) setGoldenGlove(saved.data.golden_glove)
            if (saved.data.u21_award?.length) setU21Award(saved.data.u21_award)

            // Lock predictions — user already submitted
            setLocked(true)

            if (saved.data.golden_ball || saved.data.golden_boot?.some(v => v)) {
              setAwardsLocked(true)
            }
          }
        }).catch(() => {})
      }
    })
  }, [])

  const handleDragEnd = (groupName, event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const teams = groupPredictions[groupName]
    const oldIndex = teams.indexOf(active.id)
    const newIndex = teams.indexOf(over.id)
    setGroupPredictions(prev => ({ ...prev, [groupName]: arrayMove(teams, oldIndex, newIndex) }))
  }
// Save progress without locking
  const saveProgress = async () => {
    if (!token) { toast.error('Please login to save!'); return }
    if (locked) { toast.error('Predictions are locked!'); return }
    setSaving(true)
    try {
      await axios.post('http://192.168.100.3:5000/api/predictions', {
        group_predictions: groupPredictions,
        third_place_advancing: thirdPlaceAdvancing,
        knockout_predictions: knockoutPredictions,
        golden_ball: goldenBall,
        silver_ball: silverBall,
        bronze_ball: bronzeBall,
        golden_boot: goldenBoot,
        golden_glove: goldenGlove,
        u21_award: u21Award,
      }, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Progress saved! ✅')
    } catch {
      toast.error('Error saving. Please try again.')
    }
    setSaving(false)
  }

const savePredictions = async () => {
    if (!token) { toast.error('Please login to save predictions!'); return }
    if (locked) { toast.success('Predictions are locked! You already submitted.'); return }
    
    const hasKnockout = Object.keys(knockoutPredictions.r32).length > 0
    const hasGroups = Object.values(groupPredictions).some((teams, i) => {
      const original = Object.values(groups)[i]
      return original && JSON.stringify(teams) !== JSON.stringify(original)
    })

    if (!hasKnockout && !hasGroups) {
      toast.error('⚠️ Nothing to save! Fill in your predictions first.')
      return
    }
    
    
    setSaving(true)
    try {
      await axios.post('http://192.168.100.3:5000/api/predictions', {
        group_predictions: groupPredictions,
        third_place_advancing: thirdPlaceAdvancing,
        knockout_predictions: knockoutPredictions,
        golden_ball: goldenBall,
        silver_ball: silverBall,
        bronze_ball: bronzeBall,
        golden_boot: goldenBoot,
        golden_glove: goldenGlove,
        u21_award: u21Award,
      }, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Predictions saved and locked! ✅🔒')
      setLocked(true)

      if (goldenBall || goldenBoot.some(v => v)) {
        setAwardsLocked(true)
      }
    } catch {
      toast.error('Error saving. Please try again.')
    }
    setSaving(false)
  }

  // Save and lock awards independently
  const saveAwards = async () => {
    if (!token) { toast.error('Please login to save!'); return }
    if (awardsLocked) { toast.error('Award predictions are locked!'); return }

    const hasAwards = goldenBall || silverBall || bronzeBall ||
      goldenBoot.some(v => v) || goldenGlove.some(v => v) || u21Award.some(v => v)

    if (!hasAwards) {
      toast.error('⚠️ Nothing to save! Pick your award predictions first.')
      return
    }

    setSaving(true)
    try {
      await axios.post('http://192.168.100.3:5000/api/predictions', {
        group_predictions: groupPredictions,
        third_place_advancing: thirdPlaceAdvancing,
        knockout_predictions: knockoutPredictions,
        golden_ball: goldenBall,
        silver_ball: silverBall,
        bronze_ball: bronzeBall,
        golden_boot: goldenBoot,
        golden_glove: goldenGlove,
        u21_award: u21Award,
      }, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Award predictions saved and locked! ✅🔒')
      setAwardsLocked(true)
    } catch {
      toast.error('Error saving. Please try again.')
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-green-400 text-xl animate-pulse">Loading groups...</p>
    </div>
  )

  const r32Matches = getR32Matches(groupPredictions, thirdPlaceAdvancing)
  const r16Matches = getR16Matches(knockoutPredictions.r32)
  const qfMatches = getQFMatches(knockoutPredictions.r16)
  const sfMatches = getSFMatches(knockoutPredictions.quarter)
  const finalTeams = getFinalTeams(knockoutPredictions.semi)

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 sm:px-6 py-8">

      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="text-3xl sm:text-4xl font-extrabold text-green-400 mb-2">
        Your Predictions 🎯
      </motion.h1>
      <p className="text-gray-400 mb-8">Drag teams to set their group finishing position, then fill in the bracket.</p>

      {locked && (
        <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500 rounded-2xl p-4 mb-8 flex items-center gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <p className="text-yellow-400 font-bold">Predictions Locked</p>
            <p className="text-gray-400 text-sm">
              {new Date() >= new Date('2026-06-11T19:00:00Z')
              ? 'The World Cup has started! Predictions are now locked for everyone. See you at the Second Chance 😉' : "You've already submitted your predictions. They cannot be changed. See you at the Second Chance 😉" }</p> 
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {[
          { id: 'groups',   label: '🗂 Group Stage' },
          { id: 'third',    label: '🥉 3rd Place' },
          { id: 'knockout', label: '🏆 Knockout Stage' },
          { id: 'awards',   label: '🎖 Awards' },
          { id: 'second',   label: '🔄 Second Chance' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
  className={`px-4 sm:px-6 py-2 rounded-full font-bold transition relative flex-shrink-0 text-sm sm:text-base ${
              activeTab === tab.id
                ? 'bg-green-500 text-black'
                : 'border border-green-500 text-green-400 hover:bg-green-500 hover:text-black'
            }`}>
            {tab.label}
            {tab.id === 'second' && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                SOON
              </span>
            )}
          </button>
        ))}
      </div>

      {/* GROUP STAGE */}
      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(groups).map(([groupName]) => (
            <motion.div key={groupName} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <h2 className="text-green-400 font-extrabold text-lg mb-4">Group {groupName}</h2>
              <DndContext sensors={sensors} collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(groupName, e)}>
                <SortableContext items={groupPredictions[groupName] || []} strategy={verticalListSortingStrategy}>
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

          {! locked && (
            <div className="col-span-full flex justify-center mt-6">
              <button onClick={saveProgress} disabled={saving}
              className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-3 rounded-full transition disabled:opacity-50 ">
                {saving ? 'Saving...' : '💾 Save Group Stage Predictions'}
              </button>
            </div>
          )
          }
        </div>
      )}

      {/* 3RD PLACE */}
      {activeTab === 'third' && (
        <div>
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-6">
            <h2 className="text-green-400 font-extrabold text-xl mb-2">Select 8 Best 3rd Place Teams 🥉</h2>
            <p className="text-gray-400 text-sm mb-1">
              From the 12 groups, 8 third-place teams advance to the R32 — they will face group winners.
            </p>
            <p className={`text-sm font-bold ${thirdPlaceAdvancing.length === 8 ? 'text-green-400' : 'text-yellow-400'}`}>
              Selected: {thirdPlaceAdvancing.length}/8
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(groups).map(([groupName]) => {
              const thirdTeam = groupPredictions[groupName]?.[2]
              if (!thirdTeam) return null
              const isSelected = thirdPlaceAdvancing.includes(thirdTeam)
              return (
                <motion.div key={groupName} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  onClick={() => {
                    if (isSelected) {
                      setThirdPlaceAdvancing(prev => prev.filter(t => t !== thirdTeam))
                    } else {
                      if (thirdPlaceAdvancing.length >= 8) { alert('You can only select 8!'); return }
                      setThirdPlaceAdvancing(prev => [...prev, thirdTeam])
                    }
                  }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition ${
                    isSelected ? 'border-green-500 bg-green-500 bg-opacity-10' : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                  }`}>
                  <span className={`font-extrabold text-sm w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 ${
                    isSelected ? 'bg-green-500 text-black' : 'bg-gray-700 text-gray-400'
                  }`}>{groupName}</span>
                  <img src={`https://flagcdn.com/w40/${FLAGS[thirdTeam] || 'un'}.png`} alt={thirdTeam}
                    className="w-9 h-6 object-cover rounded-sm flex-shrink-0"
                    onError={(e) => { e.target.style.display = 'none' }} />
                  <div className="flex-1">
                    <p className="text-white font-bold">{thirdTeam}</p>
                    <p className="text-gray-500 text-xs">3rd Place — Group {groupName}</p>
                  </div>
                  {isSelected && <span className="text-green-400 font-bold text-lg">✓</span>}
                </motion.div>
                
              )
            })}
            {! locked && (
            <div className="col-span-full flex justify-center mt-6">
              <button onClick={saveProgress} disabled={saving}
              className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-3 rounded-full transition disabled:opacity-50 ">
                {saving ? 'Saving...' : '💾 Save 3rd Place Predictions'}
              </button>
            </div>
          )
          }
          </div>
        </div>
      )}

      {/* KNOCKOUT STAGE */}
      {/* KNOCKOUT STAGE — BRACKET VIEW */}
{activeTab === 'knockout' && (
  <div>
    {Object.keys(groupPredictions).length < 12 ? (
      <div className="text-center py-20">
        <p className="text-yellow-400 text-lg font-bold">⚠️ Complete Group Stage first!</p>
      </div>
    ) : thirdPlaceAdvancing.length < 8 ? (
      <div className="text-center py-20">
        <p className="text-yellow-400 text-lg font-bold">⚠️ Select all 8 third-place teams first!</p>
        <p className="text-gray-500 text-sm mt-2">Go to the 3rd Place tab.</p>
      </div>
    ) : (
      <>
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-6">
          <h2 className="text-green-400 font-extrabold text-xl mb-2">Knockout Bracket 🏆</h2>
          <p className="text-gray-400 text-sm">
          Tap a team to advance them. The bracket fills in as you pick.
          <span className="text-green-400 font-bold"> 👉 Scroll sideways to see all rounds.</span>
          </p>
        </div>

        {/* Horizontal scrollable bracket */}
        <div className="overflow-x-auto pb-6">
          <div className="flex gap-6 min-w-max items-stretch">

            <BracketColumn title="Round of 32" matches={r32Matches}
              predictions={knockoutPredictions.r32}
              onPick={(id, team) => setKnockoutPredictions(p => ({ ...p, r32: { ...p.r32, [id]: team } }))}
            />

            <BracketColumn title="Round of 16" matches={r16Matches}
              predictions={knockoutPredictions.r16}
              onPick={(id, team) => setKnockoutPredictions(p => ({ ...p, r16: { ...p.r16, [id]: team } }))}
            />

            <BracketColumn title="Quarter Finals" matches={qfMatches}
              predictions={knockoutPredictions.quarter}
              onPick={(id, team) => setKnockoutPredictions(p => ({ ...p, quarter: { ...p.quarter, [id]: team } }))}
            />

            <BracketColumn title="Semi Finals" matches={sfMatches}
              predictions={knockoutPredictions.semi}
              onPick={(id, team) => setKnockoutPredictions(p => ({ ...p, semi: { ...p.semi, [id]: team } }))}
            />

            {/* Final + 3rd Place column */}
            <div className="flex flex-col justify-center gap-6 flex-shrink-0">
              {/* Final */}
              <div>
                <h4 className="text-yellow-400 font-bold text-xs uppercase tracking-wider mb-3 text-center">
                  🏆 Final
                </h4>
                <div className="bg-gray-800 rounded-lg border-2 border-yellow-500 overflow-hidden w-44">
                  <div className="text-yellow-600 text-[10px] text-center py-1 bg-gray-900 font-bold">CHAMPION</div>
                  {finalTeams.length === 2 ? finalTeams.map(team => (
                    <button key={team}
                      onClick={() => setKnockoutPredictions(p => ({ ...p, final: team }))}
                      className={`w-full flex items-center gap-2 px-3 py-2 transition ${
                        knockoutPredictions.final === team
                          ? 'bg-yellow-500 bg-opacity-20 border-l-4 border-yellow-500'
                          : 'hover:bg-gray-700 border-l-4 border-transparent'
                      }`}>
                      <img src={`https://flagcdn.com/w40/${FLAGS[team] || 'un'}.png`} alt={team}
                        className="w-6 h-4 object-cover rounded-sm" />
                      <span className={`text-xs font-bold truncate flex-1 text-left ${
                        knockoutPredictions.final === team ? 'text-yellow-400' : 'text-white'
                      }`}>{team}</span>
                      {knockoutPredictions.final === team && <span className="text-yellow-400 text-xs">🏆</span>}
                    </button>
                  )) : (
                    <p className="text-gray-600 text-xs italic text-center py-4">Complete Semis</p>
                  )}
                </div>
              </div>

              {/* 3rd Place */}
              <div>
                <h4 className="text-orange-400 font-bold text-xs uppercase tracking-wider mb-3 text-center">
                  🥉 3rd Place
                </h4>
                <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden w-44">
                  <div className="text-orange-600 text-[10px] text-center py-1 bg-gray-900 font-bold">BRONZE</div>
                  {sfMatches.every(m => knockoutPredictions.semi[m.id]) ? (
                    sfMatches.map(sfMatch => {
                      const winner = knockoutPredictions.semi[sfMatch.id]
                      const loser = winner === sfMatch.team1 ? sfMatch.team2 : sfMatch.team1
                      if (!loser || loser === '?') return null
                      return (
                        <button key={sfMatch.id}
                          onClick={() => setKnockoutPredictions(p => ({ ...p, third_place: loser }))}
                          className={`w-full flex items-center gap-2 px-3 py-2 transition ${
                            knockoutPredictions.third_place === loser
                              ? 'bg-orange-500 bg-opacity-20 border-l-4 border-orange-500'
                              : 'hover:bg-gray-700 border-l-4 border-transparent'
                          }`}>
                          <img src={`https://flagcdn.com/w40/${FLAGS[loser] || 'un'}.png`} alt={loser}
                            className="w-6 h-4 object-cover rounded-sm" />
                          <span className={`text-xs font-bold truncate flex-1 text-left ${
                            knockoutPredictions.third_place === loser ? 'text-orange-400' : 'text-white'
                          }`}>{loser}</span>
                          {knockoutPredictions.third_place === loser && <span className="text-orange-400 text-xs">🥉</span>}
                        </button>
                      )
                    })
                  ) : (
                    <p className="text-gray-600 text-xs italic text-center py-4">Complete Semis</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
        {/* Final Submit */}
          <div className="col-span-full flex flex-col items-center gap-3 mt-6">
            
            <button onClick={savePredictions} disabled={saving || locked}
              className={`font-extrabold px-12 py-4 rounded-full text-lg transition disabled:opacity-50 ${
                locked
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-400 text-black'
              }`}>
              {locked ? '🔒 Predictions Locked' : saving ? 'Saving...' : '🔒 Submit & Lock All Predictions'}
            </button>
            {!locked && (
              <p className="text-gray-500 text-xs">⚠️ Once submitted, predictions cannot be changed</p>
            )}
          </div>
      </>
    )}
  </div>
)}

      {/* AWARDS */}
      {activeTab === 'awards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-yellow-400 font-extrabold text-lg mb-4">⚽ Best Players in the World Cup</h2>
            <div className="flex flex-col gap-4">
              {[
                { label: '🥇 Golden Ball (15pts)', value: goldenBall, setter: setGoldenBall, ring: 'focus-within:ring-yellow-400' },
                { label: '🥈 Silver Ball (10pts)', value: silverBall, setter: setSilverBall, ring: 'focus-within:ring-gray-400' },
                { label: '🥉 Bronze Ball (5pts)', value: bronzeBall, setter: setBronzeBall, ring: 'focus-within:ring-orange-400' },
              ].map(({ label, value, setter, ring }) => (
                <div key={label}>
                  <label className="text-gray-300 text-sm mb-1 block">{label}</label>
                  <PlayerSearch value={value} onChange={val => setter(val)} placeholder="Search player..." ringColor={ring} />
                </div>
              ))}
            </div>
          </motion.div>

          {[
  { title: '👟 Golden Boot', color: 'text-orange-400', ring: 'focus-within:ring-orange-400', state: goldenBoot, setState: setGoldenBoot },
  { title: '🧤 Golden Glove', color: 'text-blue-400', ring: 'focus-within:ring-blue-400', state: goldenGlove, setState: setGoldenGlove },
].map(({ title, color, ring, state, setState }) => (
  <motion.div key={title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
    <h2 className={`${color} font-extrabold text-lg mb-1`}>{title}</h2>
    <p className="text-gray-500 text-xs mb-4">1st: 12pts · 2nd: 8pts · 3rd: 4pts</p>
    <div className="flex flex-col gap-4">
      {['1st Choice', '2nd Choice', '3rd Choice'].map((label, i) => (
        <div key={label}>
          <label className="text-gray-300 text-sm mb-1 block">{label}</label>
          <PlayerSearch value={state[i]}
            onChange={val => { const u = [...state]; u[i] = val; setState(u) }}
            placeholder="Search player..." ringColor={ring} />
        </div>
      ))}
    </div>
  </motion.div>
))}

{/* U21 Award — only U21 eligible players */}
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
  className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
  <h2 className="text-purple-400 font-extrabold text-lg mb-1">🌟 Best U21 Player</h2>
  <p className="text-gray-500 text-xs mb-4">
    1st: 12pts · 2nd: 8pts · 3rd: 4pts — Only players born Jan 1, 2005 or later
  </p>
  <div className="flex flex-col gap-4">
    {['1st Choice', '2nd Choice', '3rd Choice'].map((label, i) => (
      <div key={label}>
        <label className="text-gray-300 text-sm mb-1 block">{label}</label>
        <PlayerSearch value={u21Award[i]}
          onChange={val => { const u = [...u21Award]; u[i] = val; setU21Award(u) }}
          placeholder="Search U21 player..."
          ringColor="focus-within:ring-purple-400"
          playerList={U21_PLAYERS}
        />
      </div>
    ))}
  </div>
</motion.div>

{/* Save Awards Button */}
<div className="col-span-full flex flex-col items-center gap-3 mt-6">
  
  <button onClick={saveAwards} disabled={saving || awardsLocked}
    className={`font-extrabold px-10 py-4 rounded-full text-lg transition disabled:opacity-50 ${
      awardsLocked
        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
        : 'bg-green-500 hover:bg-green-400 text-black'
    }`}>
    {awardsLocked ? '🔒 Awards Locked' : saving ? 'Saving...' : '🔒 Submit & Lock Award Predictions'}
  </button>
  {!awardsLocked && (
    <p className="text-gray-500 text-xs">⚠️ Once submitted, award predictions cannot be changed</p>
  )}
</div>

{/* Final Submit */}
          <div className="col-span-full flex flex-col items-center gap-3 mt-6">
            
            <button onClick={savePredictions} disabled={saving || locked}
              className={`font-extrabold px-12 py-4 rounded-full text-lg transition disabled:opacity-50 ${
                locked
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-400 text-black'
              }`}>
              {locked ? '🔒 Predictions Locked' : saving ? 'Saving...' : '🔒 Submit & Lock All Predictions'}
            </button>
            {!locked && (
              <p className="text-gray-500 text-xs">⚠️ Once submitted, predictions cannot be changed</p>
            )}
          </div>
</div>
  )}

      {/* SECOND CHANCE */}
      {activeTab === 'second' && (
        <div className="flex flex-col items-center justify-center py-20">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center">
            <span className="text-6xl mb-6 block">🔄</span>
            <h2 className="text-3xl font-extrabold text-green-400 mb-3">Second Chance</h2>
            <p className="text-gray-400 text-lg mb-2">Coming after the Group Stage ends!</p>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              Once all group stage matches are completed on June 27,
              you'll get a second chance to predict the knockout stage
              from Round of 32 all the way to the Final — based on the actual results.
            </p>
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 inline-block">
              <p className="text-yellow-400 font-bold text-lg">🗓️ Opens: June 28, 2026</p>
              <p className="text-gray-500 text-sm mt-1">After all group results are confirmed</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Predictions