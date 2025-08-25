import { useState, useEffect } from 'react';
import { Box, List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Divider, CircularProgress } from '@mui/material';
import { useMessage } from '../context/MessageContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

function RightSidebar() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { selectChat, currentUserId } = useMessage();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      if (!currentUserId) {
        setChats([])
        setLoading(false)
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${API_URL}/messages/user/${currentUserId}`);
        
        console.log('Chats response:', response);
        
        if (response.data && Array.isArray(response.data)) {
          // Process messages to create unique conversations
          const conversationMap = new Map();
          
          response.data.forEach(message => {
            // Determine the other user in the conversation (populated fields)
            const isCurrentSender = (message.sender_id?._id || message.sender_id) === currentUserId
            const otherUser = isCurrentSender ? message.receiver_id : message.sender_id;
            
            if (!conversationMap.has(otherUser._id || otherUser.id)) {
              conversationMap.set(otherUser._id || otherUser.id, {
                id: otherUser._id || otherUser.id,
                participant: otherUser,
                lastMessage: message.message_text,
                timestamp: message.created_at
              });
            }
          });
          
          setChats(Array.from(conversationMap.values()));
        } else {
          setChats([]);
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
        setError('Failed to load messages. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [currentUserId]);

  const handleChatSelect = (chat) => {
    console.log('Chat selected:', chat);
    selectChat(chat);
  };

  const handleProfileClick = (userId, event) => {
    event.stopPropagation(); // Prevent chat selection when clicking profile
    navigate(`/profile/${userId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" sx={{ p: 2 }}>
        Messages
      </Typography>
      <Divider />
      <List>
        {chats.length === 0 ? (
          <ListItem>
            <ListItemText primary="No messages yet" />
          </ListItem>
        ) : (
          chats.map((chat) => (
            <ListItem
              key={chat.id}
              button
              onClick={() => handleChatSelect(chat)}
              sx={{ cursor: 'pointer' }}
            >
              <ListItemAvatar>
                <Avatar
                  src={chat.participant?.profileImage ? `${API_URL}/media/${chat.participant.profileImage}` : '/default_profile.jpg'}
                  alt={`${chat.participant?.firstName} ${chat.participant?.lastName}`}
                  onClick={(e) => handleProfileClick(chat.participant.id || chat.participant._id, e)}
                  sx={{ cursor: 'pointer' }}
                />
              </ListItemAvatar>
              <ListItemText
                primary={`${chat.participant?.firstName} ${chat.participant?.lastName}`}
                secondary={chat.lastMessage || 'No messages yet'}
              />
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
}

export default RightSidebar; 