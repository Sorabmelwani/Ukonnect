import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlineLocationMarker, HiOutlineUserGroup } from 'react-icons/hi'
import { NATIONALITIES, UK_CITIES, VISA_TYPES, PURPOSES } from '../constants/formOptions'

export default function Personalization() {
  const [activeStep, setActiveStep] = useState(1)
  const [formData, setFormData] = useState({
    visaType: '',
    purpose: '',
    city: '',
    nationality: '',
    goals: ''
  })
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleGetStarted = () => {
    // Store personalization data in localStorage to use in signup
    localStorage.setItem('personalizationData', JSON.stringify(formData))
    navigate('/signup')
  }

  // Validation functions for each step
  const isStep1Valid = () => {
    return formData.visaType !== '' && formData.purpose !== ''
  }

  const isStep2Valid = () => {
    return formData.city !== '' && formData.nationality !== ''
  }

  const isStep3Valid = () => {
    return isStep1Valid() && isStep2Valid()
  }

  return (
    <section id="personalization-section" className="personalization">
      <div className="container">
        <h2>Let's Personalize Your Journey</h2>
        <p>Tell us a bit about yourself so we can provide tailored guidance</p>
        
        <div className="personalization-form">
          <div className="form-steps">
            <div className={`step ${activeStep === 1 ? 'active' : ''}`}></div>
            <div className={`step ${activeStep === 2 ? 'active' : ''}`}></div>
            <div className={`step ${activeStep === 3 ? 'active' : ''}`}></div>
          </div>

          {activeStep === 1 && (
            <div className="form-content">
              <div className="form-group">
                <h3>📋 Visa & Purpose</h3>
                <p>Help us understand your immigration status and goals</p>
                
                <label htmlFor="visaType">Visa Type</label>
                <select id="visaType" value={formData.visaType} onChange={handleChange}>
                  <option value="">Select your visa type</option>
                  {VISA_TYPES.map((visaType) => (
                    <option key={visaType} value={visaType}>
                      {visaType}
                    </option>
                  ))}
                </select>

                <label htmlFor="purpose">Primary Purpose</label>
                <select id="purpose" value={formData.purpose} onChange={handleChange}>
                  <option value="">What brings you to the UK?</option>
                  {PURPOSES.map((purpose) => (
                    <option key={purpose} value={purpose}>
                      {purpose}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-buttons">
                <button className="btn btn-link" disabled>Previous</button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setActiveStep(2)}
                  disabled={!isStep1Valid()}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="form-content">
              <div className="form-group">
                <h3><HiOutlineLocationMarker /> Location & Background</h3>
                <p>Tell us where you'll be living and your background</p>
                
                <label htmlFor="city">UK City/Region</label>
                <select id="city" value={formData.city} onChange={handleChange}>
                  <option value="">Where will you be living?</option>
                  {UK_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>

                <label htmlFor="nationality">Nationality</label>
                <select id="nationality" value={formData.nationality} onChange={handleChange}>
                  <option value="">Select your nationality</option>
                  {NATIONALITIES.map((nationality) => (
                    <option key={nationality} value={nationality}>
                      {nationality}
                    </option>
                  ))}
                </select>

              </div>

              <div className="form-buttons">
                <button className="btn btn-link" onClick={() => setActiveStep(1)}>Previous</button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setActiveStep(3)}
                  disabled={!isStep2Valid()}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="form-content">
              <div className="welcome-card">
                <div className="welcome-header">
                  <HiOutlineUserGroup className="welcome-icon-small" />
                  <h3 className="welcome-title">Welcome to Your Journey!</h3>
                </div>
                <p className="welcome-subtitle">You're all set! Your personalized dashboard is ready.</p>
                
                <div className="welcome-icon-container">
                  <HiOutlineUserGroup className="welcome-icon-large" />
                  <h2 className="welcome-almost-there">Almost There!</h2>
                </div>
                
                <p className="welcome-description">
                  Your personalized settlement plan is ready. Create an account to access your dashboard and track your progress.
                </p>
                
                <button 
                  className="welcome-cta-button" 
                  onClick={handleGetStarted}
                  disabled={!isStep3Valid()}
                >
                  Create Account & Continue →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
