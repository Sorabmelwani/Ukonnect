import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import VerifyVisa from './pages/VerifyVisa'
import Dashboard from './pages/Dashboard'
import LocalServices from './pages/LocalServices'
import DocumentManager from './pages/DocumentManager'
import CommunityHub from './pages/CommunityHub'
import ProfileSettings from './pages/ProfileSettings'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <ThemeProvider>
              <PublicRoute>
                <Login />
              </PublicRoute>
            </ThemeProvider>
          }
        />
        <Route
          path="/signup"
          element={
            <ThemeProvider>
              <PublicRoute>
                <Signup />
              </PublicRoute>
            </ThemeProvider>
          }
        />
        <Route
          path="/verify-visa"
          element={
            <ThemeProvider>
              <ProtectedRoute>
                <VerifyVisa />
              </ProtectedRoute>
            </ThemeProvider>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ThemeProvider>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </ThemeProvider>
          }
        />
        <Route
          path="/local-services"
          element={
            <ThemeProvider>
              <ProtectedRoute>
                <LocalServices />
              </ProtectedRoute>
            </ThemeProvider>
          }
        />
        <Route
          path="/document-manager"
          element={
            <ThemeProvider>
              <ProtectedRoute>
                <DocumentManager />
              </ProtectedRoute>
            </ThemeProvider>
          }
        />
        <Route
          path="/community-hub"
          element={
            <ThemeProvider>
              <ProtectedRoute>
                <CommunityHub />
              </ProtectedRoute>
            </ThemeProvider>
          }
        />
        <Route
          path="/profile-settings"
          element={
            <ThemeProvider>
              <ProtectedRoute>
                <ProfileSettings />
              </ProtectedRoute>
            </ThemeProvider>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
