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
import API_URL from '../config'
import { useColor } from '../assets/ColorContext'

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
  'Bosnia & Herzegovina': 'ba',
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

const POSITIONS = ['1st', '2nd', '3rd', '4th']

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

const CARD_H = 56
const CARD_W = 130
const COL_GAP = 10



// ── autoAssign3rdPlace ──
function autoAssign3rdPlace(thirdPlaceAdvancing, groupPredictions) {
  const teamToGroup = {}
  Object.keys(groupPredictions).forEach(g => {
    const thirdTeam = groupPredictions[g]?.[2]
    if (thirdTeam && thirdPlaceAdvancing.includes(thirdTeam)) teamToGroup[thirdTeam] = g
  })
  const slots = [
    { slot: 't74', eligible: ['A','B','C','D','F'], winnerGroup: 'E' },
    { slot: 't75', eligible: ['B','C','D','G','H'], winnerGroup: 'F' },
    { slot: 't77', eligible: ['C','D','F','G','H'], winnerGroup: 'I' },
    { slot: 't79', eligible: ['C','E','F','H','I'], winnerGroup: 'A' },
    { slot: 't80', eligible: ['E','H','I','J','K'], winnerGroup: 'L' },
    { slot: 't81', eligible: ['B','E','F','I','J'], winnerGroup: 'D' },
    { slot: 't82', eligible: ['A','E','H','I','J'], winnerGroup: 'G' },
    { slot: 't83', eligible: ['D','G','H','J','L'], winnerGroup: 'K' },
    { slot: 't85', eligible: ['E','F','G','I','J'], winnerGroup: 'B' },
    { slot: 't86', eligible: ['A','B','C','D','K'], winnerGroup: 'J' },
    { slot: 't87', eligible: ['D','E','I','J','L'], winnerGroup: 'K' },
  ]
  const isEligible = (team, slot) =>
    slot.eligible.includes(teamToGroup[team]) && teamToGroup[team] !== slot.winnerGroup
  const teamMatch = {}
  const findSlotById = id => slots.find(s => s.slot === id)
  function augment(slot, visited) {
    for (const team of thirdPlaceAdvancing) {
      if (visited.has(team)) continue
      if (!isEligible(team, slot)) continue
      visited.add(team)
      const cur = teamMatch[team]
      if (!cur || augment(findSlotById(cur), visited)) { teamMatch[team] = slot.slot; return true }
    }
    return false
  }
  for (const slot of slots) augment(slot, new Set())
  const assigned = {}
  Object.keys(teamMatch).forEach(team => { assigned[teamMatch[team]] = team })
  return assigned
}

// ── getR32Matches ──
// LEFT  (0-7):  M74,M77,M73,M75,M83,M84,M81,M82
// RIGHT (8-15): M76,M78,M79,M80,M86,M88,M85,M87
function getR32Matches(gp, thirdPlaceAdvancing) {
  const w = g => gp[g]?.[0] || '?'
  const r = g => gp[g]?.[1] || '?'
  const assignments = thirdPlaceAdvancing.length > 0 ? autoAssign3rdPlace(thirdPlaceAdvancing, gp) : {}
  const t = slot => assignments[slot] || '?'
  return [
    // LEFT (0-7)
    { id: 'r32_74', match: 74, team1: w('E'), team2: t('t74') },
    { id: 'r32_77', match: 77, team1: w('I'), team2: t('t77') },
    { id: 'r32_73', match: 73, team1: r('A'), team2: r('B')   },
    { id: 'r32_75', match: 75, team1: r('F'), team2: t('t75') },
    { id: 'r32_83', match: 83, team1: w('K'), team2: t('t83') },
    { id: 'r32_84', match: 84, team1: w('H'), team2: r('J')   },
    { id: 'r32_81', match: 81, team1: w('D'), team2: t('t81') },
    { id: 'r32_82', match: 82, team1: w('G'), team2: t('t82') },
    // RIGHT (8-15)
    { id: 'r32_76', match: 76, team1: w('C'), team2: r('F')   },
    { id: 'r32_78', match: 78, team1: r('E'), team2: r('I')   },
    { id: 'r32_79', match: 79, team1: w('A'), team2: t('t79') },
    { id: 'r32_80', match: 80, team1: w('L'), team2: t('t80') },
    { id: 'r32_86', match: 86, team1: w('J'), team2: t('t86') },
    { id: 'r32_88', match: 88, team1: r('D'), team2: r('G')   },
    { id: 'r32_85', match: 85, team1: w('B'), team2: t('t85') },
    { id: 'r32_87', match: 87, team1: r('K'), team2: t('t87') },
  ]
}

// ── getR16Matches ──
// LEFT:  M89=W74vsW77, M90=W73vsW75, M93=W83vsW84, M94=W81vsW82
// RIGHT: M91=W76vsW78, M92=W79vsW80, M95=W86vsW88, M96=W85vsW87
function getR16Matches(r32Preds) {
  const w = id => r32Preds[id] || '?'
  return [
    { id: 'r16_89', match: 'M89', team1: w('r32_74'), team2: w('r32_77') },
    { id: 'r16_90', match: 'M90', team1: w('r32_73'), team2: w('r32_75') },
    { id: 'r16_93', match: 'M93', team1: w('r32_83'), team2: w('r32_84') },
    { id: 'r16_94', match: 'M94', team1: w('r32_81'), team2: w('r32_82') },
    { id: 'r16_91', match: 'M91', team1: w('r32_76'), team2: w('r32_78') },
    { id: 'r16_92', match: 'M92', team1: w('r32_79'), team2: w('r32_80') },
    { id: 'r16_95', match: 'M95', team1: w('r32_86'), team2: w('r32_88') },
    { id: 'r16_96', match: 'M96', team1: w('r32_85'), team2: w('r32_87') },
  ]
}

// ── getQFMatches ──
// LEFT:  M97=W89vsW90, M98=W93vsW94
// RIGHT: M99=W91vsW92, M100=W95vsW96
function getQFMatches(r16Preds) {
  const w = id => r16Preds[id] || '?'
  return [
    { id: 'qf_97',  match: 'M97',  team1: w('r16_89'), team2: w('r16_90') },
    { id: 'qf_98',  match: 'M98',  team1: w('r16_93'), team2: w('r16_94') },
    { id: 'qf_99',  match: 'M99',  team1: w('r16_91'), team2: w('r16_92') },
    { id: 'qf_100', match: 'M100', team1: w('r16_95'), team2: w('r16_96') },
  ]
}

// ── getSFMatches ──
function getSFMatches(qfPreds) {
  const w = id => qfPreds[id] || '?'
  return [
    { id: 'sf_101', match: 'M101', team1: w('qf_97'),  team2: w('qf_98')  },
    { id: 'sf_102', match: 'M102', team1: w('qf_99'),  team2: w('qf_100') },
  ]
}

function getFinalTeams(sfPreds) {
  return ['sf_101', 'sf_102'].map(id => sfPreds[id]).filter(Boolean)
}

// ── SECOND CHANCE ──
// Backend returns matchups sorted by match number (M73, M74, ... M88).
// We reorder them into bracket visual order to match the official fixture.
// Then wire R16 based on official bracket pairings.

function reorderSCMatchups(matchups) {
  // matchups from backend: sorted by match field (73,74,...,88)
  // find by match number
  const byNum = {}
  matchups.forEach(m => { byNum[m.match] = m })
  // LEFT (0-7):  M74,M77,M73,M75,M83,M84,M81,M82
  // RIGHT (8-15): M76,M78,M79,M80,M86,M88,M85,M87
  const order = [74,77,73,75,83,84,81,82, 76,78,79,80,86,88,85,87]
  return order.map(n => byNum[n]).filter(Boolean)
}

// R16 pairings based on official bracket:
// M89: W74 vs W77, M90: W73 vs W75, M93: W83 vs W84, M94: W81 vs W82 (LEFT)
// M91: W76 vs W78, M92: W79 vs W80, M95: W86 vs W88, M96: W85 vs W87 (RIGHT)
function getSCR16(r32Preds, matchups) {
  // find the sc id for each match number
  const idByNum = {}
  matchups.forEach(m => { idByNum[m.match] = m.id })
  const w = num => r32Preds[idByNum[num]] || '?'
  return [
    // LEFT R16 (index 0-3)
    { id: 'sc_r16_89', match: 'M89', team1: w(74), team2: w(77) },
    { id: 'sc_r16_90', match: 'M90', team1: w(73), team2: w(75) },
    { id: 'sc_r16_93', match: 'M93', team1: w(83), team2: w(84) },
    { id: 'sc_r16_94', match: 'M94', team1: w(81), team2: w(82) },
    // RIGHT R16 (index 4-7)
    { id: 'sc_r16_91', match: 'M91', team1: w(76), team2: w(78) },
    { id: 'sc_r16_92', match: 'M92', team1: w(79), team2: w(80) },
    { id: 'sc_r16_95', match: 'M95', team1: w(86), team2: w(88) },
    { id: 'sc_r16_96', match: 'M96', team1: w(85), team2: w(87) },
  ]
}

