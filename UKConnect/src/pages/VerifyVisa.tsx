import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { verifyVisa } from '../api/auth'
import { HiOutlineCalendar, HiOutlineDocumentText } from 'react-icons/hi'
import ThemeToggle from '../components/ThemeToggle'

export default function VerifyVisa() {
  const [formData, setFormData] = useState({
    visaShareCode: '',
    visaExpiryDate: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)
      await verifyVisa({
        visaShareCode: formData.visaShareCode,
        visaExpiryDate: formData.visaExpiryDate
      })
      navigate('/dashboard')
    } catch (err: unknown) {
      console.error('Visa verification error', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to verify visa. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="verify-visa-card">
        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <ThemeToggle />
        </div>
        <div className="verify-visa-header">
          <div className="verify-visa-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L4 7V10C4 15.55 7.16 20.74 12 22C16.84 20.74 20 15.55 20 10V7L12 2Z" fill="#1f7ce1"/>
            </svg>
          </div>
          <h2>Verify Your Visa</h2>
          <p>To ensure you receive accurate guidance, please verify your UK visa status</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group-auth">
            <label htmlFor="visaShareCode">Visa/eVisa Share Code</label>
            <input
              type="text"
              id="visaShareCode"
              name="visaShareCode"
              placeholder="Enter your visa reference or eVisa share code"
              value={formData.visaShareCode}
              onChange={handleChange}
              required
            />
            <p className="form-helper-text">
              This can be found on your visa sticker or digital eVisa status (BRPs are no longer issued)
            </p>
          </div>

          <div className="form-group-auth">
            <label htmlFor="visaExpiryDate">Visa Expiry Date</label>
            <div className="date-input-wrapper">
              <input
                type="date"
                id="visaExpiryDate"
                name="visaExpiryDate"
                placeholder="mm/dd/yyyy"
                value={formData.visaExpiryDate}
                onChange={handleChange}
                required
              />
              <HiOutlineCalendar className="date-icon" />
            </div>
            <p className="form-helper-text">
              Enter the expiry date of your current UK visa
            </p>
          </div>

          <div className="verify-visa-info-box">
            <div className="info-box-content">
              <HiOutlineDocumentText className="info-box-icon" />
              <div>
                <h4>Why do we need this?</h4>
                <p>Verifying your visa helps us provide accurate, personalized guidance for your specific immigration status and requirements.</p>
              </div>
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn btn-auth-primary" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Visa Status'}
          </button>
        </form>
      </div>
    </div>
  )
}

