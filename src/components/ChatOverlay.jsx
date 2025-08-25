import { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Typography, TextField, Paper, Avatar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL, API_BASE_URL } from '../config';
import { useMessage } from '../context/MessageContext';

function ChatOverlay({ chat, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { currentUserId } = useMessage();

  const scrollToBottom = (smooth = false) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    if (isInitialLoad) {
      scrollToBottom(true); // Smooth scroll only on initial load
    } else {
      scrollToBottom(false); // Instant scroll for updates
    }
  }, [messages, isInitialLoad]);

  // Fetch user data if not available
  useEffect(() => {
    const fetchUserData = async () => {
      if (chat?.id && (!chat.user || !chat.user.firstName)) {
        try {
          const response = await axios.get(`${API_URL}/users/${chat.id}`);
          setUserData(response.data);
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      } else if (chat?.user) {
        setUserData(chat.user);
      }
    };

    fetchUserData();
  }, [chat?.id, chat?.user]);

  useEffect(() => {
    const fetchMessages = async (isUpdate = false) => {
      if (!chat?.id || !currentUserId) return;

      if (!isUpdate) {
        setLoading(true);
      }
      setError(null);

      try {
        const response = await axios.get(
          `${API_URL}/messages/conversation/${currentUserId}/${chat.id}`
        );

        if (response.data && Array.isArray(response.data)) {
          const sortedMessages = [...response.data].sort((a, b) => 
            new Date(a.created_at) - new Date(b.created_at)
          );
          
          if (isUpdate) {
            // For updates: only add new messages
            const existingMessageIds = new Set(messages.map(m => m._id || m.id));
            const newMessages = sortedMessages.filter(m => {
              const messageId = m._id || m.id;
              // Don't add if it's a temp message or already exists
              return !existingMessageIds.has(messageId) && !messageId.startsWith('temp_');
            });
            
            console.log('Update check - Existing messages:', messages.length);
            console.log('Update check - Fetched messages:', sortedMessages.length);
            console.log('Update check - New messages found:', newMessages.length);
            
            if (newMessages.length > 0) {
              console.log('Adding new messages:', newMessages);
              setMessages(prevMessages => {
                // Create a new Set from current messages to avoid closure issues
                const currentIds = new Set(prevMessages.map(m => m._id || m.id));
                const trulyNewMessages = newMessages.filter(m => {
                  const messageId = m._id || m.id;
                  return !currentIds.has(messageId) && !messageId.startsWith('temp_');
                });
                
                if (trulyNewMessages.length > 0) {
                  const updated = [...prevMessages, ...trulyNewMessages].sort((a, b) => 
                    new Date(a.created_at) - new Date(b.created_at)
                  );
                  console.log('Updated messages count:', updated.length);
                  return updated;
                }
                
                return prevMessages; // No changes
              });
              
              if (newMessages.length > 0) {
                setNewMessageCount(newMessages.length);
                // Auto-scroll to bottom for new messages (instant, no animation)
                setTimeout(() => scrollToBottom(false), 100);
              }
            }
          } else {
            // For initial load: set all messages
            console.log('Initial messages loaded:', sortedMessages);
            setMessages(sortedMessages);
            setIsInitialLoad(false);
          }
        } else {
          console.log('No messages or invalid response:', response.data);
          if (!isUpdate) {
            setMessages([]);
            setIsInitialLoad(false);
          }
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        if (!isUpdate) {
          setError('Failed to load messages. Please try again later.');
        }
      } finally {
        if (!isUpdate) {
          setLoading(false);
        }
      }
    };

    // Initial load
    fetchMessages(false);
    
    // Set up polling to refresh messages every 2 seconds (background updates)
    const interval = setInterval(() => {
      if (chat?.id && currentUserId && !isInitialLoad) {
        fetchMessages(true); // Background update
      }
    }, 2000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [chat?.id, currentUserId, isInitialLoad]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chat?.id) return;

    try {
      // Create a temporary message object for immediate display
      const tempMessage = {
        _id: `temp_${Date.now()}`,
        message_text: newMessage.trim(),
        sender_id: currentUserId,
        receiver_id: chat.id,
        created_at: new Date().toISOString(),
        isTemp: true
      };

      // Add message to UI immediately
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage("");
      
      // Scroll to bottom for new message
      setTimeout(() => scrollToBottom(false), 100);

      // Send to API
      const response = await axios.post(
        `${API_URL}/messages`,
        {
          sender_id: currentUserId,
          receiver_id: chat.id,
          message_text: newMessage.trim()
        }
      );

      if (response.data) {
        // Replace temp message with real message from API
        setMessages(prev => prev.map(msg => 
          msg.isTemp ? response.data : msg
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => !msg.isTemp));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleProfileClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  if (!chat) return null;

  console.log('ChatOverlay - chat object:', chat);
  console.log('ChatOverlay - currentUserId:', currentUserId);
  console.log('ChatOverlay - chat.user:', chat.user);
  console.log('ChatOverlay - chat.user.profileImage:', chat.user?.profileImage);
  console.log('ChatOverlay - chat.user.firstName:', chat.user?.firstName);
  console.log('ChatOverlay - chat.user.lastName:', chat.user?.lastName);

  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        bottom: 20,
        right: 20,
        width: 350,
        height: 500,
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
        "& .new-message-notification": {
          "@keyframes fadeInOut": {
            "0%": { opacity: 0, transform: "translateY(-10px)" },
            "20%": { opacity: 1, transform: "translateY(0)" },
            "80%": { opacity: 1, transform: "translateY(0)" },
            "100%": { opacity: 0, transform: "translateY(-10px)" },
          },
          animation: "fadeInOut 3s ease-in-out",
        },
      }}
    >
      <Box
        sx={{
          p: 2,
          bgcolor: "primary.main",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 1,
            cursor: 'pointer'
          }}
          onClick={() => handleProfileClick(chat.id)}
        >
          <Avatar 
            src={userData?.profileImage ? `${API_URL}/media/${userData.profileImage}` : '/default_profile.jpg'}
            alt={`${userData?.firstName || 'User'} ${userData?.lastName || ''}`}
            sx={{ width: 40, height: 40 }}
          />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {userData?.firstName || 'Unknown'} {userData?.lastName || 'User'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
              {userData?.title || userData?.role || 'User'}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          position: "relative",
        }}
      >
        {newMessageCount > 0 && (
          <Box
            className="new-message-notification"
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              bgcolor: "primary.main",
              color: "white",
              px: 2,
              py: 1,
              borderRadius: "20px",
              fontSize: "0.8rem",
              zIndex: 1,
            }}
          >
            {newMessageCount} new message{newMessageCount > 1 ? 's' : ''}
          </Box>
        )}
        
        {loading ? (
          <Typography variant="body2" color="text.secondary" align="center">
            Loading messages...
          </Typography>
        ) : error ? (
          <Typography variant="body2" color="error" align="center">
            {error}
          </Typography>
        ) : messages.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center">
            No messages yet. Start the conversation!
          </Typography>
        ) : (
          messages.map((message) => {
            // Handle both string IDs and populated user objects
            const messageSenderId = typeof message.sender_id === 'object' ? message.sender_id._id || message.sender_id.id : message.sender_id;
            const isCurrentUser = messageSenderId === currentUserId;
            
            console.log('Message:', message);
            console.log('Current user ID:', currentUserId);
            console.log('Message sender ID:', messageSenderId);
            console.log('Is current user:', isCurrentUser);
            
            return (
              <Box
                key={message._id || message.id}
                sx={{
                  alignSelf: isCurrentUser ? "flex-end" : "flex-start",
                  maxWidth: "70%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isCurrentUser ? "flex-end" : "flex-start",
                  mb: 1,
                }}
              >
                {!isCurrentUser && (
                  <Typography variant="caption" sx={{ mb: 0.5, color: 'text.secondary' }}>
                    {typeof message.sender_id === 'object' ? 
                      `${message.sender_id.firstName} ${message.sender_id.lastName}` : 
                      `${chat.user?.firstName} ${chat.user?.lastName}`
                    }
                  </Typography>
                )}
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    bgcolor: isCurrentUser ? "primary.main" : "grey.100",
                    color: isCurrentUser ? "white" : "text.primary",
                    borderRadius: isCurrentUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    maxWidth: "100%",
                    minWidth: "60px",
                  }}
                >
                  <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                    {message.message_text}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block', 
                      textAlign: isCurrentUser ? 'right' : 'left', 
                      mt: 0.5, 
                      opacity: 0.7,
                      fontSize: '0.7rem'
                    }}
                  >
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Paper>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          multiline
          maxRows={4}
          InputProps={{
            endAdornment: (
              <IconButton
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                color="primary"
              >
                <SendIcon />
              </IconButton>
            ),
          }}
        />
      </Box>
    </Paper>
  );
}

export default ChatOverlay; 