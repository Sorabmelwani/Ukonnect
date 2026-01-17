import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signup as signupApi, verifyVisa } from '../api/auth'
import { updateProfile } from '../api/profile'
import { HiOutlineEye, HiOutlineEyeOff, HiOutlineLocationMarker, HiOutlineCalendar, HiOutlineDocumentText } from 'react-icons/hi'
import ThemeToggle from '../components/ThemeToggle'
import { NATIONALITIES, UK_CITIES, VISA_TYPES, PURPOSES } from '../constants/formOptions'

export default function Signup() {
  const [currentStep, setCurrentStep] = useState(1)
  
  // Step 1: Credentials
  const [credentials, setCredentials] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Step 2: Personalization
  const [personalization, setPersonalization] = useState({
    visaType: '',
    purpose: '',
    city: '',
    nationality: '',
    goals: ''
  })
  
  // Step 3: Visa Info
  const [visaInfo, setVisaInfo] = useState({
    visaShareCode: '',
    visaExpiryDate: ''
  })
  
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Handle credential changes
  const handleCredentialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle personalization changes
  const handlePersonalizationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target
    setPersonalization(prev => ({
      ...prev,
      [id]: value
    }))
  }

  // Handle visa info changes
  const handleVisaInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setVisaInfo(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Step 1: Register with credentials
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (credentials.password !== credentials.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      await signupApi({
        fullName: credentials.fullName,
        email: credentials.email,
        password: credentials.password
      })
      
      // Move to next step (personalization step 1)
      setCurrentStep(2)
    } catch (err: unknown) {
      console.error('Signup error', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to create account. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Continue to visa info
  const handleContinueToVisaInfo = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Save personalization data to user profile
      await updateProfile({
        fullName: credentials.fullName,
        nationality: personalization.nationality,
        city: personalization.city,
        visaType: personalization.visaType,
        purpose: personalization.purpose
      })
      
      // Move to visa info step (step 4)
      setCurrentStep(4)
    } catch (err: unknown) {
      console.error('Failed to save personalization data', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to save personalization data. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Step 4: Verify visa and complete signup
  const handleVerifyVisa = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)
      await verifyVisa({
        visaShareCode: visaInfo.visaShareCode,
        visaExpiryDate: visaInfo.visaExpiryDate
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

  // Validation functions
  const isCredentialsValid = () => {
    return credentials.fullName.trim() !== '' && 
           credentials.email.trim() !== '' && 
           credentials.password !== '' && 
           credentials.password === credentials.confirmPassword
  }

  const isPersonalizationStep1Valid = () => {
    return personalization.visaType !== '' && personalization.purpose !== ''
  }

  const isPersonalizationStep2Valid = () => {
    return personalization.city !== '' && personalization.nationality !== ''
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <ThemeToggle />
        </div>

        {/* Step Indicator */}
        <div className="signup-steps-indicator">
          <div className={`step-indicator ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <span>Account</span>
          </div>
          <div className={`step-indicator ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <span>Visa & Purpose</span>
          </div>
          <div className={`step-indicator ${currentStep === 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
            <div className="step-number">3</div>
            <span>Location</span>
          </div>
          <div className={`step-indicator ${currentStep === 4 ? 'active' : ''}`}>
            <div className="step-number">4</div>
            <span>Visa Info</span>
          </div>
        </div>

        {/* Step 1: Credentials */}
        {currentStep === 1 && (
          <>
            <h2>Create Account</h2>
            <p>Start your UK settlement journey with personalized guidance</p>
            
            <form onSubmit={handleRegister}>
              <div className="form-group-auth">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={credentials.fullName}
                  onChange={handleCredentialChange}
                  required
                />
              </div>

              <div className="form-group-auth">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={credentials.email}
                  onChange={handleCredentialChange}
                  required
                />
              </div>

              <div className="form-group-auth">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={handleCredentialChange}
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

              <div className="form-group-auth">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={credentials.confirmPassword}
                    onChange={handleCredentialChange}
                    required
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

              <button type="submit" className="btn btn-auth-primary" disabled={loading || !isCredentialsValid()}>
                {loading ? 'Creating Account...' : 'Continue →'}
              </button>
            </form>

            <p className="auth-link">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </>
        )}

        {/* Step 2: Personalization - Visa & Purpose */}
        {currentStep === 2 && (
          <>
            <h2>Let's Personalize Your Journey</h2>
            <p>Tell us a bit about yourself so we can provide tailored guidance</p>
            
            <div className="personalization-steps">
              <div className="form-content">
                <div className="form-group">
                  
                  <label htmlFor="visaType">Visa Type</label>
                  <select id="visaType" value={personalization.visaType} onChange={handlePersonalizationChange}>
                    <option value="">Select your visa type</option>
                    {VISA_TYPES.map((visaType) => (
                      <option key={visaType} value={visaType}>
                        {visaType}
                      </option>
                    ))}
                  </select>

                  <label htmlFor="purpose">Primary Purpose</label>
                  <select id="purpose" value={personalization.purpose} onChange={handlePersonalizationChange}>
                    <option value="">What brings you to the UK?</option>
                    {PURPOSES.map((purpose) => (
                      <option key={purpose} value={purpose}>
                        {purpose}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-buttons">
                  <button className="btn btn-link" onClick={() => setCurrentStep(1)}>← Back</button>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setCurrentStep(3)}
                    disabled={!isPersonalizationStep1Valid()}
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 3: Personalization - Location & Background */}
        {currentStep === 3 && (
          <>
            <h2>Let's Personalize Your Journey</h2>
            <p>Tell us a bit about yourself so we can provide tailored guidance</p>
            
            <div className="personalization-steps">
              <div className="form-content">
                <div className="form-group">
                  
                  <label htmlFor="city">UK City/Region</label>
                  <select id="city" value={personalization.city} onChange={handlePersonalizationChange}>
                    <option value="">Where will you be living?</option>
                    {UK_CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>

                  <label htmlFor="nationality">Nationality</label>
                  <select id="nationality" value={personalization.nationality} onChange={handlePersonalizationChange}>
                    <option value="">Select your nationality</option>
                    {NATIONALITIES.map((nationality) => (
                      <option key={nationality} value={nationality}>
                        {nationality}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-buttons">
                  <button className="btn btn-link" onClick={() => setCurrentStep(2)}>← Previous</button>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleContinueToVisaInfo}
                    disabled={!isPersonalizationStep2Valid() || loading}
                  >
                    {loading ? 'Saving...' : 'Continue →'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 4: Visa Info */}
        {currentStep === 4 && (
          <>
            <div className="verify-visa-header">
              <div className="verify-visa-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L4 7V10C4 15.55 7.16 20.74 12 22C16.84 20.74 20 15.55 20 10V7L12 2Z" fill="#1f7ce1"/>
                </svg>
              </div>
              <h2>Verify Your Visa</h2>
              <p>To ensure you receive accurate guidance, please verify your UK visa status</p>
            </div>

            <form onSubmit={handleVerifyVisa}>
              <div className="form-group-auth">
                <label htmlFor="visaShareCode">Visa/eVisa Share Code</label>
                <input
                  type="text"
                  id="visaShareCode"
                  name="visaShareCode"
                  placeholder="Enter your visa reference or eVisa share code"
                  value={visaInfo.visaShareCode}
                  onChange={handleVisaInfoChange}
                  required
                />
                {/* <p className="form-helper-text">
                  This can be found on your visa sticker or digital eVisa status (BRPs are no longer issued)
                </p> */}
              </div>

              <div className="form-group-auth">
                <label htmlFor="visaExpiryDate">Visa Expiry Date</label>
                <div className="date-input-wrapper">
                  <input
                    type="date"
                    id="visaExpiryDate"
                    name="visaExpiryDate"
                    placeholder="mm/dd/yyyy"
                    value={visaInfo.visaExpiryDate}
                    onChange={handleVisaInfoChange}
                    required
                  />  
                </div>
                {/* <p className="form-helper-text">
                  Enter the expiry date of your current UK visa
                </p> */}
              </div>

              {error && <p className="auth-error">{error}</p>}

              <div className="form-buttons">
                <button type="button" className="btn btn-link" onClick={() => setCurrentStep(3)}>← Back</button>
                <button type="submit" className="btn btn-auth-primary" disabled={loading}>
                  {loading ? 'Verifying...' : 'Complete Signup →'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
