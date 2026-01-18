import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchDashboard, generateTasks, updateTaskStatus, type DashboardTask, type DashboardData } from '../api/dashboard'
import { HiOutlineUser, HiOutlineLocationMarker, HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineX } from 'react-icons/hi'
import { FiSearch, FiFolder, FiHeart, FiSettings } from 'react-icons/fi'
import ThemeToggle from '../components/ThemeToggle'
import PageHeader from '../components/PageHeader'
import Chatbot from '../components/Chatbot'

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set())
  const tasksGeneratedRef = useRef(false)

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchDashboard()
      setData(result)
    } catch (err) {
      console.error('Failed to load dashboard', err)
      setError('Unable to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initializeDashboard = async () => {
      // Generate tasks once before loading dashboard
      if (!tasksGeneratedRef.current) {
        try {
          await generateTasks()
          tasksGeneratedRef.current = true
        } catch (err) {
          console.error('Failed to generate tasks', err);
        }
      }
      
      // Load dashboard data after tasks are generated
      await loadDashboard()
    }

    initializeDashboard()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('authToken')
    navigate('/login')
  }

  const handleTaskStatusToggle = async (task: DashboardTask) => {
    try {
      const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
      await updateTaskStatus(task.id, newStatus)
      // Refresh dashboard data after status update
      await loadDashboard()
    } catch (err) {
      console.error('Failed to update task status', err)
      setError('Failed to update task status. Please try again.')
    }
  }

  const totalTasks = data?.total ?? 0
  const completedTasks = data?.completed ?? 0
  const progressPercent =
    totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : Math.round((data?.completionRate ?? 0) * 100)
  const tasks = data?.upcoming ?? []
  // only pick incomplete tasks in next priority
  const nextPriority = tasks.filter((task: DashboardTask) => task.status !== 'COMPLETED').sort((a: DashboardTask, b: DashboardTask) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())[0] || null
  const profile = data?.profile

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return ''
    const dueDate = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'day' : 'days'}`
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due in 1 day'
    return `Due in ${diffDays} days`
  }

  const isTaskDueToday = (task: DashboardTask) => {
    if (!task.dueAt) return false
    const dueDate = new Date(task.dueAt)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate.getTime() === today.getTime()
  }

  const tasksDueToday = tasks.filter(
    (task: DashboardTask) => 
      isTaskDueToday(task) && 
      task.status !== 'COMPLETED' && 
      !dismissedNotifications.has(task.id)
  )

  const handleDismissNotification = (taskId: string) => {
    setDismissedNotifications(prev => new Set([...prev, taskId]))
  }

  const getPriorityClass = (priority: string) => {
    const priorityUpper = priority.toUpperCase()
    if (priorityUpper === 'HIGH') return 'pill-priority-high'
    if (priorityUpper === 'MEDIUM') return 'pill-priority-medium'
    if (priorityUpper === 'LOW') return 'pill-priority-low'
    return 'pill-priority-medium' // default
  }

  return (
    <div className="dashboard">
      {tasksDueToday.length > 0 && (
        <div className="dashboard-notification-container">
          {tasksDueToday.map((task: DashboardTask) => (
            <div key={task.id} className="dashboard-notification">
              <div className="dashboard-notification-content">
                <HiOutlineClock className="dashboard-notification-icon" />
                <div className="dashboard-notification-text">
                  <strong>{task.title}</strong>
                  <span>Due today</span>
                </div>
              </div>
              <button 
                className="dashboard-notification-close"
                onClick={() => handleDismissNotification(task.id)}
                aria-label="Dismiss notification"
              >
                <HiOutlineX />
              </button>
            </div>
          ))}
        </div>
      )}

      <PageHeader
        title={`Welcome ${profile?.fullName}!`}
        subtitle="Your personalized settlement dashboard"
        rightContent={
          <>
            <div className="dashboard-progress-summary">
              <span>Progress</span>
              <strong>{progressPercent}%</strong>
            </div>
            <ThemeToggle />
            <button className="dashboard-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        }
        className="dashboard"
      />

      {error && <p className="auth-error">{error}</p>}

      <main className="dashboard-main">
        <div className="dashboard-top-cards">
          <section className="dashboard-card">
            <h2 className="profile-header">
              <HiOutlineUser className="profile-icon" />
              Your Profile
            </h2>
            {profile ? (
              <div className="profile-list">
                <div className="profile-item">
                  <span className="profile-label">Visa Type:</span>
                  <span className="profile-value profile-pill">{profile.visaType}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-label">Purpose:</span>
                  <span className="profile-value">{profile.purpose}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-label">Nationality:</span>
                  <span className="profile-value">{profile.nationality}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-label">Location:</span>
                  <span className="profile-value">
                    <HiOutlineLocationMarker className="location-icon" />
                    {profile.city}
                  </span>
                </div>
              </div>
            ) : (
              <p className="dashboard-checklist-subtitle">Profile data not available</p>
            )}
          </section>

          <section className="dashboard-card dashboard-progress-card">
            <h2>Settlement Progress</h2>
            <p className="dashboard-progress-meta">
              <span>Tasks Completed</span>
              <span>
                <strong>{completedTasks}</strong>/{totalTasks}
              </span>
            </p>
            <div className="dashboard-progress-bar">
              <div
                className="dashboard-progress-bar-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="dashboard-progress-remaining">
              {totalTasks - completedTasks} tasks remaining
            </p>
          </section>

          <section className="dashboard-card dashboard-next-priority">
            <h2 className="next-priority-header">
              <HiOutlineClock className="next-priority-icon" />
              Next Priority
            </h2>
            {nextPriority ? (
              <>
                <p className="next-priority-title">{nextPriority.title}</p>
                <p className="next-priority-due">{formatDueDate(nextPriority.dueAt)}</p>
                <span className={`pill ${getPriorityClass(nextPriority.priority)} next-priority-pill`}>
                  {nextPriority.priority.toLowerCase()} priority
                </span>
              </>
            ) : (
              <p className="dashboard-checklist-subtitle">No upcoming tasks yet.</p>
            )}
          </section>
        </div>

        <section className="dashboard-card dashboard-checklist">
          <h2>Your Settlement Checklist</h2>
          <p className="dashboard-checklist-subtitle">
            Complete these tasks to successfully settle in the UK. Tasks are prioritised based on your profile.
          </p>

          <div className="checklist-list">
            {tasks.length === 0 && <p className="dashboard-checklist-subtitle">No tasks available.</p>}
            {tasks.map((task: DashboardTask) => {
              const isCompleted = task.status === 'COMPLETED'
              return (
                <article key={task.id} className="checklist-item">
                  <div className="checklist-left">
                    <div className="checklist-icon">
                      {isCompleted ? <HiOutlineCheckCircle /> : <HiOutlineXCircle />}
                    </div>
                    <div>
                      <h3 className="checklist-title">
                        {task.url ? (
                          <a
                            href={task.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="checklist-title-link"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {task.title}
                          </a>
                        ) : (
                          task.title
                        )}{' '}
                        <span className={`pill ${getPriorityClass(task.priority)}`}>{task.priority.toLowerCase()}</span>
                      </h3>
                      <p className="checklist-description">{task.description}</p>
                      <div className="checklist-meta">
                        <span>{formatDate(task.dueAt)}</span>
                        <span className="pill pill-category">{task.category}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    className={`checklist-complete-btn ${isCompleted ? 'completed' : ''}`}
                    onClick={() => handleTaskStatusToggle(task)}
                    disabled={loading}
                  >
                    {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                  </button>
                </article>
              )
            })}
          </div>
        </section>
      </main>

      <nav className="dashboard-bottom-nav">
        <button onClick={() => navigate('/local-services')}>
          <FiSearch className="nav-icon" />
          <span>Local Services</span>
        </button>
        <button onClick={() => navigate('/document-manager')}>
          <FiFolder className="nav-icon" />
          <span>Document Manager</span>
        </button>
        <button onClick={() => navigate('/community-hub')}>
          <FiHeart className="nav-icon" />
          <span>Community Hub</span>
        </button>
        <button onClick={() => navigate('/profile-settings')}>
          <FiSettings className="nav-icon" />
          <span>Profile Settings</span>
        </button>
      </nav>

      <Chatbot />
    </div>
  )
}

