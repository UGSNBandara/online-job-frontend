import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { API_URL } from '../config'

function AuthModal() {
  const { login, showAuthModal, setShowAuthModal } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'applicant'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const endpoint = isLogin ? `${API_URL}/users/login` : `${API_URL}/users/register`
      const response = await axios.post(endpoint, formData)
      const { user, message } = response.data
      if (user) {
        login(user)
      }
      setSuccess(message || (isLogin ? 'Logged in' : 'Registered'))
      setFormData({ email: '', password: '', firstName: '', lastName: '', role: 'applicant' })
      setShowAuthModal(false)
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred')
    } finally {
      setLoading(false)
      setSuccess('')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const toggleForm = () => {
    setIsLogin(!isLogin)
    setError('')
    setSuccess('')
  }

  if (!showAuthModal) return null

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <div className="auth-modal-header">
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{isLogin ? 'Please sign in to continue' : 'Please fill in your details to register'}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="name-fields">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="Enter your first name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="role">I want to register as</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="form-control"
                >
                  <option value="applicant">Job Seeker</option>
                  <option value="recruiter">Recruiter</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="auth-modal-footer">
            <button type="submit" className="primary" disabled={loading}>
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
            
            <div className="switch-form">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button type="button" onClick={toggleForm} disabled={loading}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AuthModal


