import Header from '../components/Header'
import Hero from '../components/Hero'
import Personalization from '../components/Personalization'
import Features from '../components/Features'
import CTA from '../components/CTA'
import Footer from '../components/Footer'

export default function LandingPage() {
  return (
    <div className="landing-page">
      <Header />
      <Hero />
      <Personalization />
      <Features />
      <CTA />
      <Footer />
    </div>
  )
}
