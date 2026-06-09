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

const GROUP_COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e',
  '#06b6d4','#3b82f6','#8b5cf6','#ec4899',
  '#14b8a6','#f59e0b','#84cc16','#6366f1',
]
const GROUP_LETTERS = ['A','B','C','D','E','F','G','H','I','J','K','L']

const POSITION_CONFIG = [
  { label: '1st', bg: '#22c55e', color: '#000' },
  { label: '2nd', bg: '#3b82f6', color: '#fff' },
  { label: '3rd', bg: '#f59e0b', color: '#000' },
  { label: '4th', bg: '#ef4444', color: '#fff' },
]

const U21_NAMES = new Set([
  'Lamine Yamal','Pau Cubarsi','Marc Pubill','Victor Munoz',
  'Warren Zaire-Emery','Desire Doue','Kobbie Mainoo',"Nico O'Reilly",
  'Lennart Karl','Arda Guler','Kenan Yildiz','Can Uzun',
  'Endrick','Rayan','Nico Paz','Luka Vuskovic','Kendry Paez',
  'Jorrel Hato','Lucas Bergvall','Taha Ali','Nestory Irankunda',
  'Ayoub Bouaddi','Gilberto Mora','Mateo Chavez','Mike Penders','Nathan Ngoy',
  'Yan Diomande','Oumar Diakite','Antonio Nusa','Ibrahim Mbaye',
  'Lukas Hornicek','Stepan Chaloupek','Findlay Curtis','Tyler Fletcher','Ben Gannon-Doak',
  'Khulumani Ndamane','Kamogelo Sebelebele','Ibrahim Maza','Abbosbek Fayzullaev','Hamza Abdel Karim',
])
const U21_PLAYERS = PLAYERS.filter(p => U21_NAMES.has(p.name))

// ── SORTABLE TEAM ──
function SortableTeam({ team, index }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: team })
  const pos = POSITION_CONFIG[index]
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, zIndex: isDragging ? 50 : 'auto' }
  return (
    <div ref={setNodeRef} style={{ ...style, display: 'flex', alignItems: 'center', gap: 10,
      background: isDragging ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
      padding: '10px 12px', cursor: 'grab', transition: 'background 0.15s' }}
      {...attributes} {...listeners}>
      <span style={{ width: 28, height: 28, borderRadius: '50%', background: pos.bg, color: pos.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
        {pos.label}
      </span>
      <img src={`https://flagcdn.com/w40/${FLAGS[team] || 'un'}.png`} alt={team}
        style={{ width: 32, height: 21, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }}
        onError={e => { e.target.style.display = 'none' }} />
      <span style={{ flex: 1, fontWeight: 600, fontSize: 13, color: '#f1f5f9' }}>{team}</span>
      <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 16, userSelect: 'none' }}>⠿</span>
    </div>
  )
}

