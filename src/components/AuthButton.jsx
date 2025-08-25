import { useAuth } from '../context/AuthContext'

function AuthButton() {
  const { isLoggedIn, logout, setShowAuthModal } = useAuth()

  return (
    <button 
      className="auth-button"
      onClick={isLoggedIn ? logout : () => setShowAuthModal(true)}
    >
      {isLoggedIn ? 'Logout' : 'Login'}
    </button>
  )
}

export default AuthButton


