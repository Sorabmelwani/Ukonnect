export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <span className="footer-logo-icon">🔗</span>
              <h3>Uconnect</h3>
            </div>
            <p>Your AI-powered companion for connecting to life in the UK. From paperwork to community, we're here to make your journey smooth and successful.</p>
          </div>
          <div className="footer-section">
            <h4>Essential Services</h4>
            <ul>
              <li><a href="#">National Insurance</a></li>
              <li><a href="#">NHS Registration</a></li>
              <li><a href="#">Banking Guide</a></li>
              <li><a href="#">Visa Support</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Community Forum</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 | Uconnect | All rights reserved</p>
          <div className="footer-socials">
            <a href="#">LinkedIn</a>
            <a href="#">Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