// ── AUTO ASSIGN 3RD PLACE ──
function autoAssign3rdPlace(thirdPlaceAdvancing, groupPredictions) {
  const teamToGroup = {}
  Object.keys(groupPredictions).forEach(g => {
    const thirdTeam = groupPredictions[g]?.[2]
    if (thirdTeam && thirdPlaceAdvancing.includes(thirdTeam)) teamToGroup[thirdTeam] = g
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
  const isEligible = (team, slot) => slot.eligible.includes(teamToGroup[team]) && teamToGroup[team] !== slot.winnerGroup
  const teamMatch = {}
  const findSlotById = id => slots.find(s => s.slot === id)
  function augment(slot, visited) {
    for (const team of thirdPlaceAdvancing) {
      if (visited.has(team)) continue
      if (!isEligible(team, slot)) continue
      visited.add(team)
      const currentSlotId = teamMatch[team]
      if (!currentSlotId || augment(findSlotById(currentSlotId), visited)) {
        teamMatch[team] = slot.slot
        return true
      }
    }
    return false
  }
  for (const slot of slots) augment(slot, new Set())
  const assigned = {}
  Object.keys(teamMatch).forEach(team => { assigned[teamMatch[team]] = team })
  return assigned
}

function getR32Matches(gp, thirdPlaceAdvancing) {
  const w = g => gp[g]?.[0] || '?'
  const r = g => gp[g]?.[1] || '?'
  const assignments = thirdPlaceAdvancing.length === 8 ? autoAssign3rdPlace(thirdPlaceAdvancing, gp) : {}
  const t = slot => assignments[slot] || '?'
  return [
    { id: 'r32_73', match: 73, team1: r('A'), team2: r('B'), is3rd: false },
    { id: 'r32_74', match: 74, team1: w('E'), team2: t('t74'), is3rd: true },
    { id: 'r32_75', match: 75, team1: w('F'), team2: r('C'), is3rd: false },
    { id: 'r32_76', match: 76, team1: w('C'), team2: r('F'), is3rd: false },
    { id: 'r32_77', match: 77, team1: w('I'), team2: t('t77'), is3rd: true },
    { id: 'r32_78', match: 78, team1: r('E'), team2: r('I'), is3rd: false },
    { id: 'r32_79', match: 79, team1: w('A'), team2: t('t79'), is3rd: true },
    { id: 'r32_80', match: 80, team1: w('L'), team2: t('t80'), is3rd: true },
    { id: 'r32_81', match: 81, team1: w('D'), team2: t('t81'), is3rd: true },
    { id: 'r32_82', match: 82, team1: w('G'), team2: t('t82'), is3rd: true },
    { id: 'r32_83', match: 83, team1: r('K'), team2: r('L'), is3rd: false },
    { id: 'r32_84', match: 84, team1: w('H'), team2: r('J'), is3rd: false },
    { id: 'r32_85', match: 85, team1: w('B'), team2: t('t85'), is3rd: true },
    { id: 'r32_86', match: 86, team1: w('J'), team2: r('H'), is3rd: false },
    { id: 'r32_87', match: 87, team1: w('K'), team2: t('t87'), is3rd: true },
    { id: 'r32_88', match: 88, team1: r('D'), team2: r('G'), is3rd: false },
  ].sort((a, b) => a.match - b.match)
}
function getR16Matches(r32Preds) {
  const w = id => r32Preds[id] || '?'
  return [
    { id: 'r16_1', match: 'R16-1', team1: w('r32_73'), team2: w('r32_74') },
    { id: 'r16_2', match: 'R16-2', team1: w('r32_75'), team2: w('r32_76') },
    { id: 'r16_3', match: 'R16-3', team1: w('r32_77'), team2: w('r32_78') },
    { id: 'r16_4', match: 'R16-4', team1: w('r32_79'), team2: w('r32_80') },
    { id: 'r16_5', match: 'R16-5', team1: w('r32_81'), team2: w('r32_82') },
    { id: 'r16_6', match: 'R16-6', team1: w('r32_83'), team2: w('r32_84') },
    { id: 'r16_7', match: 'R16-7', team1: w('r32_85'), team2: w('r32_86') },
    { id: 'r16_8', match: 'R16-8', team1: w('r32_87'), team2: w('r32_88') },
  ]
}
function getQFMatches(r16Preds) {
  const w = id => r16Preds[id] || '?'
  return [
    { id: 'qf_1', match: 'QF-1', team1: w('r16_1'), team2: w('r16_2') },
    { id: 'qf_2', match: 'QF-2', team1: w('r16_3'), team2: w('r16_4') },
    { id: 'qf_3', match: 'QF-3', team1: w('r16_5'), team2: w('r16_6') },
    { id: 'qf_4', match: 'QF-4', team1: w('r16_7'), team2: w('r16_8') },
  ]
}
function getSFMatches(qfPreds) {
  const w = id => qfPreds[id] || '?'
  return [
    { id: 'sf_1', match: 'SF-1', team1: w('qf_1'), team2: w('qf_2') },
    { id: 'sf_2', match: 'SF-2', team1: w('qf_3'), team2: w('qf_4') },
  ]
}
function getFinalTeams(sfPreds) {
  return ['sf_1', 'sf_2'].map(id => sfPreds[id]).filter(Boolean)
}

// ── BRACKET TEAM ROW ──
function TeamRow({ team, prediction, matchId, onPick }) {
  const selected = prediction === team
  return (
    <button onClick={() => team !== '?' && onPick(matchId, team)} disabled={team === '?'}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 10px', background: selected ? 'rgba(34,197,94,0.15)' : 'transparent',
        borderLeft: `3px solid ${selected ? '#22c55e' : 'transparent'}`,
        border: 'none', cursor: team === '?' ? 'default' : 'pointer',
        transition: 'background 0.15s', opacity: team === '?' ? 0.35 : 1,
      }}>
      {team !== '?' ? (
        <img src={`https://flagcdn.com/w40/${FLAGS[team] || 'un'}.png`} alt={team}
          style={{ width: 22, height: 15, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }}
          onError={e => { e.target.style.display = 'none' }} />
      ) : (
        <span style={{ width: 22, height: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 10 }}>·</span>
      )}
      <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: selected ? '#22c55e' : team === '?' ? '#475569' : '#e2e8f0', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {team === '?' ? 'TBD' : team}
      </span>
      {selected && team !== '?' && <span style={{ color: '#22c55e', fontSize: 10 }}>✓</span>}
    </button>
  )
}

