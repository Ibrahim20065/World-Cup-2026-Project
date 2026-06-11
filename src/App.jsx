import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Predictions from './pages/Predictions'
import LiveScores from './pages/LiveScores'
import Leaderboard from './pages/Leaderboard'
import Countries from './pages/Countries'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Signup from './pages/Signup'
import CountryProfile from './pages/CountryProfile'
import WorldCupMap from './pages/WorldCupMap'
import CityProfile from './pages/CityProfile'
import History from './pages/History'
import { ColorProvider } from './assets/ColorContext'
import Standings from './pages/Standings'

function App() {
  return (
    <ColorProvider>
      <BrowserRouter>
        <div style={{ background: 'var(--bg)', minHeight: '100vh' }} className="flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/livescores" element={<LiveScores />} />
              <Route path="/countries" element={<Countries />} />
              <Route path="/countries/:name" element={<CountryProfile />} />
              <Route path="/map" element={<WorldCupMap />} />
              <Route path="/cities/:name" element={<CityProfile />} />
              <Route path="/history" element={<History />} />
              <Route path="/standings" element={<Standings/>} />
              <Route path="/predictions" element={
                <ProtectedRoute><Predictions /></ProtectedRoute>
              } />
              <Route path="/leaderboard" element={
                <ProtectedRoute><Leaderboard /></ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute adminOnly={true}><Admin /></ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </ColorProvider>
  )
}

export default App