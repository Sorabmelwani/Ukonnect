import { HiOutlineGlobeAlt } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'

export default function Hero() {
  const navigate = useNavigate()

  const handleStartJourney = () => {
    const personalizationSection = document.getElementById('personalization-section')
    personalizationSection?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleLogin = () => {
    navigate('/login')
  }

  return (
    <section className="hero">
      <div className="hero-background"></div>
      <div className="container">
        <div className="hero-content">
          <div className="hero-badge">
            <HiOutlineGlobeAlt />
            <span>Connect to Your New Life in the UK</span>
          </div>
          <h2>Welcome to the UK<br /><span className="highlight">Made Simple</span></h2>
          <p>Your AI-powered assistant for navigating UK immigration, healthcare, banking, and community integration. Get personalized guidance every step of the way.</p>
          <div className="hero-buttons">
            <button className="btn btn-primary btn-hero-primary" onClick={handleStartJourney}>Start Your Journey →</button>
            <button className="btn btn-secondary" onClick={handleLogin}>Login</button>
          </div>
        </div>
      </div>
    </section>
  )
}