function getSCQF(r16Preds) {
  const w = id => r16Preds[id] || '?'
  return [
    { id: 'sc_qf_97',  match: 'QF-1', team1: w('sc_r16_89'), team2: w('sc_r16_90') },
    { id: 'sc_qf_98',  match: 'QF-2', team1: w('sc_r16_93'), team2: w('sc_r16_94') },
    { id: 'sc_qf_99',  match: 'QF-3', team1: w('sc_r16_91'), team2: w('sc_r16_92') },
    { id: 'sc_qf_100', match: 'QF-4', team1: w('sc_r16_95'), team2: w('sc_r16_96') },
  ]
}

function getSCSF(qfPreds) {
  const w = id => qfPreds[id] || '?'
  return [
    { id: 'sc_sf_101', match: 'SF-1', team1: w('sc_qf_97'),  team2: w('sc_qf_98')  },
    { id: 'sc_sf_102', match: 'SF-2', team1: w('sc_qf_99'),  team2: w('sc_qf_100') },
  ]
}

function getSCFinalTeams(sfPreds) {
  return ['sc_sf_101', 'sc_sf_102'].map(id => sfPreds[id]).filter(Boolean)
}

function SCMatchCard({ match, prediction, onPick, locked }) {
  return (
    <div style={{ background: '#0f1729', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden', width: CARD_W }}>
      <div style={{ background: 'rgba(255,255,255,0.04)', padding: '2px 6px', fontSize: 8, fontWeight: 700, color: '#64748b', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {typeof match.match === 'number' ? `M${match.match}` : match.match}
      </div>
      {[match.team1, match.team2].map((team, i) => {
        const sel = prediction === team
        const tbd = !team || team === '?'
        return (
          <div key={i}>
            {i === 1 && <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />}
            <button onClick={() => !tbd && !locked && onPick(match.id, team)} disabled={tbd || locked}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 6px', background: sel ? 'rgba(6,182,212,0.15)' : 'transparent', borderLeft: `2px solid ${sel ? '#06b6d4' : 'transparent'}`, border: 'none', cursor: tbd || locked ? 'default' : 'pointer', opacity: tbd ? 0.3 : 1 }}>
              {!tbd && <img src={`https://flagcdn.com/w40/${FLAGS[team] || 'un'}.png`} alt={team} style={{ width: 16, height: 11, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />}
              <span style={{ flex: 1, fontSize: 9, fontWeight: 700, color: sel ? '#06b6d4' : tbd ? '#475569' : '#e2e8f0', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tbd ? 'TBD' : team}</span>
              {sel && <span style={{ color: '#06b6d4', fontSize: 8 }}>✓</span>}
            </button>
          </div>
        )
      })}
    </div>
  )
}

function SCBracketCol({ title, matches, predictions, onPick, totalH, locked }) {
  const n = matches.length
  const slotH = totalH / n
  return (
    <div style={{ flexShrink: 0, width: CARD_W }}>
      <div style={{ fontSize: 8, fontWeight: 800, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', marginBottom: 6 }}>{title}</div>
      <div style={{ position: 'relative', height: totalH }}>
        {matches.map((match, i) => {
          const top = i * slotH + (slotH - CARD_H) / 2
          return (
            <div key={match.id} style={{ position: 'absolute', top, left: 0 }}>
              <SCMatchCard match={match} prediction={predictions[match.id]} onPick={onPick} locked={locked} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SecondChanceBracket({ r32Matchups, scPreds, setScPreds, locked }) {
  const N = 8
  const totalH = N * CARD_H + (N - 1) * 8

  const r32 = scPreds.r32 || {}
  const r16 = scPreds.r16 || {}
  const qf  = scPreds.quarter || {}
  const sf  = scPreds.semi || {}

  // Reorder backend matchups into bracket visual order
  const ordered = reorderSCMatchups(r32Matchups)
  const leftR32  = ordered.slice(0, 8)
  const rightR32 = ordered.slice(8, 16)

  // Wire R16 using official bracket pairings (by match number)
  const r16Matches = getSCR16(r32, r32Matchups)
  const qfMatches  = getSCQF(r16)
  const sfMatches  = getSCSF(qf)
  const finalTeams = getSCFinalTeams(sf)

  const setR32 = (id, team) => !locked && setScPreds(p => ({ ...p, r32: { ...p.r32, [id]: team } }))
  const setR16 = (id, team) => !locked && setScPreds(p => ({ ...p, r16: { ...p.r16, [id]: team } }))
  const setQF  = (id, team) => !locked && setScPreds(p => ({ ...p, quarter: { ...p.quarter, [id]: team } }))
  const setSF  = (id, team) => !locked && setScPreds(p => ({ ...p, semi: { ...p.semi, [id]: team } }))

  return (
    <div style={{ overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none' }}>
      <div style={{ display: 'flex', gap: COL_GAP, alignItems: 'flex-start', paddingBottom: 8 }}>
        <SCBracketCol title="Round of 32"   matches={leftR32}            predictions={r32} onPick={setR32} totalH={totalH} locked={locked} />
        <SCBracketCol title="Round of 16"   matches={r16Matches.slice(0,4)} predictions={r16} onPick={setR16} totalH={totalH} locked={locked} />
        <SCBracketCol title="Quarter Finals" matches={qfMatches.slice(0,2)} predictions={qf}  onPick={setQF}  totalH={totalH} locked={locked} />
        <SCBracketCol title="Semi Finals"   matches={sfMatches.slice(0,1)} predictions={sf}  onPick={setSF}  totalH={totalH} locked={locked} />

        {/* Centre */}
        <div style={{ flexShrink: 0, width: CARD_W + 20, height: totalH + 28, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontSize: 8, fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', marginBottom: 4 }}>🏆 Final</div>
            <div style={{ background: '#0f1729', border: '2px solid #fbbf24', borderRadius: 6, overflow: 'hidden', width: CARD_W + 20 }}>
              <div style={{ background: 'rgba(251,191,36,0.1)', padding: '2px 6px', fontSize: 8, fontWeight: 800, color: '#fbbf24', textAlign: 'center' }}>CHAMPION</div>
              {finalTeams.length === 2 ? finalTeams.map(team => (
                <button key={team} onClick={() => !locked && setScPreds(p => ({ ...p, final: team }))} disabled={locked}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 4, padding: '5px 6px', background: scPreds.final === team ? 'rgba(251,191,36,0.15)' : 'transparent', borderLeft: `2px solid ${scPreds.final === team ? '#fbbf24' : 'transparent'}`, border: 'none', cursor: locked ? 'default' : 'pointer' }}>
                  <img src={`https://flagcdn.com/w40/${FLAGS[team] || 'un'}.png`} alt={team} style={{ width: 16, height: 11, objectFit: 'cover', borderRadius: 1 }} onError={e => { e.target.style.display = 'none' }} />
                  <span style={{ flex: 1, fontSize: 9, fontWeight: 700, color: scPreds.final === team ? '#fbbf24' : '#e2e8f0', textAlign: 'left' }}>{team}</span>
                  {scPreds.final === team && <span style={{ color: '#fbbf24', fontSize: 9 }}>🏆</span>}
                </button>
              )) : <p style={{ color: '#475569', fontSize: 9, textAlign: 'center', padding: '8px', fontStyle: 'italic', margin: 0 }}>Complete Semis</p>}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 8, fontWeight: 800, color: '#fb923c', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', marginBottom: 4 }}>🥉 3rd Place</div>
            <div style={{ background: '#0f1729', border: '1px solid rgba(251,146,60,0.4)', borderRadius: 6, overflow: 'hidden', width: CARD_W + 20 }}>
              <div style={{ background: 'rgba(251,146,60,0.08)', padding: '2px 6px', fontSize: 8, fontWeight: 800, color: '#fb923c', textAlign: 'center' }}>BRONZE</div>
              {sfMatches.every(m => sf[m.id]) ? sfMatches.map(sfMatch => {
                const winner = sf[sfMatch.id]
                const loser = winner === sfMatch.team1 ? sfMatch.team2 : sfMatch.team1
                if (!loser || loser === '?') return null
                return (
                  <button key={sfMatch.id} onClick={() => !locked && setScPreds(p => ({ ...p, third_place: loser }))} disabled={locked}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 4, padding: '5px 6px', background: scPreds.third_place === loser ? 'rgba(251,146,60,0.15)' : 'transparent', borderLeft: `2px solid ${scPreds.third_place === loser ? '#fb923c' : 'transparent'}`, border: 'none', cursor: locked ? 'default' : 'pointer' }}>
                    <img src={`https://flagcdn.com/w40/${FLAGS[loser] || 'un'}.png`} alt={loser} style={{ width: 16, height: 11, objectFit: 'cover', borderRadius: 1 }} onError={e => { e.target.style.display = 'none' }} />
                    <span style={{ flex: 1, fontSize: 9, fontWeight: 700, color: scPreds.third_place === loser ? '#fb923c' : '#e2e8f0', textAlign: 'left' }}>{loser}</span>
                    {scPreds.third_place === loser && <span style={{ color: '#fb923c', fontSize: 9 }}>🥉</span>}
                  </button>
                )
              }) : <p style={{ color: '#475569', fontSize: 9, textAlign: 'center', padding: '8px', fontStyle: 'italic', margin: 0 }}>Complete Semis</p>}
            </div>
          </div>
        </div>

        <SCBracketCol title="Semi Finals"    matches={sfMatches.slice(1,2)}   predictions={sf}  onPick={setSF}  totalH={totalH} locked={locked} />
        <SCBracketCol title="Quarter Finals" matches={qfMatches.slice(2,4)}   predictions={qf}  onPick={setQF}  totalH={totalH} locked={locked} />
        <SCBracketCol title="Round of 16"    matches={r16Matches.slice(4,8)}  predictions={r16} onPick={setR16} totalH={totalH} locked={locked} />
        <SCBracketCol title="Round of 32"    matches={rightR32}               predictions={r32} onPick={setR32} totalH={totalH} locked={locked} />
      </div>
    </div>
  )
}

function SecondChanceTab({ token }) {
  const [r32Matchups, setR32Matchups] = useState([])
  const [scPreds, setScPreds] = useState({ r32: {}, r16: {}, quarter: {}, semi: {}, third_place: '', final: '' })
  const [locked, setLocked] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const lockTime = new Date('2026-06-29T20:30:00Z')
  const isLocked = locked || new Date() >= lockTime

  useEffect(() => {
    axios.get(`${API_URL}/api/second-chance/matchups`)
      .then(res => setR32Matchups(res.data))
      .catch(() => {})
  }, [])

  axios.get(`${API_URL}/api/second-chance/matchups`)
  .then(res => setR32Matchups(res.data))
  .catch(() => {})

  useEffect(() => {
    if (!token) return
    axios.get(`${API_URL}/api/second-chance`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (res.data.saved) {
          const kp = res.data.knockout_predictions || {}
          setScPreds({ r32: kp.r32 || {}, r16: kp.r16 || {}, quarter: kp.quarter || {}, semi: kp.semi || {}, third_place: kp.third_place || '', final: kp.final || '' })
          if (res.data.locked) setLocked(true)
        }
        setLoaded(true)
      }).catch(() => setLoaded(true))
  }, [token])

  const saveSecondChance = async (submit = false) => {
    if (!token) { toast.error('Please login first!'); return }
    if (isLocked) { toast.error('Second Chance is locked!'); return }
    setSaving(true)
    try {
      await axios.post(`${API_URL}/api/second-chance`, { knockout_predictions: scPreds, submit }, { headers: { Authorization: `Bearer ${token}` } })
      if (submit) { setLocked(true); toast.success('Second Chance locked! 🔒') }
      else toast.success('Saved! ✅')
    } catch (err) { toast.error(err.response?.data?.error || 'Error saving') }
    setSaving(false)
  }

  if (!token) return <div style={{ textAlign: 'center', padding: '80px 20px' }}><p style={{ color: '#64748b', fontWeight: 700, fontSize: 16 }}>Login to make Second Chance predictions</p></div>
  if (!loaded) return <div style={{ textAlign: 'center', padding: '80px 20px' }}><p style={{ color: '#06b6d4', fontWeight: 700, fontSize: 16 }}>Loading...</p></div>

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(6,182,212,0.04))', border: '1px solid rgba(6,182,212,0.25)', borderRadius: 14, padding: '18px 20px', marginBottom: 20, borderTop: '3px solid #06b6d4', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h2 style={{ fontWeight: 900, fontSize: 20, color: '#67e8f9', margin: 0, fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.05em' }}>🔄 SECOND CHANCE</h2>
            {isLocked && <span style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 100 }}>🔒 Locked</span>}
            {!isLocked && <span style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 100, animation: 'pulse 2s infinite' }}>🟢 OPEN</span>}
          </div>
          <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>Fresh bracket prediction for the knockout stage. Locks before the first R32 match!</p>
          <p style={{ color: '#334155', fontSize: 11, margin: '6px 0 0' }}>Points: R32=3pts · R16=6pts · QF=9pts · SF=12pts · Final=15pts</p>
        </div>
        <div style={{ fontSize: 11, color: '#334155', textAlign: 'right' }}>Locks: June 28 · 18:50 UTC</div>
      </div>

      {isLocked && (
        <div style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>🔒</span>
          <div>
            <p style={{ fontWeight: 700, color: '#fbbf24', margin: 0, fontSize: 14 }}>Second Chance Locked</p>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: 13, marginTop: 2 }}>The knockout stage has begun! Your predictions are saved.</p>
          </div>
        </div>
      )}

      {r32Matchups.length > 0 && (
        <SecondChanceBracket r32Matchups={r32Matchups} scPreds={scPreds} setScPreds={setScPreds} locked={isLocked} />
      )}

      {!isLocked && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 24 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => saveSecondChance(false)} disabled={saving} style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)', color: '#06b6d4', fontWeight: 700, fontSize: 14, padding: '12px 28px', borderRadius: 100, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving...' : '💾 Save Progress'}</button>
            <button onClick={() => saveSecondChance(true)} disabled={saving} style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)', color: '#fff', fontWeight: 800, fontSize: 14, padding: '12px 28px', borderRadius: 100, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(6,182,212,0.3)', opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving...' : '🔒 Submit & Lock Second Chance'}</button>
          </div>
          <p style={{ color: '#475569', fontSize: 12 }}>Once submitted, Second Chance predictions cannot be changed</p>
        </div>
      )}
    </div>
  )
}

// ── MATCH PICKS ──
function MatchPicks({ token }) {
  const [schedule, setSchedule] = useState([])
  const [matchPreds, setMatchPreds] = useState({})
  const [savedPreds, setSavedPreds] = useState({})
  const [saving, setSaving] = useState(null)
  const [activeDate, setActiveDate] = useState('')
  const [now, setNow] = useState(new Date())

  function toLocalDate(kickoff_utc) { return new Date(kickoff_utc).toLocaleDateString('en-CA') }

  useEffect(() => { const iv = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(iv) }, [])

  useEffect(() => {
    axios.get(`${API_URL}/api/matches`).then(res => {
      const wc = res.data.filter(m => m.kickoff_utc && m.kickoff_utc.startsWith('2026'))
      setSchedule(wc)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (schedule.length === 0) return
    const allDates = [...new Set(schedule.map(m => toLocalDate(m.kickoff_utc)))].sort()
    const defaultDate = allDates.find(d => {
      const dayMatches = schedule.filter(m => toLocalDate(m.kickoff_utc) === d)
      return dayMatches.some(m => {
        if (!m.kickoff_utc) return true
        const lockTime = new Date(new Date(m.kickoff_utc).getTime() - 10 * 60 * 1000)
        return new Date() < lockTime
      })
    }) || allDates[allDates.length - 1]
    setActiveDate(defaultDate)
  }, [schedule])

  useEffect(() => {
    if (!token) return
    axios.get(`${API_URL}/api/match-predictions`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const saved = {}; const inputs = {}
        res.data.forEach(p => { saved[p.match_id] = p; inputs[p.match_id] = { home: String(p.home_score), away: String(p.away_score) } })
        setSavedPreds(saved); setMatchPreds(inputs)
      }).catch(() => {})
  }, [token])


  

  const isMatchLocked = (match) => { if (!match.kickoff_utc) return false; return now >= new Date(new Date(match.kickoff_utc).getTime() - 10 * 60 * 1000) }
  const getTimeLeft = (match) => {
    if (!match.kickoff_utc) return ''
    const diff = new Date(new Date(match.kickoff_utc).getTime() - 10 * 60 * 1000) - now
    if (diff <= 0) return ''
    const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000)
    return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`
  }

  const savePick = async (matchId) => {
    if (!token) { toast.error('Please login first!'); return }
    const match = schedule.find(m => m.id === matchId)
    if (match && isMatchLocked(match)) { toast.error('This match is locked!'); return }
    const pick = matchPreds[matchId]
    if (!pick || pick.home === '' || pick.away === '') { toast.error('Enter both scores!'); return }
    const homeScore = parseInt(pick.home), awayScore = parseInt(pick.away)
    if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) { toast.error('Enter valid scores!'); return }
    const isDraw = homeScore === awayScore
    const isKnockout = match?.round === 'Round of 32' || match?.id >= 73
    if (isDraw && isKnockout && !pick.pen_winner) { toast.error('Please pick a penalty winner!'); return }
    setSaving(matchId)
    try {
      await axios.post(`${API_URL}/api/match-predictions`, {
        match_id: matchId,
        home_score: homeScore,
        away_score: awayScore,
        pen_winner: (isDraw && isKnockout) ? (pick.pen_winner || '') : '',
      }, { headers: { Authorization: `Bearer ${token}` } })
      setSavedPreds(prev => ({ ...prev, [matchId]: { home_score: homeScore, away_score: awayScore, pen_winner: pick.pen_winner || '', scored: false, points_awarded: 0 } }))
      toast.success('Pick saved! ✅')
    } catch (err) { toast.error(err.response?.data?.error || 'Error saving pick') }
    setSaving(null)
}
  const groupColor = (group) => { const idx = GROUP_LETTERS.indexOf(group); return idx >= 0 ? GROUP_COLORS[idx] : '#3b82f6' }

  if (!token) return <div style={{ textAlign: 'center', padding: '80px 20px' }}><p style={{ color: '#64748b', fontWeight: 700, fontSize: 16 }}>Login to make match predictions</p></div>

  const allDates = [...new Set(schedule.map(m => toLocalDate(m.kickoff_utc)))].sort()
  const todayMatches = schedule.filter(m => toLocalDate(m.kickoff_utc) === activeDate)
  const allLocked = todayMatches.length > 0 && todayMatches.every(m => isMatchLocked(m))
  const nextLock = todayMatches.filter(m => !isMatchLocked(m) && m.kickoff_utc).map(m => new Date(new Date(m.kickoff_utc).getTime() - 10 * 60 * 1000)).sort((a, b) => a - b)[0]
  const timeLeft = nextLock ? (() => { const diff = nextLock - now; if (diff <= 0) return ''; const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000); return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s` })() : ''

  if (schedule.length === 0) return <div style={{ textAlign: 'center', padding: '80px 20px' }}><p style={{ color: '#64748b', fontWeight: 700, fontSize: 16 }}>Loading matches...</p></div>
  if (todayMatches.length === 0) return <div style={{ textAlign: 'center', padding: '80px 20px' }}><p style={{ color: '#64748b', fontWeight: 700, fontSize: 16 }}>No matches for this day!</p></div>

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {allDates.map(d => {
          const dayMatches = schedule.filter(m => toLocalDate(m.kickoff_utc) === d)
          const dayAllLocked = dayMatches.every(m => isMatchLocked(m))
          const isR32Day = dayMatches.some(m => m.round === 'Round of 32')
          return (
            <button key={d} onClick={() => setActiveDate(d)} style={{ padding: '5px 12px', borderRadius: 8, fontWeight: 700, fontSize: 11, cursor: 'pointer', border: isR32Day ? '1px solid rgba(6,182,212,0.3)' : 'none', transition: 'all 0.15s', background: activeDate === d ? (isR32Day ? '#06b6d4' : '#3b82f6') : 'rgba(255,255,255,0.05)', color: activeDate === d ? '#fff' : dayAllLocked ? '#334155' : '#94a3b8', textDecoration: dayAllLocked ? 'line-through' : 'none' }}>
              {new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {isR32Day && <span style={{ marginLeft: 4, fontSize: 8, opacity: 0.8 }}>R32</span>}
            </button>
          )
        })}
      </div>
      <div style={{ background: '#0d1526', border: `1px solid rgba(${todayMatches[0]?.round === 'Round of 32' ? '6,182,212' : '59,130,246'},0.2)`, borderRadius: 14, padding: '16px 20px', marginBottom: 24, borderTop: `3px solid ${todayMatches[0]?.round === 'Round of 32' ? '#06b6d4' : '#3b82f6'}`, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 18, color: todayMatches[0]?.round === 'Round of 32' ? '#67e8f9' : '#93c5fd', margin: '0 0 4px' }}>{todayMatches[0]?.round === 'Round of 32' ? '⚔️ Round of 32 Match Picks' : 'Match Picks'}</h2>
          <p style={{ color: '#ffffff', fontSize: 13, margin: 0 }}>{new Date(activeDate + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · {todayMatches.length} matches</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          {allLocked ? <span style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 100 }}>All Matches Locked</span>
            : <><span style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 100 }}>Open for picks</span>{timeLeft && <span style={{ color: '#ffffff', fontSize: 11 }}>Next lock in {timeLeft}</span>}</>}
          <span style={{ color: '#ffffff', fontSize: 11 }}>2pts result · +4pts exact score</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {todayMatches.map(match => {
          const isR32 = match.round === 'Round of 32'
          const gc = isR32 ? '#06b6d4' : groupColor(match.group)
          const saved = savedPreds[match.id]; const pick = matchPreds[match.id] || { home: '', away: '' }
          const isSaving = saving === match.id; const hasSaved = !!saved
          const matchLocked = isMatchLocked(match); const timeLeftMatch = getTimeLeft(match)
          return (
            <motion.div key={match.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: '#0d1526', border: `1px solid ${hasSaved ? gc + '30' : 'rgba(255,255,255,0.06)'}`, borderTop: `3px solid ${matchLocked ? '#334155' : gc}`, borderRadius: 14, padding: '16px 18px', opacity: matchLocked ? 0.7 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: matchLocked ? '#334155' : gc, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{isR32 ? `⚔️ R32 · Match ${match.id}` : `Group ${match.group} · Match ${match.id}`}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {matchLocked ? <span style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100 }}>🔒 Locked</span>
                    : timeLeftMatch ? <span style={{ color: '#f59e0b', fontSize: 10, fontWeight: 600 }}>Locks in {timeLeftMatch}</span> : null}
                  <span style={{ fontSize: 11, color: '#334155', fontWeight: 600 }}>{new Date(match.kickoff_utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <img src={`https://flagcdn.com/w80/${FLAGS[match.home] || 'un'}.png`} alt={match.home} style={{ width: 44, height: 30, objectFit: 'cover', borderRadius: 4 }} onError={e => { e.target.style.display = 'none' }} />
                  <span style={{ fontWeight: 700, fontSize: 12, color: '#e2e8f0', textAlign: 'center' }}>{match.home}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <input type="number" min="0" max="20" value={pick.home} onChange={e => !matchLocked && setMatchPreds(prev => ({ ...prev, [match.id]: { ...pick, home: e.target.value } }))} disabled={matchLocked} placeholder="0" style={{ width: 48, height: 48, textAlign: 'center', background: matchLocked ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)', border: `2px solid ${hasSaved ? gc + '50' : 'rgba(255,255,255,0.1)'}`, color: '#f1f5f9', fontSize: 22, fontWeight: 900, borderRadius: 10, outline: 'none', cursor: matchLocked ? 'not-allowed' : 'text', MozAppearance: 'textfield', WebkitAppearance: 'none', appearance: 'none' }} />
                  <span style={{ color: '#334155', fontWeight: 900, fontSize: 18 }}>–</span>
                  <input type="number" min="0" max="20" value={pick.away} onChange={e => !matchLocked && setMatchPreds(prev => ({ ...prev, [match.id]: { ...pick, away: e.target.value } }))} disabled={matchLocked} placeholder="0" style={{ width: 48, height: 48, textAlign: 'center', background: matchLocked ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)', border: `2px solid ${hasSaved ? gc + '50' : 'rgba(255,255,255,0.1)'}`, color: '#f1f5f9', fontSize: 22, fontWeight: 900, borderRadius: 10, outline: 'none', cursor: matchLocked ? 'not-allowed' : 'text' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <img src={`https://flagcdn.com/w80/${FLAGS[match.away] || 'un'}.png`} alt={match.away} style={{ width: 44, height: 30, objectFit: 'cover', borderRadius: 4 }} onError={e => { e.target.style.display = 'none' }} />
                  <span style={{ fontWeight: 700, fontSize: 12, color: '#e2e8f0', textAlign: 'center' }}>{match.away}</span>
                </div>
              </div>
              {/* PENALTY DROPDOWN */}
{(() => {
  const pick = matchPreds[match.id] || { home: '', away: '' }
  const isDraw = pick.home !== '' && pick.away !== '' && parseInt(pick.home) === parseInt(pick.away)
  const isKnockout = match.round === 'Round of 32' || match.id >= 73
  if (!isDraw || !isKnockout) return null
  return (
    <div style={{ marginTop: 12, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 10, padding: '10px 14px' }}>
      <p style={{ color: '#fbbf24', fontSize: 11, fontWeight: 700, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>⚽ Who wins on penalties?</p>
      <div style={{ display: 'flex', gap: 8 }}>
        {[match.home, match.away].map(team => {
          const selected = pick.pen_winner === team
          return (
            <button key={team} onClick={() => !matchLocked && setMatchPreds(prev => ({ ...prev, [match.id]: { ...prev[match.id], pen_winner: team } }))}
              disabled={matchLocked}
              style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderRadius: 8, border: `2px solid ${selected ? '#fbbf24' : 'rgba(255,255,255,0.08)'}`, background: selected ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.03)', cursor: matchLocked ? 'default' : 'pointer', transition: 'all 0.15s' }}>
              <img src={`https://flagcdn.com/w40/${FLAGS[team] || 'un'}.png`} alt={team} style={{ width: 20, height: 14, objectFit: 'cover', borderRadius: 2 }} onError={e => { e.target.style.display = 'none' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: selected ? '#fbbf24' : '#94a3b8', flex: 1, textAlign: 'left' }}>{team}</span>
              {selected && <span style={{ fontSize: 10, color: '#fbbf24' }}>✓</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
})()}

<div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}></div>
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {saved?.scored ? <span style={{ background: saved.points_awarded > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${saved.points_awarded > 0 ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`, color: saved.points_awarded > 0 ? '#22c55e' : '#475569', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 100 }}>{saved.points_awarded > 0 ? `+${saved.points_awarded} pts ✓` : '0 pts'}</span>
                  : hasSaved ? <span style={{ fontSize: 11, color: '#475569' }}>Saved: {saved.home_score}–{saved.away_score}</span> : <span />}
                {!matchLocked && <button onClick={() => savePick(match.id)} disabled={isSaving} style={{ background: hasSaved ? `${gc}15` : 'linear-gradient(135deg, #3b82f6, #1d4ed8)', border: hasSaved ? `1px solid ${gc}40` : 'none', color: hasSaved ? gc : '#fff', fontWeight: 700, fontSize: 13, padding: '7px 18px', borderRadius: 8, cursor: 'pointer', opacity: isSaving ? 0.6 : 1 }}>{isSaving ? 'Saving...' : hasSaved ? '✓ Update Pick' : 'Save Pick'}</button>}
              </div>

              
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ── SORTABLE TEAM ──
function SortableTeam({ team, index, total, onMove, disabled }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: team })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, zIndex: isDragging ? 50 : 'auto' }
  const pos = POSITION_CONFIG[index]
  return (
    <div ref={setNodeRef} style={style} {...attributes} className="flex items-center gap-3 bg-gray-700 hover:bg-gray-600 rounded-lg px-3 py-2.5 transition">
      <span style={{ width: 28, height: 28, borderRadius: '50%', background: pos.bg, color: pos.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{pos.label}</span>
      <img src={`https://flagcdn.com/w40/${FLAGS[team] || 'un'}.png`} alt={team} className="w-8 h-5 object-cover rounded-sm flex-shrink-0" onError={e => { e.target.style.display = 'none' }} />
      <span className="flex-1 font-medium text-white text-sm">{team}</span>
      {!disabled && <div className="flex flex-col gap-0.5 sm:hidden"><button onClick={() => onMove(index, index - 1)} disabled={index === 0} className="w-6 h-5 flex items-center justify-center rounded text-gray-400 hover:text-white hover:bg-gray-500 disabled:opacity-20 transition text-xs">▲</button><button onClick={() => onMove(index, index + 1)} disabled={index === total - 1} className="w-6 h-5 flex items-center justify-center rounded text-gray-400 hover:text-white hover:bg-gray-500 disabled:opacity-20 transition text-xs">▼</button></div>}
      {!disabled && <span {...listeners} className="text-gray-500 text-lg select-none cursor-grab hidden sm:block">⠿</span>}
      {disabled && <span className="text-gray-600 text-lg hidden sm:block">⠿</span>}
    </div>
  )
}

// ── KNOCKOUT BRACKET ──
function MatchCard({ match, prediction, onPick, locked }) {
  return (
    <div style={{ background: '#0f1729', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden', width: CARD_W }}>
      <div style={{ background: 'rgba(255,255,255,0.04)', padding: '2px 6px', fontSize: 8, fontWeight: 700, color: '#64748b', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {typeof match.match === 'number' ? `M${match.match}` : match.match}
      </div>
      {[match.team1, match.team2].map((team, i) => {
        const sel = prediction === team; const tbd = !team || team === '?'
        return (
          <div key={i}>
            {i === 1 && <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />}
            <button onClick={() => !tbd && !locked && onPick(match.id, team)} disabled={tbd || locked}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 6px', background: sel ? 'rgba(34,197,94,0.15)' : 'transparent', borderLeft: `2px solid ${sel ? '#22c55e' : 'transparent'}`, border: 'none', cursor: tbd || locked ? 'default' : 'pointer', opacity: tbd ? 0.3 : 1 }}>
              {!tbd && <img src={`https://flagcdn.com/w40/${FLAGS[team] || 'un'}.png`} alt={team} style={{ width: 16, height: 11, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />}
              <span style={{ flex: 1, fontSize: 9, fontWeight: 700, color: sel ? '#22c55e' : tbd ? '#475569' : '#e2e8f0', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tbd ? 'TBD' : team}</span>
              {sel && <span style={{ color: '#22c55e', fontSize: 8 }}>✓</span>}
            </button>
          </div>
        )
      })}
    </div>
  )
}

function BracketCol({ title, matches, predictions, onPick, totalH, locked }) {
  const n = matches.length; const slotH = totalH / n
  return (
    <div style={{ flexShrink: 0, width: CARD_W }}>
      <div style={{ fontSize: 8, fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', marginBottom: 6 }}>{title}</div>
      <div style={{ position: 'relative', height: totalH }}>
        {matches.map((match, i) => {
          const top = i * slotH + (slotH - CARD_H) / 2
          return <div key={match.id} style={{ position: 'absolute', top, left: 0 }}><MatchCard match={match} prediction={predictions[match.id]} onPick={onPick} locked={locked} /></div>
        })}
      </div>
    </div>
  )
}

function KnockoutBracket({ r32Matches, r16Matches, qfMatches, sfMatches, finalTeams, knockoutPredictions, setKnockoutPredictions, locked }) {
  const N = 8; const totalH = N * CARD_H + (N - 1) * 8
  const setR32 = (id, team) => !locked && setKnockoutPredictions(p => ({ ...p, r32: { ...p.r32, [id]: team } }))
  const setR16 = (id, team) => !locked && setKnockoutPredictions(p => ({ ...p, r16: { ...p.r16, [id]: team } }))
  const setQF  = (id, team) => !locked && setKnockoutPredictions(p => ({ ...p, quarter: { ...p.quarter, [id]: team } }))
  const setSF  = (id, team) => !locked && setKnockoutPredictions(p => ({ ...p, semi: { ...p.semi, [id]: team } }))
  return (
    <div style={{ overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none' }}>
      <div style={{ display: 'flex', gap: COL_GAP, alignItems: 'flex-start', paddingBottom: 8 }}>
        <BracketCol title="Round of 32"    matches={r32Matches.slice(0,8)}  predictions={knockoutPredictions.r32}     onPick={setR32} totalH={totalH} locked={locked} />
        <BracketCol title="Round of 16"    matches={r16Matches.slice(0,4)}  predictions={knockoutPredictions.r16}     onPick={setR16} totalH={totalH} locked={locked} />
        <BracketCol title="Quarter Finals" matches={qfMatches.slice(0,2)}   predictions={knockoutPredictions.quarter} onPick={setQF}  totalH={totalH} locked={locked} />
        <BracketCol title="Semi Finals"    matches={sfMatches.slice(0,1)}   predictions={knockoutPredictions.semi}    onPick={setSF}  totalH={totalH} locked={locked} />
        <div style={{ flexShrink: 0, width: CARD_W + 20, height: totalH + 28, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontSize: 8, fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', marginBottom: 4 }}>🏆 Final</div>
            <div style={{ background: '#0f1729', border: '2px solid #fbbf24', borderRadius: 6, overflow: 'hidden', width: CARD_W + 20 }}>
              <div style={{ background: 'rgba(251,191,36,0.1)', padding: '2px 6px', fontSize: 8, fontWeight: 800, color: '#fbbf24', textAlign: 'center' }}>CHAMPION</div>
              {finalTeams.length === 2 ? finalTeams.map(team => (
                <button key={team} onClick={() => !locked && setKnockoutPredictions(p => ({ ...p, final: team }))} disabled={locked}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 4, padding: '5px 6px', background: knockoutPredictions.final === team ? 'rgba(251,191,36,0.15)' : 'transparent', borderLeft: `2px solid ${knockoutPredictions.final === team ? '#fbbf24' : 'transparent'}`, border: 'none', cursor: locked ? 'default' : 'pointer' }}>
                  <img src={`https://flagcdn.com/w40/${FLAGS[team] || 'un'}.png`} alt={team} style={{ width: 16, height: 11, objectFit: 'cover', borderRadius: 1 }} onError={e => { e.target.style.display = 'none' }} />
                  <span style={{ flex: 1, fontSize: 9, fontWeight: 700, color: knockoutPredictions.final === team ? '#fbbf24' : '#e2e8f0', textAlign: 'left' }}>{team}</span>
                  {knockoutPredictions.final === team && <span style={{ color: '#fbbf24', fontSize: 9 }}>🏆</span>}
                </button>
              )) : <p style={{ color: '#475569', fontSize: 9, textAlign: 'center', padding: '8px', fontStyle: 'italic', margin: 0 }}>Complete Semis</p>}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 8, fontWeight: 800, color: '#fb923c', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', marginBottom: 4 }}>🥉 3rd Place</div>
            <div style={{ background: '#0f1729', border: '1px solid rgba(251,146,60,0.4)', borderRadius: 6, overflow: 'hidden', width: CARD_W + 20 }}>
              <div style={{ background: 'rgba(251,146,60,0.08)', padding: '2px 6px', fontSize: 8, fontWeight: 800, color: '#fb923c', textAlign: 'center' }}>BRONZE</div>
              {sfMatches.every(m => knockoutPredictions.semi[m.id]) ? sfMatches.map(sfMatch => {
                const winner = knockoutPredictions.semi[sfMatch.id]; const loser = winner === sfMatch.team1 ? sfMatch.team2 : sfMatch.team1
                if (!loser || loser === '?') return null
                return (
                  <button key={sfMatch.id} onClick={() => !locked && setKnockoutPredictions(p => ({ ...p, third_place: loser }))} disabled={locked}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 4, padding: '5px 6px', background: knockoutPredictions.third_place === loser ? 'rgba(251,146,60,0.15)' : 'transparent', borderLeft: `2px solid ${knockoutPredictions.third_place === loser ? '#fb923c' : 'transparent'}`, border: 'none', cursor: locked ? 'default' : 'pointer' }}>
                    <img src={`https://flagcdn.com/w40/${FLAGS[loser] || 'un'}.png`} alt={loser} style={{ width: 16, height: 11, objectFit: 'cover', borderRadius: 1 }} onError={e => { e.target.style.display = 'none' }} />
                    <span style={{ flex: 1, fontSize: 9, fontWeight: 700, color: knockoutPredictions.third_place === loser ? '#fb923c' : '#e2e8f0', textAlign: 'left' }}>{loser}</span>
                    {knockoutPredictions.third_place === loser && <span style={{ color: '#fb923c', fontSize: 9 }}>🥉</span>}
                  </button>
                )
              }) : <p style={{ color: '#475569', fontSize: 9, textAlign: 'center', padding: '8px', fontStyle: 'italic', margin: 0 }}>Complete Semis</p>}
            </div>
          </div>
        </div>
        <BracketCol title="Semi Finals"    matches={sfMatches.slice(1,2)}   predictions={knockoutPredictions.semi}    onPick={setSF}  totalH={totalH} locked={locked} />
        <BracketCol title="Quarter Finals" matches={qfMatches.slice(2,4)}   predictions={knockoutPredictions.quarter} onPick={setQF}  totalH={totalH} locked={locked} />
        <BracketCol title="Round of 16"    matches={r16Matches.slice(4,8)}  predictions={knockoutPredictions.r16}     onPick={setR16} totalH={totalH} locked={locked} />
        <BracketCol title="Round of 32"    matches={r32Matches.slice(8,16)} predictions={knockoutPredictions.r32}     onPick={setR32} totalH={totalH} locked={locked} />
      </div>
    </div>
  )
}

function MyResults({ groupPredictions, thirdPlaceAdvancing, realStandings, qualification, groupStageScored }) {
  if (!groupStageScored) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
      <p style={{ color: '#fbbf24', fontWeight: 700, fontSize: 18, margin: '0 0 8px' }}>Results not scored yet</p>
      <p style={{ color: '#475569', fontSize: 14, margin: 0 }}>Check back once the admin scores the group stage!</p>
    </div>
  )




  // Build real positions map from standings
  const realPositions = {}
  Object.entries(realStandings).forEach(([group, teams]) => {
    const sorted = [...teams].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.gd !== a.gd) return b.gd - a.gd
      return b.gf - a.gf
    })
    realPositions[group] = sorted.map(t => t.team)
  })

  // Which 3rd place teams advanced
  const advancedThirds = new Set(
    qualification
      .filter(q => q.status === 'advanced')
      .filter(q => realPositions[q.group]?.[2] === q.team)
      .map(q => q.team)
  )

  // Calculate points per team per group
  const getPointsForPosition = (predictedTeam, pos, realOrder) => {
    if (!realOrder || realOrder.length === 0) return { pts: 0, status: 'unknown' }
    if (predictedTeam === realOrder[pos]) return { pts: 5, status: 'exact' }
    if (pos < 2 && realOrder.slice(0, 2).includes(predictedTeam)) return { pts: 3, status: 'partial' }
    if (pos >= 2 && realOrder.slice(2, 4).includes(predictedTeam)) return { pts: 3, status: 'partial' }
    return { pts: 0, status: 'wrong' }
  }

  let totalGroupPts = 0
  let totalThirdPts = 0

  // Pre-calculate all points
  const groupResults = {}
  GROUP_LETTERS.forEach(group => {
    const predicted = groupPredictions[group] || []
    const real = realPositions[group] || []
    if (predicted.length === 0 || real.length === 0) return
    groupResults[group] = predicted.map((team, pos) => {
      const { pts, status } = getPointsForPosition(team, pos, real)
      totalGroupPts += pts
      return { team, pos, predictedPos: pos, realPos: real.indexOf(team), pts, status }
    })
  })

  // 3rd place advancing results
  const thirdResults = thirdPlaceAdvancing.map(team => {
    let teamRealPos = null
    let teamGroup = null
    Object.entries(realPositions).forEach(([g, order]) => {
      const idx = order.indexOf(team)
      if (idx !== -1) { teamRealPos = idx; teamGroup = g }
    })

    let pts = 0
    let status = 'wrong'
    let note = ''

    if (teamRealPos === 2 && advancedThirds.has(team)) {
      pts = 5; status = 'exact'
      note = 'Finished 3rd and advanced ✓'
    } else if (teamRealPos === 2 && !advancedThirds.has(team)) {
      pts = 0; status = 'wrong'
      note = 'Finished 3rd but did not advance'
    } else if (teamRealPos === 3) {
      pts = 0; status = 'wrong'
      note = 'Finished 4th — not eligible'
    } else if (teamRealPos !== null && teamRealPos < 2) {
      pts = 0; status = 'wrong'
      note = 'Finished in top 2 — not a 3rd place team'
    }

    totalThirdPts += pts
    return { team, pts, status, note, teamGroup, teamRealPos }
  })

  const grandTotal = totalGroupPts + totalThirdPts

  return (
    <div>
      {/* Summary header */}
      <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.04))', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 14, padding: '20px 24px', marginBottom: 28, borderTop: '3px solid #3b82f6', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontWeight: 900, fontSize: 22, color: '#93c5fd', margin: '0 0 4px', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.05em' }}>📊 MY GROUP STAGE RESULTS</h2>
          <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>Here's how your group stage predictions did!</p>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 20px' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#3b82f6' }}>{totalGroupPts}</div>
            <div style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>Group Pts</div>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 20px' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#f59e0b' }}>{totalThirdPts}</div>
            <div style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>3rd Place Pts</div>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: '12px 20px' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#22c55e' }}>{grandTotal}</div>
            <div style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>Total</div>
          </div>
        </div>
      </div>

      {/* Group results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 28 }}>
        {GROUP_LETTERS.map((group, gi) => {
          const results = groupResults[group]
          if (!results) return null
          const color = GROUP_COLORS[gi]
          const groupPts = results.reduce((sum, r) => sum + r.pts, 0)
          const real = realPositions[group] || []

          return (
            <motion.div key={group} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.04 }}
              style={{ background: '#0d1526', border: `1px solid ${color}30`, borderRadius: 14, overflow: 'hidden', borderTop: `3px solid ${color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: `${color}08` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 6, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#000' }}>{group}</span>
                  <span style={{ fontWeight: 800, fontSize: 15, color: '#f1f5f9' }}>Group {group}</span>
                </div>
                <span style={{ fontWeight: 900, fontSize: 16, color: groupPts > 0 ? color : '#334155' }}>+{groupPts}pts</span>
              </div>

              <div style={{ padding: '8px 0' }}>
                {results.map(({ team, pos, realPos, pts, status }) => {
                  const icon = status === 'exact' ? '🟢' : status === 'partial' ? '🟡' : '🔴'
                  const realPosLabel = realPos >= 0 ? POSITIONS[realPos] : '?'
                  const predPosLabel = POSITIONS[pos]
                  return (
                    <div key={team} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
                      <img src={`https://flagcdn.com/w40/${FLAGS[team] || 'un'}.png`} alt={team}
                        style={{ width: 22, height: 15, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }}
                        onError={e => { e.target.style.display = 'none' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 12, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team}</div>
                        <div style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>
                          {status === 'exact'
                            ? `${predPosLabel} ✓ Exact`
                            : status === 'partial'
                              ? `Predicted ${predPosLabel}, finished ${realPosLabel}`
                              : `Predicted ${predPosLabel}, finished ${realPos >= 0 ? realPosLabel : '?'}`}
                        </div>
                      </div>
                      <span style={{ fontWeight: 800, fontSize: 13, color: pts > 0 ? '#22c55e' : '#334155', flexShrink: 0 }}>
                        {pts > 0 ? `+${pts}` : '0'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* 3rd place results */}
      <div style={{ background: '#0d1526', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14, padding: 20, borderTop: '3px solid #f59e0b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontWeight: 800, fontSize: 16, color: '#fbbf24', margin: 0 }}>🥉 Best 3rd Place Picks</h3>
          <span style={{ fontWeight: 900, fontSize: 16, color: totalThirdPts > 0 ? '#f59e0b' : '#334155' }}>+{totalThirdPts}pts</span>
        </div>

        {thirdResults.length === 0 ? (
          <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>No 3rd place picks made.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {thirdResults.map(({ team, pts, status, note, teamGroup }) => {
              const icon = status === 'exact' ? '🟢' : '🔴'
              return (
                <div key={team} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: status === 'exact' ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${status === 'exact' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 10 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                  <img src={`https://flagcdn.com/w40/${FLAGS[team] || 'un'}.png`} alt={team}
                    style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }}
                    onError={e => { e.target.style.display = 'none' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9' }}>{team} <span style={{ fontSize: 10, color: '#475569', fontWeight: 600 }}>Group {teamGroup}</span></div>
                    <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{note}</div>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: 14, color: pts > 0 ? '#22c55e' : '#334155', flexShrink: 0 }}>
                    {pts > 0 ? `+${pts}` : '0'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
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
  const [groupStageScored, setGroupStageScored] = useState(false)
  const [realStandings, setRealStandings] = useState({})
  const [qualification, setQualification] = useState([])
  const [r32Matchups, setR32Matchups] = useState([])

  const token = localStorage.getItem('token')
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  useEffect(() => {
    axios.get(`${API_URL}/api/groups`).then(res => {
      setGroups(res.data)
      const initial = {}
      Object.keys(res.data).forEach(g => { initial[g] = [...res.data[g]] })
      setGroupPredictions(initial)
      setLoading(false)
      axios.get(`${API_URL}/api/standings`).then(r => setRealStandings(r.data)).catch(() => {})
      axios.get(`${API_URL}/api/qualification`).then(r => setQualification(r.data)).catch(() => {})
      if (new Date() >= new Date('2026-06-16T20:30:00Z')) { setLocked(true); setAwardsLocked(true) }
      const token = localStorage.getItem('token')
      if (token) {
        axios.get(`${API_URL}/api/predictions`, { headers: { Authorization: `Bearer ${token}` } })
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
              if (saved.data.group_stage_scored) setGroupStageScored(saved.data.group_stage_scored)
            }
          }).catch(() => {})
      }
    })
  }, [])

  const handleDragEnd = (groupName, event) => {
    if (locked) return
    const { active, over } = event
    if (!over || active.id === over.id) return
    const teams = groupPredictions[groupName]
    setGroupPredictions(prev => ({ ...prev, [groupName]: arrayMove(teams, teams.indexOf(active.id), teams.indexOf(over.id)) }))
  }

  const payload = () => ({ group_predictions: groupPredictions, third_place_advancing: thirdPlaceAdvancing, knockout_predictions: knockoutPredictions, golden_ball: goldenBall, silver_ball: silverBall, bronze_ball: bronzeBall, golden_boot: goldenBoot, golden_glove: goldenGlove, u21_award: u21Award })

  const saveGroupStage = async () => { if (!token) { toast.error('Please login to save!'); return } setSaving(true); try { await axios.post(`${API_URL}/api/predictions`, payload(), { headers: { Authorization: `Bearer ${token}` } }); toast.success('Group stage saved! ✅') } catch { toast.error('Error saving. Please try again.') } setSaving(false) }
  const saveThirdPlace = async () => { if (!token) { toast.error('Please login to save!'); return } setSaving(true); try { await axios.post(`${API_URL}/api/predictions`, payload(), { headers: { Authorization: `Bearer ${token}` } }); toast.success('3rd place picks saved! ✅') } catch { toast.error('Error saving. Please try again.') } setSaving(false) }
  const submitPredictions = async () => { if (!token) { toast.error('Please login to save predictions!'); return } if (locked) { toast.error('Predictions are already locked!'); return } setSaving(true); try { await axios.post(`${API_URL}/api/predictions`, payload(), { headers: { Authorization: `Bearer ${token}` } }); toast.success('Predictions submitted and locked! 🔒'); setLocked(true); if (goldenBall || goldenBoot.some(v => v)) setAwardsLocked(true) } catch { toast.error('Error saving. Please try again.') } setSaving(false) }
  const saveAwards = async () => { if (!token) { toast.error('Please login to save!'); return } if (awardsLocked) { toast.error('Award predictions are locked!'); return } setSaving(true); try { await axios.post(`${API_URL}/api/predictions`, payload(), { headers: { Authorization: `Bearer ${token}` } }); toast.success('Award predictions saved and locked! 🔒'); setAwardsLocked(true) } catch { toast.error('Error saving. Please try again.') } setSaving(false) }

  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#3b82f6', fontWeight: 700, fontSize: 16 }}>Loading predictions...</p></div>

  const r32Matches = locked && r32Matchups.length > 0
  ? (() => {
      const byNum = {}
      r32Matchups.forEach(m => { byNum[m.match] = m })
      const order = [74,77,73,75,83,84,81,82,76,78,79,80,86,88,85,87]
      return order.map(n => byNum[n]
        ? { id: `r32_${byNum[n].match}`, match: byNum[n].match, team1: byNum[n].team1, team2: byNum[n].team2 }
        : null
      ).filter(Boolean)
    })()
  : getR32Matches(groupPredictions, thirdPlaceAdvancing)
  const r16Matches = getR16Matches(knockoutPredictions.r32)
  const qfMatches  = getQFMatches(knockoutPredictions.r16)
  const sfMatches  = getSFMatches(knockoutPredictions.quarter)
  const finalTeams = getFinalTeams(knockoutPredictions.semi)

  const TABS = [
    { id: 'groups',   label: 'Group Stage' },
    { id: 'third',    label: '3rd Place' },
    { id: 'knockout', label: 'Knockout' },
    { id: 'awards',   label: 'Awards' },
    { id: 'picks',    label: 'Match Picks' },
    { id: 'second',   label: '🔄 Second Chance' },
    { id: 'results', label: '📊 My Results' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff', fontFamily: 'Barlow, system-ui, sans-serif' }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #14b8a6, #f59e0b, #84cc16, #6366f1)' }} />
      <div style={{ maxWidth: '100%', margin: '0 auto', padding: '32px 16px 80px' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>FIFA World Cup 2026</div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', fontFamily: 'Bebas Neue, sans-serif' }}>Your Predictions</h1>
          <p style={{ color: '#64748b', marginTop: 6, fontSize: 14 }}>Drag teams to rank each group, then fill in the knockout bracket.</p>
        </div>

        {locked && (
          <div style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>🔒</span>
            <div><p style={{ fontWeight: 700, color: '#fbbf24', margin: 0, fontSize: 14 }}>Predictions Locked</p><p style={{ color: '#94a3b8', margin: 0, fontSize: 13, marginTop: 2 }}>The World Cup has started! Check the Second Chance tab for a fresh bracket 🔄</p></div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 24, scrollbarWidth: 'none', paddingTop: 8 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ position: 'relative', flexShrink: 0, padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s', border: 'none', background: activeTab === tab.id ? (tab.id === 'second' ? '#06b6d4' : '#3b82f6') : 'rgba(255,255,255,0.05)', color: activeTab === tab.id ? '#fff' : '#94a3b8', boxShadow: activeTab === tab.id ? (tab.id === 'second' ? '0 4px 16px rgba(6,182,212,0.3)' : '0 4px 16px rgba(59,130,246,0.3)') : 'none' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'picks'  && <MatchPicks token={token} />}
        {activeTab === 'second' && <SecondChanceTab token={token} />}

        {activeTab === 'groups' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {Object.entries(groups).map(([groupName], gi) => {
                const color = GROUP_COLORS[GROUP_LETTERS.indexOf(groupName)] || '#3b82f6'
                return (
                  <motion.div key={groupName} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.04 }}
                    style={{ background: '#0d1526', border: `1px solid ${color}30`, borderRadius: 14, padding: 18, borderTop: `3px solid ${color}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <span style={{ width: 28, height: 28, borderRadius: 6, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#000', flexShrink: 0 }}>{groupName}</span>
                      <span style={{ fontWeight: 800, fontSize: 15, color: '#f1f5f9' }}>Group {groupName}</span>
                    </div>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={e => handleDragEnd(groupName, e)}>
                      <SortableContext items={groupPredictions[groupName] || []} strategy={verticalListSortingStrategy}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {groupPredictions[groupName]?.map((team, index) => (
                            <SortableTeam key={team} team={team} index={index} total={groupPredictions[groupName].length} disabled={locked}
                              onMove={(from, to) => { if (locked) return; if (to < 0 || to >= groupPredictions[groupName].length) return; setGroupPredictions(prev => ({ ...prev, [groupName]: arrayMove(prev[groupName], from, to) })) }} />
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
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
              <button onClick={saveGroupStage} disabled={saving || locked} style={{ background: locked ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: locked ? '#64748b' : '#fff', fontWeight: 700, fontSize: 14, padding: '12px 28px', borderRadius: 100, border: 'none', cursor: locked ? 'not-allowed' : 'pointer', boxShadow: locked ? 'none' : '0 4px 16px rgba(59,130,246,0.3)', opacity: saving ? 0.6 : 1 }}>
                {locked ? '🔒 Predictions Locked' : saving ? 'Saving...' : '💾 Save Group Stage'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'third' && (
          <div>
            <div style={{ background: '#0d1526', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14, padding: 20, marginBottom: 20, borderTop: '3px solid #f59e0b' }}>
              <h2 style={{ fontWeight: 800, fontSize: 18, color: '#fbbf24', margin: '0 0 6px' }}>Select 8 Best 3rd Place Teams</h2>
              <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 8px' }}>8 of the 12 third-place teams advance to the Round of 32.</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: thirdPlaceAdvancing.length === 8 ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${thirdPlaceAdvancing.length === 8 ? '#22c55e' : '#f59e0b'}40`, borderRadius: 100, padding: '4px 12px' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: thirdPlaceAdvancing.length === 8 ? '#22c55e' : '#fbbf24' }}>{thirdPlaceAdvancing.length}/8 selected</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
              {Object.entries(groups).map(([groupName], gi) => {
                const thirdTeam = groupPredictions[groupName]?.[2]; if (!thirdTeam) return null
                const isSelected = thirdPlaceAdvancing.includes(thirdTeam)
                const color = GROUP_COLORS[GROUP_LETTERS.indexOf(groupName)] || '#3b82f6'
                return (
                  <motion.div key={groupName} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.04 }}
                    onClick={() => { if (locked) return; if (isSelected) { setThirdPlaceAdvancing(prev => prev.filter(t => t !== thirdTeam)) } else { if (thirdPlaceAdvancing.length >= 8) { toast.error('You can only select 8!'); return } setThirdPlaceAdvancing(prev => [...prev, thirdTeam]) } }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, cursor: locked ? 'default' : 'pointer', background: isSelected ? `${color}12` : '#0d1526', border: `2px solid ${isSelected ? color : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.15s' }}>
                    <span style={{ width: 32, height: 32, borderRadius: 8, background: isSelected ? color : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: isSelected ? '#000' : '#64748b', flexShrink: 0 }}>{groupName}</span>
                    <img src={`https://flagcdn.com/w40/${FLAGS[thirdTeam] || 'un'}.png`} alt={thirdTeam} style={{ width: 36, height: 24, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
                    <div style={{ flex: 1, minWidth: 0 }}><p style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9', margin: 0 }}>{thirdTeam}</p><p style={{ color: '#475569', fontSize: 11, margin: 0 }}>3rd — Group {groupName}</p></div>
                    {isSelected && <span style={{ color, fontSize: 16, fontWeight: 900 }}>✓</span>}
                  </motion.div>
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
              <button onClick={saveThirdPlace} disabled={saving || locked} style={{ background: locked ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: locked ? '#64748b' : '#000', fontWeight: 700, fontSize: 14, padding: '12px 28px', borderRadius: 100, border: 'none', cursor: locked ? 'not-allowed' : 'pointer', boxShadow: locked ? 'none' : '0 4px 16px rgba(245,158,11,0.3)', opacity: saving ? 0.6 : 1 }}>
                {locked ? '🔒 Predictions Locked' : saving ? 'Saving...' : '💾 Save 3rd Place Picks'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'knockout' && (
          <div>
            {Object.keys(groupPredictions).length < 12 ? <div style={{ textAlign: 'center', padding: '80px 20px' }}><p style={{ color: '#fbbf24', fontWeight: 700, fontSize: 16 }}>Complete Group Stage first!</p></div>
              : thirdPlaceAdvancing.length < 8 ? <div style={{ textAlign: 'center', padding: '80px 20px' }}><p style={{ color: '#fbbf24', fontWeight: 700, fontSize: 16 }}>Select all 8 third-place teams first!</p></div>
              : (
                <>
                  <div style={{ background: '#0d1526', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 14, padding: 18, marginBottom: 20, borderTop: '3px solid #3b82f6' }}>
                    <h2 style={{ fontWeight: 800, fontSize: 18, color: '#93c5fd', margin: '0 0 4px' }}>Knockout Bracket</h2>
                    <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>Tap a team to advance them. Once you submit, predictions are locked forever!</p>
                  </div>
                  <KnockoutBracket r32Matches={r32Matches} r16Matches={r16Matches} qfMatches={qfMatches} sfMatches={sfMatches} finalTeams={finalTeams} knockoutPredictions={knockoutPredictions} setKnockoutPredictions={setKnockoutPredictions} locked={locked} />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 24 }}>
                    <button onClick={submitPredictions} disabled={saving || locked} style={{ background: locked ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #22c55e, #16a34a)', color: locked ? '#64748b' : '#000', fontWeight: 800, fontSize: 15, padding: '14px 40px', borderRadius: 100, border: 'none', cursor: locked ? 'not-allowed' : 'pointer', boxShadow: locked ? 'none' : '0 4px 20px rgba(34,197,94,0.3)', opacity: saving ? 0.7 : 1 }}>
                      {locked ? '🔒 Predictions Locked' : saving ? 'Saving...' : '🔒 Submit Predictions'}
                    </button>
                    {!locked && <p style={{ color: '#475569', fontSize: 12 }}>Once submitted, predictions cannot be changed</p>}
                  </div>
                </>
              )}
          </div>
        )}

        {activeTab === 'awards' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 480px))', gap: 16, justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#0d1526', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 14, padding: 20, borderTop: '3px solid #fbbf24' }}>
              <h2 style={{ color: '#fbbf24', fontWeight: 800, fontSize: 16, margin: '0 0 4px' }}>Best Players</h2>
              <p style={{ color: '#475569', fontSize: 12, margin: '0 0 14px' }}>Best overall players of the tournament voted by FIFA</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[{ label: '🥇 Golden Ball (15pts)', value: goldenBall, setter: setGoldenBall }, { label: '🥈 Silver Ball (10pts)', value: silverBall, setter: setSilverBall }, { label: '🥉 Bronze Ball (5pts)', value: bronzeBall, setter: setBronzeBall }].map(({ label, value, setter }) => (
                  <div key={label}><label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6, fontWeight: 600 }}>{label}</label><PlayerSearch value={value} onChange={val => !awardsLocked && setter(val)} placeholder="Search player..." /></div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={{ background: '#0d1526', border: '1px solid rgba(251,146,60,0.2)', borderRadius: 14, padding: 20, borderTop: '3px solid #fb923c' }}>
              <h2 style={{ color: '#fb923c', fontWeight: 800, fontSize: 16, margin: '0 0 4px' }}>Golden Boot</h2>
              <p style={{ color: '#475569', fontSize: 12, margin: '0 0 14px' }}>1st: 12pts · 2nd: 8pts · 3rd: 4pts</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {['1st Choice', '2nd Choice', '3rd Choice'].map((label, i) => (
                  <div key={label}><label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6, fontWeight: 600 }}>{label}</label><PlayerSearch value={goldenBoot[i]} onChange={val => { if (awardsLocked) return; const u = [...goldenBoot]; u[i] = val; setGoldenBoot(u) }} placeholder="Search player..." /></div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ background: '#0d1526', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 14, padding: 20, borderTop: '3px solid #a855f7' }}>
              <h2 style={{ color: '#c084fc', fontWeight: 800, fontSize: 16, margin: '0 0 4px' }}>🌟 Best U21 Player</h2>
              <p style={{ color: '#475569', fontSize: 12, margin: '0 0 14px' }}>1st: 12pts · 2nd: 8pts · 3rd: 4pts — Born Jan 1, 2005 or later</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {['1st Choice', '2nd Choice', '3rd Choice'].map((label, i) => (
                  <div key={label}><label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6, fontWeight: 600 }}>{label}</label><PlayerSearch value={u21Award[i]} onChange={val => { if (awardsLocked) return; const u = [...u21Award]; u[i] = val; setU21Award(u) }} placeholder="Search U21 player..." playerList={U21_PLAYERS} /></div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ background: '#0d1526', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 14, padding: 20, borderTop: '3px solid #3b82f6' }}>
              <h2 style={{ color: '#60a5fa', fontWeight: 800, fontSize: 16, margin: '0 0 4px' }}>Golden Glove</h2>
              <p style={{ color: '#475569', fontSize: 12, margin: '0 0 14px' }}>1st: 12pts · 2nd: 8pts · 3rd: 4pts</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {['1st Choice', '2nd Choice', '3rd Choice'].map((label, i) => (
                  <div key={label}><label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6, fontWeight: 600 }}>{label}</label><PlayerSearch value={goldenGlove[i]} onChange={val => { if (awardsLocked) return; const u = [...goldenGlove]; u[i] = val; setGoldenGlove(u) }} placeholder="Search player..." /></div>
                ))}
              </div>
            </motion.div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <button onClick={saveAwards} disabled={saving || awardsLocked} style={{ background: awardsLocked ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #a855f7, #7c3aed)', color: awardsLocked ? '#64748b' : '#fff', fontWeight: 800, fontSize: 15, padding: '14px 36px', borderRadius: 100, border: 'none', cursor: awardsLocked ? 'not-allowed' : 'pointer', boxShadow: awardsLocked ? 'none' : '0 4px 20px rgba(168,85,247,0.3)', opacity: saving ? 0.7 : 1 }}>
                {awardsLocked ? '🔒 Awards Locked' : saving ? 'Saving...' : '🔒 Submit & Lock Award Predictions'}
              </button>
              {!awardsLocked && <p style={{ color: '#475569', fontSize: 12 }}>Once submitted, award predictions cannot be changed</p>}
            </div>
          </div>
        )}

        {activeTab === 'results' && (
  <MyResults
    groupPredictions={groupPredictions}
    thirdPlaceAdvancing={thirdPlaceAdvancing}
    realStandings={realStandings}
    qualification={qualification}
    groupStageScored={groupStageScored}
  />
)}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} } input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; } input[type=number] { -moz-appearance: textfield; }`}</style>
    </div>
  )
}

export default Predictions