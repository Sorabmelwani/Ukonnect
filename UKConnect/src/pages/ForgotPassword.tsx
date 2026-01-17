import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { requestPasswordReset, verifyOTP, resetPassword } from '../api/auth'
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'
import ThemeToggle from '../components/ThemeToggle'

export default function ForgotPassword() {
  const [step, setStep] = useState(1) // 1: email, 2: OTP, 3: new password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Step 1: Request password reset
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      await requestPasswordReset({ email })
      setStep(2)
    } catch (err: unknown) {
      console.error('Request reset error', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to request password reset. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      await verifyOTP({ email, otp })
      setStep(3)
    } catch (err: unknown) {
      console.error('Verify OTP error', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to verify OTP. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    try {
      setLoading(true)
      setError(null)
      await resetPassword({ email, otp, newPassword })
      navigate('/login')
    } catch (err: unknown) {
      console.error('Reset password error', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to reset password. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <ThemeToggle />
        </div>

        {/* Step 1: Enter Email */}
        {step === 1 && (
          <>
            <h2>Forgot Password</h2>
            <p>Enter your email address and we'll send you an OTP to reset your password</p>
            
            <form onSubmit={handleRequestReset}>
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

              {error && <p className="auth-error">{error}</p>}

              <button type="submit" className="btn btn-auth-primary" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>

            <p className="auth-link">
              Remember your password? <Link to="/login">Sign in</Link>
            </p>
          </>
        )}

        {/* Step 2: Enter OTP */}
        {step === 2 && (
          <>
            <h2>Enter OTP</h2>
            <p>We've sent an OTP to your email. Please enter it below.</p>
            
            <form onSubmit={handleVerifyOTP}>
              <div className="form-group-auth">
                <label htmlFor="otp">OTP</label>
                <input
                  type="text"
                  id="otp"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={4}
                />
              </div>

              {error && <p className="auth-error">{error}</p>}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  type="button" 
                  className="btn btn-link" 
                  onClick={() => setStep(1)}
                  style={{ flex: 1 }}
                >
                  ← Back
                </button>
                <button 
                  type="submit" 
                  className="btn btn-auth-primary" 
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </form>
          </>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <>
            <h2>Reset Password</h2>
            <p>Enter your new password</p>
            
            <form onSubmit={handleResetPassword}>
              <div className="form-group-auth">
                <label htmlFor="newPassword">New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
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

              <div className="form-group-auth">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                  </button>
                </div>
              </div>

              {error && <p className="auth-error">{error}</p>}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  type="button" 
                  className="btn btn-link" 
                  onClick={() => setStep(2)}
                  style={{ flex: 1 }}
                >
                  ← Back
                </button>
                <button 
                  type="submit" 
                  className="btn btn-auth-primary" 
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

