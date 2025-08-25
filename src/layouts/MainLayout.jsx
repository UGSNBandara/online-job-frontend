import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import LeftSidebar from '../components/LeftSidebar'
import RightSidebar from '../components/RightSidebar'
import ChatOverlay from '../components/ChatOverlay'
import { useMessage } from '../context/MessageContext'

function MainLayout() {
  const { selectedChat, showChat, setShowChat } = useMessage()  

  return (
    <div className="main-layout">
      <Header />
      <div className="content-wrapper">
        <div className="main-container">
          <aside className="left-sidebar">
            <LeftSidebar />
          </aside>
          <main className="main-content">
            <Outlet />
          </main>
          <aside className="right-sidebar">
            <RightSidebar />
          </aside>
        </div>
        {showChat && selectedChat && (
          <ChatOverlay 
            chat={selectedChat} 
            onClose={() => setShowChat(false)} 
          />
        )}
      </div>
    </div>
  )
}

export default MainLayout 