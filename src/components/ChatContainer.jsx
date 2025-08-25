import { useMessage } from '../context/MessageContext';
import RightSidebar from './RightSidebar';
import ChatOverlay from './ChatOverlay';
import { Box } from '@mui/material';

function ChatContainer() {
  const { selectedChat, showChat, setShowChat } = useMessage();

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Box sx={{ width: '300px', borderRight: 1, borderColor: 'divider' }}>
        <RightSidebar />
      </Box>
      {showChat && selectedChat && (
        <Box sx={{ flex: 1, position: 'relative' }}>
          <ChatOverlay
            chat={selectedChat}
            onClose={() => setShowChat(false)}
          />
        </Box>
      )}
    </Box>
  );
}

export default ChatContainer; 