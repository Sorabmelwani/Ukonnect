import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchDashboard, generateTasks, updateTaskStatus, type DashboardTask, type DashboardData } from '../api/dashboard'
import { HiOutlineUser, HiOutlineLocationMarker, HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineX, HiOutlineDocumentText } from 'react-icons/hi'
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
  const [notesPopupOpen, setNotesPopupOpen] = useState(false)
  const [viewNotePopupOpen, setViewNotePopupOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [selectedTaskNote, setSelectedTaskNote] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')

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
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    
    // If marking incomplete, delete note and update normally
    if (newStatus === 'PENDING') {
      try {
        // Optimistic update - delete note
        if (data) {
          setData({
            ...data,
            upcoming: data.upcoming.map(t => 
              t.id === task.id 
                ? { ...t, status: 'PENDING', completedAt: null, notes: null }
                : t
            ),
            completed: Math.max(0, data.completed - 1),
            pending: data.pending + 1
          })
        }
        await updateTaskStatus(task.id, newStatus, null)
        await loadDashboard()
      } catch (err) {
        console.error('Failed to update task status', err)
        setError('Failed to update task status. Please try again.')
        await loadDashboard() // Revert on error
      }
      return
    }

    // If marking complete, do optimistic update then show popup
    try {
      // Optimistic update - mark as complete immediately
      if (data) {
        setData({
          ...data,
          upcoming: data.upcoming.map(t => 
            t.id === task.id 
              ? { 
                  ...t, 
                  status: 'COMPLETED', 
                  completedAt: new Date().toISOString() 
                }
              : t
          ),
          completed: data.completed + 1,
          pending: Math.max(0, data.pending - 1)
        })
      }
      
      // Update in backend
      await updateTaskStatus(task.id, 'COMPLETED')
      
      // Show notes popup
      setSelectedTaskId(task.id)
      setNoteText('')
      setNotesPopupOpen(true)
    } catch (err) {
      console.error('Failed to update task status', err)
      setError('Failed to update task status. Please try again.')
      await loadDashboard() // Revert on error
    }
  }

  const handleSaveNote = async () => {
    if (!selectedTaskId || !noteText.trim()) return
    
    try {
      await updateTaskStatus(selectedTaskId, 'COMPLETED', noteText.trim())
      await loadDashboard()
      setNotesPopupOpen(false)
      setSelectedTaskId(null)
      setNoteText('')
    } catch (err) {
      console.error('Failed to save note', err)
      setError('Failed to save note. Please try again.')
    }
  }

  const handleClosePopup = () => {
    setNotesPopupOpen(false)
    setSelectedTaskId(null)
    setNoteText('')
  }

  const handleViewNote = (task: DashboardTask) => {
    setSelectedTaskNote(task.notes)
    setViewNotePopupOpen(true)
  }

  const handleCloseViewNotePopup = () => {
    setViewNotePopupOpen(false)
    setSelectedTaskNote(null)
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
                  <div className="checklist-actions">
                    {isCompleted && task.notes && (
                      <button
                        className="checklist-view-note-btn"
                        onClick={() => handleViewNote(task)}
                        title="View note"
                      >
                        <HiOutlineDocumentText className="checklist-view-note-icon" />
                        <span>View note</span>
                      </button>
                    )}
                    <button
                      className={`checklist-complete-btn ${isCompleted ? 'completed' : ''}`}
                      onClick={() => handleTaskStatusToggle(task)}
                      disabled={loading}
                    >
                      {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                    </button>
                  </div>
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

      {/* Notes Popup */}
      {notesPopupOpen && (
        <div className="notes-popup-overlay" onClick={handleClosePopup}>
          <div className="notes-popup" onClick={(e) => e.stopPropagation()}>
            <h2 className="notes-popup-title">Task completed</h2>
            <p className="notes-popup-subtitle">Add a note for yourself (optional).</p>
            <input
              type="text"
              className="notes-popup-input"
              placeholder="e.g., GP registered on 12 Jan, my uk number…"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && noteText.trim()) {
                  handleSaveNote()
                }
              }}
            />
            <div className="notes-popup-buttons">
              <button 
                className="notes-popup-btn notes-popup-btn-secondary"
                onClick={handleClosePopup}
              >
                Done
              </button>
              <button
                className="notes-popup-btn notes-popup-btn-primary"
                onClick={handleSaveNote}
                disabled={!noteText.trim()}
              >
                Save note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Note Popup */}
      {viewNotePopupOpen && (
        <div className="notes-popup-overlay" onClick={handleCloseViewNotePopup}>
          <div className="notes-popup notes-popup-view" onClick={(e) => e.stopPropagation()}>
            <h2 className="notes-popup-title">Task Note</h2>
            <div className="notes-popup-note-content">
              {selectedTaskNote}
            </div>
            <div className="notes-popup-buttons">
              <button 
                className="notes-popup-btn notes-popup-btn-primary"
                onClick={handleCloseViewNotePopup}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