function BracketMatch({ match, prediction, onPick }) {
  return (
    <div style={{
      background: '#0f1729', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 8, overflow: 'hidden', width: 148, flexShrink: 0,
    }}>
      <div style={{ background: 'rgba(255,255,255,0.04)', padding: '4px 8px', fontSize: 9, fontWeight: 700, color: '#64748b', textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {typeof match.match === 'number' ? `Match ${match.match}` : match.match}
      </div>
      <TeamRow team={match.team1 || '?'} prediction={prediction} matchId={match.id} onPick={onPick} />
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
      <TeamRow team={match.team2 || '?'} prediction={prediction} matchId={match.id} onPick={onPick} />
    </div>
  )
}

function BracketColumn({ title, matches, predictions, onPick }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase',
        letterSpacing: '0.1em', textAlign: 'center', marginBottom: 10 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, justifyContent: 'space-around' }}>
        {matches.map(match => (
          <BracketMatch key={match.id} match={match} prediction={predictions[match.id]} onPick={onPick} />
        ))}
      </div>
    </div>
  )
}

// ── MAIN ──
function Predictions() {
  const [groups, setGroups] = useState({})
  const [groupPredictions, setGroupPredictions] = useState({})
  const [thirdPlaceAdvancing, setThirdPlaceAdvancing] = useState([])
  const [knockoutPredictions, setKnockoutPredictions] = useState({ r32: {}, r16: {}, quarter: {}, semi: {}, third_place: '', final: '' })
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
      if (new Date() >= new Date('2026-06-11T19:00:00Z')) { setLocked(true); setAwardsLocked(true) }
      const token = localStorage.getItem('token')
      if (token) {
        axios.get('http://192.168.100.3:5000/api/predictions', { headers: { Authorization: `Bearer ${token}` } })
          .then(saved => {
            if (saved.data.saved) {
              if (Object.keys(saved.data.group_predictions).length > 0) setGroupPredictions(saved.data.group_predictions)
              if (saved.data.third_place_advancing.length > 0) setThirdPlaceAdvancing(saved.data.third_place_advancing)
              if (Object.keys(saved.data.knockout_predictions).length > 0) setKnockoutPredictions(saved.data.knockout_predictions)
              if (saved.data.golden_ball) setGoldenBall(saved.data.golden_ball)
              if (saved.data.silver_ball) setSilverBall(saved.data.silver_ball)
              if (saved.data.bronze_ball) setBronzeBall(saved.data.bronze_ball)
              if (saved.data.golden_boot?.length) setGoldenBoot(saved.data.golden_boot)
              if (saved.data.golden_glove?.length) setGoldenGlove(saved.data.golden_glove)
              if (saved.data.u21_award?.length) setU21Award(saved.data.u21_award)
              setLocked(true)
              if (saved.data.golden_ball || saved.data.golden_boot?.some(v => v)) setAwardsLocked(true)
            }
          }).catch(() => {})
      }
    })
  }, [])

  const handleDragEnd = (groupName, event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const teams = groupPredictions[groupName]
    setGroupPredictions(prev => ({ ...prev, [groupName]: arrayMove(teams, teams.indexOf(active.id), teams.indexOf(over.id)) }))
  }

  const payload = () => ({
    group_predictions: groupPredictions, third_place_advancing: thirdPlaceAdvancing,
    knockout_predictions: knockoutPredictions, golden_ball: goldenBall, silver_ball: silverBall,
    bronze_ball: bronzeBall, golden_boot: goldenBoot, golden_glove: goldenGlove, u21_award: u21Award,
  })

  const saveProgress = async () => {
    if (!token) { toast.error('Please login to save!'); return }
    if (locked) { toast.error('Predictions are locked!'); return }
    setSaving(true)
    try {
      await axios.post('http://192.168.100.3:5000/api/predictions', payload(), { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Progress saved!')
    } catch { toast.error('Error saving. Please try again.') }
    setSaving(false)
  }

  const savePredictions = async () => {
    if (!token) { toast.error('Please login to save predictions!'); return }
    if (locked) { toast.error('Predictions are locked!'); return }
    const hasKnockout = Object.keys(knockoutPredictions.r32).length > 0
    const hasGroups = Object.values(groupPredictions).some((teams, i) => {
      const original = Object.values(groups)[i]
      return original && JSON.stringify(teams) !== JSON.stringify(original)
    })
    if (!hasKnockout && !hasGroups) { toast.error('Fill in your predictions first!'); return }
    setSaving(true)
    try {
      await axios.post('http://192.168.100.3:5000/api/predictions', payload(), { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Predictions saved and locked! 🔒')
      setLocked(true)
      if (goldenBall || goldenBoot.some(v => v)) setAwardsLocked(true)
    } catch { toast.error('Error saving. Please try again.') }
    setSaving(false)
  }

  const saveAwards = async () => {
    if (!token) { toast.error('Please login to save!'); return }
    if (awardsLocked) { toast.error('Award predictions are locked!'); return }
    const hasAwards = goldenBall || silverBall || bronzeBall || goldenBoot.some(v => v) || goldenGlove.some(v => v) || u21Award.some(v => v)
    if (!hasAwards) { toast.error('Pick your award predictions first!'); return }
    setSaving(true)
    try {
      await axios.post('http://192.168.100.3:5000/api/predictions', payload(), { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Award predictions saved and locked! 🔒')
      setAwardsLocked(true)
    } catch { toast.error('Error saving. Please try again.') }
    setSaving(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080d1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚽</div>
        <p style={{ color: '#3b82f6', fontWeight: 700, fontSize: 16, animation: 'pulse 1.5s infinite' }}>Loading predictions...</p>
      </div>
    </div>
  )

  const r32Matches = getR32Matches(groupPredictions, thirdPlaceAdvancing)
  const r16Matches = getR16Matches(knockoutPredictions.r32)
  const qfMatches = getQFMatches(knockoutPredictions.r16)
  const sfMatches = getSFMatches(knockoutPredictions.quarter)
  const finalTeams = getFinalTeams(knockoutPredictions.semi)

  const TABS = [
    { id: 'groups', label: 'Group Stage', icon: '🗂' },
    { id: 'third', label: '3rd Place', icon: '🥉' },
    { id: 'knockout', label: 'Knockout', icon: '🏆' },
    { id: 'awards', label: 'Awards', icon: '🎖' },
    { id: 'second', label: 'Second Chance', icon: '🔄', soon: true },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#080d1a', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Top color bar */}
      <div style={{ display: 'flex', height: 3 }}>
        {GROUP_COLORS.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            FIFA World Cup 2026
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
            Your Predictions <span style={{ color: '#3b82f6' }}>🎯</span>
          </h1>
          <p style={{ color: '#64748b', marginTop: 6, fontSize: 14 }}>
            Drag teams to rank each group, then fill in the knockout bracket.
          </p>
        </div>

        {/* Locked banner */}
        {locked && (
          <div style={{
            background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)',
            borderRadius: 12, padding: '14px 18px', marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 20 }}>🔒</span>
            <div>
              <p style={{ fontWeight: 700, color: '#fbbf24', margin: 0, fontSize: 14 }}>Predictions Locked</p>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: 13, marginTop: 2 }}>
                {new Date() >= new Date('2026-06-11T19:00:00Z')
                  ? 'The World Cup has started! Predictions are locked for everyone. See you at the Second Chance 😉'
                  : "You've already submitted. They cannot be changed. See you at the Second Chance 😉"}
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 24, scrollbarWidth: 'none' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                position: 'relative', flexShrink: 0,
                padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13,
                cursor: 'pointer', transition: 'all 0.15s', border: 'none',
                background: activeTab === tab.id ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                color: activeTab === tab.id ? '#fff' : '#94a3b8',
                boxShadow: activeTab === tab.id ? '0 4px 16px rgba(59,130,246,0.3)' : 'none',
              }}>
              {tab.icon} {tab.label}
              {tab.soon && (
                <span style={{
                  position: 'absolute', top: -6, right: -6,
                  background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 800,
                  padding: '2px 5px', borderRadius: 20,
                }}>SOON</span>
              )}
            </button>
          ))}
        </div>

        {/* ── GROUP STAGE ── */}
        {activeTab === 'groups' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {Object.entries(groups).map(([groupName], gi) => {
                const color = GROUP_COLORS[GROUP_LETTERS.indexOf(groupName)] || '#3b82f6'
                return (
                  <motion.div key={groupName} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: gi * 0.04 }}
                    style={{
                      background: '#0d1526', border: `1px solid ${color}30`,
                      borderRadius: 14, padding: 18, borderTop: `3px solid ${color}`,
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <span style={{ width: 28, height: 28, borderRadius: 6, background: color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 900, color: '#000', flexShrink: 0 }}>
                        {groupName}
                      </span>
                      <span style={{ fontWeight: 800, fontSize: 15, color: '#f1f5f9' }}>Group {groupName}</span>
                    </div>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={e => handleDragEnd(groupName, e)}>
                      <SortableContext items={groupPredictions[groupName] || []} strategy={verticalListSortingStrategy}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {groupPredictions[groupName]?.map((team, index) => (
                            <SortableTeam key={team} team={team} index={index} />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, paddingInline: 2 }}>
                      <span style={{ color: '#22c55e' }}>🟢 1st & 2nd advance</span>
                      <span style={{ color: '#f59e0b' }}>🟡 3rd maybe</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
            {!locked && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
                <button onClick={saveProgress} disabled={saving}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: '#fff', fontWeight: 700, fontSize: 14,
                    padding: '12px 28px', borderRadius: 100, border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(59,130,246,0.3)', opacity: saving ? 0.6 : 1,
                  }}>
                  {saving ? 'Saving...' : '💾 Save Group Stage'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── 3RD PLACE ── */}
        {activeTab === 'third' && (
          <div>
            <div style={{
              background: '#0d1526', border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 14, padding: 20, marginBottom: 20, borderTop: '3px solid #f59e0b',
            }}>
              <h2 style={{ fontWeight: 800, fontSize: 18, color: '#fbbf24', margin: '0 0 6px' }}>
                🥉 Select 8 Best 3rd Place Teams
              </h2>
              <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 8px' }}>
                8 of the 12 third-place teams advance to the Round of 32.
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: thirdPlaceAdvancing.length === 8 ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                border: `1px solid ${thirdPlaceAdvancing.length === 8 ? '#22c55e' : '#f59e0b'}40`,
                borderRadius: 100, padding: '4px 12px',
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: thirdPlaceAdvancing.length === 8 ? '#22c55e' : '#fbbf24' }}>
                  {thirdPlaceAdvancing.length}/8 selected
                </span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
              {Object.entries(groups).map(([groupName], gi) => {
                const thirdTeam = groupPredictions[groupName]?.[2]
                if (!thirdTeam) return null
                const isSelected = thirdPlaceAdvancing.includes(thirdTeam)
                const color = GROUP_COLORS[GROUP_LETTERS.indexOf(groupName)] || '#3b82f6'
                return (
                  <motion.div key={groupName} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: gi * 0.04 }}
                    onClick={() => {
                      if (isSelected) { setThirdPlaceAdvancing(prev => prev.filter(t => t !== thirdTeam)) }
                      else { if (thirdPlaceAdvancing.length >= 8) { toast.error('You can only select 8!'); return } setThirdPlaceAdvancing(prev => [...prev, thirdTeam]) }
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: 14, borderRadius: 12, cursor: 'pointer',
                      background: isSelected ? `${color}12` : '#0d1526',
                      border: `2px solid ${isSelected ? color : 'rgba(255,255,255,0.06)'}`,
                      transition: 'all 0.15s',
                    }}>
                    <span style={{
                      width: 32, height: 32, borderRadius: 8, background: isSelected ? color : 'rgba(255,255,255,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 900, color: isSelected ? '#000' : '#64748b', flexShrink: 0,
                    }}>{groupName}</span>
                    <img src={`https://flagcdn.com/w40/${FLAGS[thirdTeam] || 'un'}.png`} alt={thirdTeam}
                      style={{ width: 36, height: 24, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }}
                      onError={e => { e.target.style.display = 'none' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9', margin: 0 }}>{thirdTeam}</p>
                      <p style={{ color: '#475569', fontSize: 11, margin: 0 }}>3rd — Group {groupName}</p>
                    </div>
                    {isSelected && <span style={{ color, fontSize: 16, fontWeight: 900 }}>✓</span>}
                  </motion.div>
                )
              })}
            </div>
            {!locked && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
                <button onClick={saveProgress} disabled={saving}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: '#fff', fontWeight: 700, fontSize: 14,
                    padding: '12px 28px', borderRadius: 100, border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(59,130,246,0.3)', opacity: saving ? 0.6 : 1,
                  }}>
                  {saving ? 'Saving...' : '💾 Save 3rd Place Picks'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── KNOCKOUT ── */}
        {activeTab === 'knockout' && (
          <div>
            {Object.keys(groupPredictions).length < 12 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                <p style={{ color: '#fbbf24', fontWeight: 700, fontSize: 16 }}>Complete Group Stage first!</p>
              </div>
            ) : thirdPlaceAdvancing.length < 8 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                <p style={{ color: '#fbbf24', fontWeight: 700, fontSize: 16 }}>Select all 8 third-place teams first!</p>
                <p style={{ color: '#475569', fontSize: 13, marginTop: 6 }}>Go to the 3rd Place tab.</p>
              </div>
            ) : (
              <>
                <div style={{
                  background: '#0d1526', border: '1px solid rgba(59,130,246,0.2)',
                  borderRadius: 14, padding: 18, marginBottom: 20, borderTop: '3px solid #3b82f6',
                }}>
                  <h2 style={{ fontWeight: 800, fontSize: 18, color: '#93c5fd', margin: '0 0 4px' }}>🏆 Knockout Bracket</h2>
                  <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
                    Tap a team to advance them. <span style={{ color: '#3b82f6', fontWeight: 600 }}>👉 Scroll sideways to see all rounds.</span>
                  </p>
                </div>

                <div style={{ overflowX: 'auto', paddingBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 16, minWidth: 'max-content', alignItems: 'stretch' }}>
                    <BracketColumn title="Round of 32" matches={r32Matches} predictions={knockoutPredictions.r32}
                      onPick={(id, team) => setKnockoutPredictions(p => ({ ...p, r32: { ...p.r32, [id]: team } }))} />
                    <BracketColumn title="Round of 16" matches={r16Matches} predictions={knockoutPredictions.r16}
                      onPick={(id, team) => setKnockoutPredictions(p => ({ ...p, r16: { ...p.r16, [id]: team } }))} />
                    <BracketColumn title="Quarter Finals" matches={qfMatches} predictions={knockoutPredictions.quarter}
                      onPick={(id, team) => setKnockoutPredictions(p => ({ ...p, quarter: { ...p.quarter, [id]: team } }))} />
                    <BracketColumn title="Semi Finals" matches={sfMatches} predictions={knockoutPredictions.semi}
                      onPick={(id, team) => setKnockoutPredictions(p => ({ ...p, semi: { ...p.semi, [id]: team } }))} />

                    {/* Final + 3rd */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20, flexShrink: 0 }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', marginBottom: 8 }}>🏆 Final</div>
                        <div style={{ background: '#0f1729', border: '2px solid #fbbf24', borderRadius: 8, overflow: 'hidden', width: 148 }}>
                          <div style={{ background: 'rgba(251,191,36,0.1)', padding: '4px 8px', fontSize: 9, fontWeight: 800, color: '#fbbf24', textAlign: 'center', letterSpacing: '0.08em' }}>CHAMPION</div>
                          {finalTeams.length === 2 ? finalTeams.map(team => (
                            <button key={team} onClick={() => setKnockoutPredictions(p => ({ ...p, final: team }))}
                              style={{
                                width: '100%', display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px',
                                background: knockoutPredictions.final === team ? 'rgba(251,191,36,0.15)' : 'transparent',
                                borderLeft: `3px solid ${knockoutPredictions.final === team ? '#fbbf24' : 'transparent'}`,
                                border: 'none', cursor: 'pointer', transition: 'background 0.15s',
                              }}>
                              <img src={`https://flagcdn.com/w40/${FLAGS[team] || 'un'}.png`} alt={team}
                                style={{ width: 22, height: 15, objectFit: 'cover', borderRadius: 2 }} />
                              <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: knockoutPredictions.final === team ? '#fbbf24' : '#e2e8f0', textAlign: 'left' }}>{team}</span>
                              {knockoutPredictions.final === team && <span style={{ color: '#fbbf24', fontSize: 12 }}>🏆</span>}
                            </button>
                          )) : <p style={{ color: '#475569', fontSize: 11, textAlign: 'center', padding: '12px 8px', fontStyle: 'italic' }}>Complete Semis</p>}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#fb923c', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', marginBottom: 8 }}>🥉 3rd Place</div>
                        <div style={{ background: '#0f1729', border: '1px solid rgba(251,146,60,0.3)', borderRadius: 8, overflow: 'hidden', width: 148 }}>
                          <div style={{ background: 'rgba(251,146,60,0.08)', padding: '4px 8px', fontSize: 9, fontWeight: 800, color: '#fb923c', textAlign: 'center', letterSpacing: '0.08em' }}>BRONZE</div>
                          {sfMatches.every(m => knockoutPredictions.semi[m.id]) ? (
                            sfMatches.map(sfMatch => {
                              const winner = knockoutPredictions.semi[sfMatch.id]
                              const loser = winner === sfMatch.team1 ? sfMatch.team2 : sfMatch.team1
                              if (!loser || loser === '?') return null
                              return (
                                <button key={sfMatch.id} onClick={() => setKnockoutPredictions(p => ({ ...p, third_place: loser }))}
                                  style={{
                                    width: '100%', display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px',
                                    background: knockoutPredictions.third_place === loser ? 'rgba(251,146,60,0.15)' : 'transparent',
                                    borderLeft: `3px solid ${knockoutPredictions.third_place === loser ? '#fb923c' : 'transparent'}`,
                                    border: 'none', cursor: 'pointer', transition: 'background 0.15s',
                                  }}>
                                  <img src={`https://flagcdn.com/w40/${FLAGS[loser] || 'un'}.png`} alt={loser}
                                    style={{ width: 22, height: 15, objectFit: 'cover', borderRadius: 2 }} />
                                  <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: knockoutPredictions.third_place === loser ? '#fb923c' : '#e2e8f0', textAlign: 'left' }}>{loser}</span>
                                  {knockoutPredictions.third_place === loser && <span style={{ color: '#fb923c', fontSize: 10 }}>🥉</span>}
                                </button>
                              )
                            })
                          ) : <p style={{ color: '#475569', fontSize: 11, textAlign: 'center', padding: '12px 8px', fontStyle: 'italic' }}>Complete Semis</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 24 }}>
                  <button onClick={savePredictions} disabled={saving || locked}
                    style={{
                      background: locked ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                      color: locked ? '#64748b' : '#000', fontWeight: 800, fontSize: 15,
                      padding: '14px 40px', borderRadius: 100, border: 'none',
                      cursor: locked ? 'not-allowed' : 'pointer',
                      boxShadow: locked ? 'none' : '0 4px 20px rgba(34,197,94,0.3)',
                      opacity: saving ? 0.7 : 1,
                    }}>
                    {locked ? '🔒 Predictions Locked' : saving ? 'Saving...' : '🔒 Submit & Lock All Predictions'}
                  </button>
                  {!locked && <p style={{ color: '#475569', fontSize: 12 }}>⚠️ Once submitted, predictions cannot be changed</p>}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── AWARDS ── */}
        {activeTab === 'awards' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>

            {/* Golden Ball */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: '#0d1526', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 14, padding: 20, borderTop: '3px solid #fbbf24' }}>
              <h2 style={{ color: '#fbbf24', fontWeight: 800, fontSize: 16, margin: '0 0 16px' }}>⚽ Best Players</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: '🥇 Golden Ball (15pts)', value: goldenBall, setter: setGoldenBall, ring: 'focus-within:ring-yellow-400' },
                  { label: '🥈 Silver Ball (10pts)', value: silverBall, setter: setSilverBall, ring: 'focus-within:ring-gray-400' },
                  { label: '🥉 Bronze Ball (5pts)', value: bronzeBall, setter: setBronzeBall, ring: 'focus-within:ring-orange-400' },
                ].map(({ label, value, setter, ring }) => (
                  <div key={label}>
                    <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6, fontWeight: 600 }}>{label}</label>
                    <PlayerSearch value={value} onChange={val => setter(val)} placeholder="Search player..." ringColor={ring} />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Golden Boot */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              style={{ background: '#0d1526', border: '1px solid rgba(251,146,60,0.2)', borderRadius: 14, padding: 20, borderTop: '3px solid #fb923c' }}>
              <h2 style={{ color: '#fb923c', fontWeight: 800, fontSize: 16, margin: '0 0 4px' }}>👟 Golden Boot</h2>
              <p style={{ color: '#475569', fontSize: 12, margin: '0 0 14px' }}>1st: 12pts · 2nd: 8pts · 3rd: 4pts</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {['1st Choice', '2nd Choice', '3rd Choice'].map((label, i) => (
                  <div key={label}>
                    <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6, fontWeight: 600 }}>{label}</label>
                    <PlayerSearch value={goldenBoot[i]} onChange={val => { const u = [...goldenBoot]; u[i] = val; setGoldenBoot(u) }} placeholder="Search player..." ringColor="focus-within:ring-orange-400" />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Golden Glove */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ background: '#0d1526', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 14, padding: 20, borderTop: '3px solid #3b82f6' }}>
              <h2 style={{ color: '#60a5fa', fontWeight: 800, fontSize: 16, margin: '0 0 4px' }}>🧤 Golden Glove</h2>
              <p style={{ color: '#475569', fontSize: 12, margin: '0 0 14px' }}>1st: 12pts · 2nd: 8pts · 3rd: 4pts</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {['1st Choice', '2nd Choice', '3rd Choice'].map((label, i) => (
                  <div key={label}>
                    <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6, fontWeight: 600 }}>{label}</label>
                    <PlayerSearch value={goldenGlove[i]} onChange={val => { const u = [...goldenGlove]; u[i] = val; setGoldenGlove(u) }} placeholder="Search player..." ringColor="focus-within:ring-blue-400" />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* U21 Award */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              style={{ background: '#0d1526', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 14, padding: 20, borderTop: '3px solid #a855f7' }}>
              <h2 style={{ color: '#c084fc', fontWeight: 800, fontSize: 16, margin: '0 0 4px' }}>🌟 Best U21 Player</h2>
              <p style={{ color: '#475569', fontSize: 12, margin: '0 0 14px' }}>1st: 12pts · 2nd: 8pts · 3rd: 4pts — Born Jan 1, 2005 or later</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {['1st Choice', '2nd Choice', '3rd Choice'].map((label, i) => (
                  <div key={label}>
                    <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6, fontWeight: 600 }}>{label}</label>
                    <PlayerSearch value={u21Award[i]} onChange={val => { const u = [...u21Award]; u[i] = val; setU21Award(u) }} placeholder="Search U21 player..." ringColor="focus-within:ring-purple-400" playerList={U21_PLAYERS} />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Save Awards */}
            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <button onClick={saveAwards} disabled={saving || awardsLocked}
                style={{
                  background: awardsLocked ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #a855f7, #7c3aed)',
                  color: awardsLocked ? '#64748b' : '#fff', fontWeight: 800, fontSize: 15,
                  padding: '14px 36px', borderRadius: 100, border: 'none',
                  cursor: awardsLocked ? 'not-allowed' : 'pointer',
                  boxShadow: awardsLocked ? 'none' : '0 4px 20px rgba(168,85,247,0.3)',
                  opacity: saving ? 0.7 : 1,
                }}>
                {awardsLocked ? '🔒 Awards Locked' : saving ? 'Saving...' : '🔒 Submit & Lock Award Predictions'}
              </button>
              {!awardsLocked && <p style={{ color: '#475569', fontSize: 12 }}>⚠️ Once submitted, award predictions cannot be changed</p>}
            </div>
          </div>
        )}

        {/* ── SECOND CHANCE ── */}
        {activeTab === 'second' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🔄</div>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: '#f1f5f9', margin: '0 0 10px' }}>Second Chance</h2>
              <p style={{ color: '#64748b', fontSize: 16, margin: '0 0 6px' }}>Coming after the Group Stage ends!</p>
              <p style={{ color: '#475569', fontSize: 13, maxWidth: 420, margin: '0 auto 28px', lineHeight: 1.6 }}>
                Once all group matches finish on June 27, you'll get a fresh bracket prediction for the knockout stage based on the actual results.
              </p>
              <div style={{
                background: '#0d1526', border: '1px solid rgba(251,191,36,0.2)',
                borderRadius: 14, padding: '20px 32px', display: 'inline-block',
              }}>
                <p style={{ color: '#fbbf24', fontWeight: 800, fontSize: 16, margin: 0 }}>🗓️ Opens: June 28, 2026</p>
                <p style={{ color: '#475569', fontSize: 13, margin: '4px 0 0' }}>After all group results are confirmed</p>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )
}

export default Predictions
