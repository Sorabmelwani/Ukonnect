import { useState, useEffect } from 'react'
import {
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineBell,
  HiOutlineTrash,
  HiOutlineCamera,
  HiOutlineSave,
  HiOutlineLockClosed
} from 'react-icons/hi'
import {
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineComputerDesktop
} from 'react-icons/hi2'
import { fetchProfile, updateProfile, fetchSettings, updateSettings, type Profile } from '../api/profile'
import { NATIONALITIES, UK_CITIES, VISA_TYPES } from '../constants/formOptions'
import { useTheme } from '../contexts/ThemeContext'
import ThemeToggle from '../components/ThemeToggle'
import PageHeader from '../components/PageHeader'

export default function ProfileSettings() {
  const { theme, setTheme } = useTheme()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  // Form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [nationality, setNationality] = useState('')
  const [city, setCity] = useState('')
  const [visaType, setVisaType] = useState('')

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  // Privacy & Security
  const [profileVisible, setProfileVisible] = useState(true)
  const [showNationality, setShowNationality] = useState(true)
  const [showLocation, setShowLocation] = useState(true)

  useEffect(() => {
    loadProfile()
    loadSettings()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const { email, profile: profileData } = await fetchProfile()
      setProfile(profileData)
      setFullName(profileData.fullName)
      setEmail(email || '')
      setNationality(profileData.nationality)
      setCity(profileData.city)
      setVisaType(profileData.visaType)
    } catch (err) {
      console.error('Failed to load profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadSettings = async () => {
    try {
      const settings = await fetchSettings()
      setEmailNotifications(settings.notifications.email)
      setPushNotifications(settings.notifications.push)
      setProfileVisible(settings.privacy.profileVisible)
      setShowNationality(settings.privacy.showNationality)
      setShowLocation(settings.privacy.showLocation)
    } catch (err) {
      console.error('Failed to load settings:', err)
      setMessage({ type: 'error', text: 'Failed to load settings. Please refresh the page.' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleSaveChanges = async () => {
    try {
      const updatedProfile = await updateProfile({
        fullName,
        nationality,
        city,
        visaType
      })
      setProfile(updatedProfile)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      console.error('Failed to save changes:', err)
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleToggleChange = async (
    toggleType: 'email' | 'push' | 'profileVisible' | 'showNationality' | 'showLocation',
    value: boolean
  ) => {
    // Update local state immediately for better UX
    switch (toggleType) {
      case 'email':
        setEmailNotifications(value)
        break
      case 'push':
        setPushNotifications(value)
        break
      case 'profileVisible':
        setProfileVisible(value)
        break
      case 'showNationality':
        setShowNationality(value)
        break
      case 'showLocation':
        setShowLocation(value)
        break
    }

    // Update settings on backend
    try {
      await updateSettings({
        notificationEmail: toggleType === 'email' ? value : emailNotifications,
        notificationPush: toggleType === 'push' ? value : pushNotifications,
        profileVisible: toggleType === 'profileVisible' ? value : profileVisible,
        showNationality: toggleType === 'showNationality' ? value : showNationality,
        showLocation: toggleType === 'showLocation' ? value : showLocation,
      })
    } catch (err) {
      console.error('Failed to update settings:', err)
      // Revert local state on error
      switch (toggleType) {
        case 'email':
          setEmailNotifications(!value)
          break
        case 'push':
          setPushNotifications(!value)
          break
        case 'profileVisible':
          setProfileVisible(!value)
          break
        case 'showNationality':
          setShowNationality(!value)
          break
        case 'showLocation':
          setShowLocation(!value)
          break
      }
      setMessage({ type: 'error', text: 'Failed to update settings. Please try again.' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // TODO: Implement delete account API call
      console.log('Deleting account...')
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }


  if (loading) {
    return <div className="profile-settings">Loading...</div>
  }

  return (
    <div className="profile-settings">
      <PageHeader
        title="Profile Settings"
        subtitle="Manage your account preferences and privacy settings"
        showBackButton={true}
        backButtonPath="/dashboard"
        rightContent={<ThemeToggle />}
        className="profile-settings"
      />

      <main className="profile-settings-main">
        {message && (
          <div className={`profile-settings-message ${message.type}`}>
            {message.text}
          </div>
        )}
        <div className="profile-settings-container">
          {/* Left Column - Profile Summary */}
          <div className="profile-settings-left">
            <section className="profile-summary-card">
              <div className="profile-picture-container">
                <div className="profile-picture">
                  {profile?.fullName ? getInitials(profile.fullName) : 'U'}
                </div>
                <button className="profile-picture-edit-btn" title="Change profile picture">
                  <HiOutlineCamera />
                </button>
              </div>
              <h2 className="profile-summary-name">{profile?.fullName || 'User'}</h2>
              <p className="profile-summary-email">{email || 'user@example.com'}</p>
            </section>
          </div>

          {/* Right Column - Settings Sections */}
          <div className="profile-settings-right">
            {/* Personal Information */}
            <section className="profile-settings-card">
              <div className="profile-settings-card-header">
                <HiOutlineUser className="profile-settings-card-icon" />
                <h2 className="profile-settings-card-title">Personal Information</h2>
              </div>
              <p className="profile-settings-card-subtitle">Update your personal details and settlement information</p>
              <div className="profile-settings-form">
                <div className="profile-settings-form-row">
                  <div className="profile-settings-form-group">
                    <label className="profile-settings-label">Full Name</label>
                    <input
                      type="text"
                      className="profile-settings-input"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="profile-settings-form-group">
                    <label className="profile-settings-label">Email Address</label>
                    <input
                      type="email"
                      className="profile-settings-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled
                    />
                  </div>
                </div>
                <div className="profile-settings-form-row">
                  <div className="profile-settings-form-group">
                    <label className="profile-settings-label">Nationality</label>
                    <select
                      className="profile-settings-input"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                    >
                      <option value="">Select your nationality</option>
                      {NATIONALITIES.map((nationality) => (
                        <option key={nationality} value={nationality}>
                          {nationality}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="profile-settings-form-group">
                    <label className="profile-settings-label">UK City</label>
                    <select
                      className="profile-settings-input"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    >
                      <option value="">Select city</option>
                      {UK_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="profile-settings-form-row">
                  <div className="profile-settings-form-group">
                    <label className="profile-settings-label">Visa Type</label>
                    <select
                      className="profile-settings-input"
                      value={visaType}
                      onChange={(e) => setVisaType(e.target.value)}
                    >
                      <option value="">Select visa type</option>
                      {VISA_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button className="profile-settings-save-btn" onClick={handleSaveChanges}>
                  <HiOutlineSave className="profile-settings-save-icon" />
                  Save Changes
                </button>
              </div>
            </section>

            {/* Appearance */}
            <section className="profile-settings-card">
              <div className="profile-settings-card-header">
                <HiOutlineCog className="profile-settings-card-icon" />
                <h2 className="profile-settings-card-title">Appearance</h2>
              </div>
              <p className="profile-settings-card-subtitle">Customize the appearance of the application</p>
              <div className="theme-selector">
                <button
                  className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  <HiOutlineSun className="theme-icon" />
                  Light
                </button>
                <button
                  className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  <HiOutlineMoon className="theme-icon" />
                  Dark
                </button>
                <button
                  className={`theme-btn ${theme === 'system' ? 'active' : ''}`}
                  onClick={() => setTheme('system')}
                >
                  <HiOutlineComputerDesktop className="theme-icon" />
                  System
                </button>
              </div>
            </section>

            {/* Notifications */}
            <section className="profile-settings-card">
              <div className="profile-settings-card-header">
                <HiOutlineBell className="profile-settings-card-icon" />
                <h2 className="profile-settings-card-title">Notifications</h2>
              </div>
              <p className="profile-settings-card-subtitle">Choose what notifications you want to receive</p>
              <div className="profile-settings-toggles">
                <div className="profile-settings-toggle-item">
                  <div className="toggle-label-group">
                    <label className="toggle-label">Email</label>
                    <span className="toggle-description">Receive notifications via email</span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => handleToggleChange('email', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="profile-settings-toggle-item">
                  <div className="toggle-label-group">
                    <label className="toggle-label">Push</label>
                    <span className="toggle-description">Browser push notifications</span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={pushNotifications}
                      onChange={(e) => handleToggleChange('push', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </section>

            {/* Privacy & Security */}
            <section className="profile-settings-card">
              <div className="profile-settings-card-header">
                <HiOutlineLockClosed className="profile-settings-card-icon" />
                <h2 className="profile-settings-card-title">Privacy & Security</h2>
              </div>
              <p className="profile-settings-card-subtitle">Control your privacy and security settings</p>
              <div className="profile-settings-toggles">
                <div className="profile-settings-toggle-item">
                  <div className="toggle-label-group">
                    <label className="toggle-label">Profile Visible</label>
                    <span className="toggle-description">Make your profile visible to other users</span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={profileVisible}
                      onChange={(e) => handleToggleChange('profileVisible', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="profile-settings-toggle-item">
                  <div className="toggle-label-group">
                    <label className="toggle-label">Show Nationality</label>
                    <span className="toggle-description">Display your nationality on your profile</span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={showNationality}
                      onChange={(e) => handleToggleChange('showNationality', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="profile-settings-toggle-item">
                  <div className="toggle-label-group">
                    <label className="toggle-label">Show Location</label>
                    <span className="toggle-description">Display your city on your profile</span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={showLocation}
                      onChange={(e) => handleToggleChange('showLocation', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </section>

            {/* Danger Zone */}
            <section className="profile-settings-card danger-zone">
              <div className="profile-settings-card-header">
                <HiOutlineTrash className="profile-settings-card-icon danger-icon" />
                <h2 className="profile-settings-card-title">Danger Zone</h2>
              </div>
              <p className="profile-settings-card-subtitle">Irreversible and destructive actions</p>
              <button className="profile-settings-delete-btn" onClick={handleDeleteAccount}>
                <HiOutlineTrash className="profile-settings-delete-icon" />
                Delete Account
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
