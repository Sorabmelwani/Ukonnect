export default function CTA() {
  return (
    <>
      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <p>Simple steps to get you started</p>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Quick Setup</h3>
              <p>Tell us about your visa type, destination city, and goals</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Get Your Plan</h3>
              <p>Receive a personalized checklist with step-by-step tasks</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Track Progress</h3>
              <p>Complete your milestones and connect with our support network</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Your UK Journey?</h2>
            <p>Get personalized guidance for your specific visa type and settlement needs. Our AI assistant will help you navigate every step of the process.</p>
            <div className="cta-buttons">
              <button className="btn btn-cta btn-light">Comprehensive Support</button>
              <button className="btn btn-cta btn-green">Smart Reminders</button>
              <button className="btn btn-cta btn-orange">Community Support</button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
