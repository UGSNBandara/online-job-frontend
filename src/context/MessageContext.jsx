import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'

const MessageContext = createContext()

export function MessageProvider({ children }) {
  const [selectedChat, setSelectedChat] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)
  const { user } = useAuth?.() || { user: null }
  const [profileRefreshToken, setProfileRefreshToken] = useState(0)

  const triggerProfileRefresh = () => {
    setProfileRefreshToken(prev => prev + 1)
  }

  useEffect(() => {
    if (user?.id) {
      setCurrentUserId(user.id)
    } else {
      setCurrentUserId(null)
    }
  }, [user?.id])

  const selectChat = (chat) => {
    console.log('Selecting chat:', chat)
    setSelectedChat(chat)
    setShowChat(true)
  }

  return (
    <MessageContext.Provider
      value={{
        selectedChat,
        showChat,
        setShowChat,
        selectChat,
        currentUserId,
        setCurrentUserId,
        profileRefreshToken,
        triggerProfileRefresh,
      }}
    >
      {children}
    </MessageContext.Provider>
  )
}

export function useMessage() {
  const context = useContext(MessageContext)
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider')
  }
  return context
} 

//A convenience hook so components can easily access MessageContext without calling useContext(MessageContext) everywhere.

//Also throws an error if you try to use it outside of a MessageProvider, which helps catch bugs.