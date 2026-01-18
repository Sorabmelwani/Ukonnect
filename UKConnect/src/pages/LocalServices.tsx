import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchServices, type Service } from '../api/services'
import { HiOutlineOfficeBuilding, HiOutlineDeviceMobile, HiOutlineTruck, HiOutlineAcademicCap, HiOutlineLocationMarker, HiOutlineSearch, HiOutlineClock, HiOutlinePaperAirplane, HiOutlineStar } from 'react-icons/hi'
import ThemeToggle from '../components/ThemeToggle'
import PageHeader from '../components/PageHeader'
import { HiOutlineBuildingOffice, HiOutlineBuildingOffice2 } from 'react-icons/hi2'

const categories = [
  'All Services',
  'BANK',
  'EDUCATION',
  'GP',
  'HOSPITAL',
  'LOCAL COUNCIL',
  'MOBILE',
  'TRANSPORT',
]

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase()
  if (cat === 'bank') return <HiOutlineOfficeBuilding />
  if (cat === 'education') return <HiOutlineAcademicCap />
  if (cat === 'gp') return <HiOutlineBuildingOffice2 />
  if (cat === 'hospital') return <HiOutlineBuildingOffice />
  if (cat === 'local council') return <HiOutlineBuildingOffice />
  if (cat === 'mobile') return <HiOutlineDeviceMobile />
  if (cat === 'transport') return <HiOutlineTruck />
  return <HiOutlineLocationMarker />
}

const getCategoryDisplayName = (category: string) => {
  const cat = category.toLowerCase()
  if (cat === 'gp') return 'GP'
  if (cat === 'bank') return 'Bank'
  if (cat === 'mobile') return 'Mobile'
  if (cat === 'accommodation') return 'Accommodation'
  if (cat === 'transport') return 'Transport'
  if (cat === 'community') return 'Community'
  if (cat === 'other') return 'Other'
  return category
}

export default function LocalServices() {
  const navigate = useNavigate()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All Services')
  const [searchQuery, setSearchQuery] = useState('')
  const [city, setCity] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadServices()
  }, [selectedCategory, searchQuery, city])

  const loadServices = async () => {
    try {
      setLoading(true)
      setError(null)
      const category = selectedCategory === 'All Services' ? undefined : selectedCategory.toUpperCase()
      const q = searchQuery.trim() || undefined
      const cityValue = city.trim() || undefined
      const data = await fetchServices(cityValue, category, q)
      setServices(data)
    } catch (err) {
      console.error('Failed to load services', err)
      setError('Unable to load services. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGetDirections = (service: Service) => {
    // Open in Google Maps
    const address = service.address || `${service.name} ${service.city || 'London'}`
    const query = encodeURIComponent(address)
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
  }

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  return (
    <div className="local-services-page">
      <PageHeader
        title="Local Services"
        subtitle="Find essential services and amenities near you"
        showBackButton={true}
        backButtonPath="/dashboard"
        rightContent={<ThemeToggle />}
        className="local-services"
      />

      <main className="local-services-main">
        <div className="local-services-container">
          <div className="local-services-search-section">
            <div className="search-inputs">
              <div className="search-input-wrapper">
                <HiOutlineSearch className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search for services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="search-input-wrapper">
                <HiOutlineLocationMarker className="location-icon-input" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Enter your city (e.g., London)"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            <div className="category-filters">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`category-filter-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                > 
                {getCategoryIcon(category)}
                  {category}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          {loading ? (
            <div className="loading-message">Loading services...</div>
          ) : (
            <div className="services-grid">
              {services.length === 0 ? (
                <p className="no-services">No services found. Try adjusting your search or filters.</p>
              ) : (
                services.map((service, index) => {
                  // Use dummy data for missing fields to maintain design
                  const address = service.address || `${index + 1}${index === 0 ? '23' : index === 1 ? '56' : '89'} ${getCategoryDisplayName(service.category)} Street, ${service.city || 'London'} ${index === 0 ? 'EC1A 1BB' : index === 1 ? 'EC1A 2CC' : 'EC1A 3DD'}`
                  const phone = service.phone || `020 ${1234 + index} ${5678 + index}`
                  const hours = index === 2 ? '24/7 Emergency' : index === 3 ? 'Daily 7:00-23:00' : index % 2 === 0 ? 'Mon-Fri 8:00-18:00' : 'Mon-Fri 9:00-17:00'
                  const rating = 4.5 - (index * 0.1) + (Math.random() * 0.2) // Vary ratings between 4.0-4.7
                  const distance = 0.5
                  
                  return (
                    <div key={service.id} className="service-card">
                      <div className="service-card-header">
                        <div className="service-icon">{getCategoryIcon(service.category)}</div>
                        <div className="service-header-info">
                          <h3 className="service-name">{service.name}</h3>
                          <div className="service-category-rating">
                            <span className="service-category">{getCategoryDisplayName(service.category)}</span>
                            <span className="service-rating"><HiOutlineStar /> {rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="service-distance-badge">{distance} miles</div>
                      </div>
                      <div className="service-details">
                        <div className="service-detail-item">
                          <HiOutlineLocationMarker className="service-detail-label" />
                          <span className="service-detail-value">{address}</span>
                        </div>
                        <div className="service-detail-item">
                          <HiOutlineDeviceMobile className="service-detail-label" />
                          <span className="service-detail-value">{phone}</span>
                        </div>
                        <div className="service-detail-item">
                          <HiOutlineClock className="service-detail-label" />
                          <span className="service-detail-value">{hours}</span>
                        </div>
                        <p className="service-description">{service.description}</p>
                      </div>
                      <div className="service-actions">
                        <button
                          className="service-directions-btn"
                          onClick={() => handleGetDirections(service)}
                        >
                          <HiOutlinePaperAirplane />
                          Get Directions
                        </button>
                        <button
                          className="service-call-btn"
                          onClick={() => handleCall(phone)}
                          aria-label="Call"
                        >
                          📞
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
