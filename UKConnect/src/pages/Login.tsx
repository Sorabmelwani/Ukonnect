import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login as loginApi } from '../api/auth'
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'
import ThemeToggle from '../components/ThemeToggle'
import logo from '../assets/images/logo.png'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      await loginApi({ email, password })
      navigate('/dashboard')
    } catch (err: unknown) {
      console.error('Login error', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to sign in. Please check your credentials and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-split-container">
      {/* Left Side - Branding */}
      <div className="auth-branding">
        <div className="auth-branding-content">
          <div className="auth-logo-icon">
            <img src={logo} alt="UKonnect Logo" style={{ width: '180px', height: 'auto' }} />
          </div>
          <h1 className="auth-brand-name">UKonnect</h1>
          <p className="auth-tagline">Settle in faster. One step at a time.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-form-section">
        <div className="auth-form-wrapper">
          <div className="auth-theme-toggle">
            <ThemeToggle />
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
          
          <form onSubmit={handleLogin}>
            <div className="form-group-auth">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group-auth">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                </button>
              </div>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
              <Link to="/forgot-password" style={{ fontSize: '0.9rem', color: 'var(--primary-color)' }}>
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="btn btn-auth-primary" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In →'}
            </button>
          </form>

          <p className="auth-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
