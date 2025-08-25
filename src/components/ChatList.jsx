import { useState, useEffect } from 'react';
import { useMessage } from '../context/MessageContext';
import axios from 'axios';
import { API_URL } from '../config';
import { Box, Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

// API_URL from config

const StyledListItem = styled(ListItem)(({ theme }) => ({
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  padding: theme.spacing(2),
}));

const LastMessageText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '200px',
}));

function ChatList({ onSelectChat }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUserId } = useMessage();

  //loading conversation on mount
  useEffect(() => {
    // Use currentUserId from context (no auth)
    if (!currentUserId) {
      setError('Please login to view messages.');
      setLoading(false);
      return;
    }
    loadConversations(currentUserId);
    
    // Set up polling to refresh conversations every 3 seconds
    const interval = setInterval(() => {
      if (currentUserId) {
        loadConversations(currentUserId);
      }
    }, 3000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [currentUserId]);

  const loadConversations = async (userId) => {
    try {
      setLoading(true);
      console.log('Fetching conversations for user:', userId); // Debug log
      const response = await axios.get(`${API_URL}/messages/user/${userId}`);

      // Process messages to create unique conversations
      const conversationMap = new Map();
      response.data.forEach(message => {
        // API populates sender_id and receiver_id with user docs
        const otherUserDoc = message.sender_id === userId ? message.receiver_id : message.sender_id;
        const otherUserId = otherUserDoc?._id || otherUserDoc?.id || otherUserDoc;
        const otherUser = otherUserDoc;
        
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            id: otherUserId,
            user: otherUser,
            lastMessage: message.message_text,
            timestamp: message.created_at,
            unread: false //hardcoded.. can be exapnd to change dynamically 
          });
        }
      }); //for each message check and get the other user id and other user name. then add the
      //relevant data ti the conversationMap.
      //one user add only one time and the latest message will be added. 
      // this geting done by checking !conversationMap.has(otherUserId). 

      setConversations(Array.from(conversationMap.values())); //set the conversation list
      setError(null);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      <Typography variant="h6" sx={{ p: 2 }}>
        Messages
      </Typography>
      <List>
        {conversations.length === 0 ? (
          <ListItem>
            <ListItemText primary="No messages yet" />
          </ListItem>
        ) : (
          conversations.map((conversation) => (
            <div key={conversation.id}>
              <StyledListItem onClick={() => onSelectChat(conversation)}>
                <ListItemAvatar>
                  <Avatar
                    src={conversation.user?.profileImage ? `${API_URL}/media/${conversation.user.profileImage}` : '/default_profile.jpg'}
                    alt={`${conversation.user.firstName} ${conversation.user.lastName}`}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={`${conversation.user.firstName} ${conversation.user.lastName}`}
                  secondary={
                    <LastMessageText>
                      {conversation.lastMessage}
                    </LastMessageText>
                  }
                />
              </StyledListItem>
              <Divider variant="inset" component="li" />
            </div>
          ))
        )}
      </List>
    </Box>
  );
}

//pre-built UI components imported from Material-UI (MUI),
// a popular React component library that follows Google's Material Design guidelines.

export default ChatList; 