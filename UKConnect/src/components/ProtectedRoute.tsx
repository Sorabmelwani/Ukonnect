import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Check if user has access token (authenticated)
  const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('authToken')
  
  if (!accessToken) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />
  }
  
  // Render protected content if authenticated
  return <>{children}</>
}

