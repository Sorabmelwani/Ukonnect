import { HiOutlineClipboardList, HiOutlineHeart, HiOutlineCreditCard, HiOutlineDeviceMobile, HiOutlineUserGroup, HiOutlineBell, HiOutlineCheckCircle } from 'react-icons/hi'

export default function Features() {
  const features = [
    {
      id: 1,
      icon: <HiOutlineClipboardList />,
      title: 'National Insurance Number',
      description: 'Step-by-step guidance for NIN applications, required documents, and appointment booking.'
    },
    {
      id: 2,
      icon: <HiOutlineHeart />,
      title: 'NHS GP Registration',
      description: 'Find local GPs, understand NHS access, and register for healthcare coverage.'
    },
    {
      id: 3,
      icon: <HiOutlineCreditCard />,
      title: 'Banking & Finance',
      description: 'Compare banks, understand credit rules, and open your first UK account.'
    },
    {
      id: 4,
      icon: <HiOutlineDeviceMobile />,
      title: 'Mobile & Internet',
      description: 'Best mobile plans, internet bundles, and connectivity options for your needs.'
    },
    {
      id: 5,
      icon: <HiOutlineUserGroup />,
      title: 'Community & Integration',
      description: 'Connect with local communities and find integration opportunities.'
    },
    {
      id: 6,
      icon: <HiOutlineBell />,
      title: 'Smart Reminders',
      description: 'Never miss important deadlines with smart reminders and notifications.'
    },
    {
      id: 7,
      icon: <HiOutlineCheckCircle />,
      title: 'Visa Compliance',
      description: 'Stay compliant with visa requirements and important renewal dates.'
    }
  ]

  return (
    <section id="features" className="features">
      <div className="container">
        <h2>Everything You Need in One Place</h2>
        <p className="features-subtitle">From essential paperwork to community connections, our AI assistant guides you through every aspect of settling in the UK with personalized, step-by-step support.</p>
        <div className="features-grid">
          {features.map(feature => (
            <div key={feature.id} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
