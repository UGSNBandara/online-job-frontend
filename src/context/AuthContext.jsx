import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        setUser({ ...parsed, id: parsed.id || parsed._id })
        setShowAuthModal(false)
      } catch (_) {
        setUser(null)
      }
    }
    if (!storedUser) {
      setShowAuthModal(true)
    }
  }, [])

  const login = (nextUser) => {
    const normalized = { ...nextUser, id: nextUser.id || nextUser._id }
    setUser(normalized)
    localStorage.setItem('user', JSON.stringify(normalized))
    setShowAuthModal(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    setShowAuthModal(true)
  }

  useEffect(() => {
    if (user) {
      setShowAuthModal(false)
    } else {
      setShowAuthModal(true)
    }
  }, [user])

  const value = {
    user,
    isLoggedIn: !!user,
    login,
    logout,
    showAuthModal,
    setShowAuthModal,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}


