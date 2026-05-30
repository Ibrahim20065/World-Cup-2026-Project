import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Predictions from './pages/Predictions'
import LiveScores from './pages/LiveScores'
import Leaderboard from './pages/Leaderboard'
import Countries from './pages/Countries'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Signup from './pages/Signup'
import CountryProfile from './pages/CountryProfile'
 
function App() {
  return (
    <BrowserRouter>
      <div className="bg-gray-900 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/livescores" element={<LiveScores />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/countries" element={<Countries />} />
            <Route path="/countries/:name" element={<CountryProfile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
    
  )
}

export default App