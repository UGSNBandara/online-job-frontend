import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { MessageProvider } from './context/MessageContext'
import { AuthProvider } from './context/AuthContext'
import ChatContainer from './components/ChatContainer'

// Layouts
import MainLayout from './layouts/MainLayout'

// Pages
import HomePage from './pages/HomePage'
import UserProfilePage from './pages/UserProfilePage'
import UserProfileViewPage from './pages/UserProfileViewPage'
import Test from './pages/test'
import AuthModal from './components/AuthModal'

import './App.css'

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <MessageProvider>
          <div className="app">
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="profile" element={<UserProfilePage />} />
                <Route path="profile/:userId" element={<UserProfileViewPage />} />
                <Route path="/test" element={<Test/>}/>
              </Route>
            </Routes>
            <AuthModal />
          </div>
        </MessageProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
