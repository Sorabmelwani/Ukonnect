import { Link } from 'react-router-dom'
import { HiOutlineLink } from 'react-icons/hi'

export default function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <HiOutlineLink className="logo-icon" />
            <h1>Uconnect</h1>
          </div>
          <nav className="nav">
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </nav>
          <Link to="/signup" className="cta-btn">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  )
}
