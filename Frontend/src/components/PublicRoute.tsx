import { Navigate } from 'react-router-dom'

interface PublicRouteProps {
  children: React.ReactNode
}

export default function PublicRoute({ children }: PublicRouteProps) {
  // Check if user is already authenticated
  const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('authToken')
  
  if (accessToken) {
    // Redirect to dashboard if already logged in
    return <Navigate to="/dashboard" replace />
  }
  
  // Render public content if not authenticated
  return <>{children}</>
}

