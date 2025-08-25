import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import PostCard from '../components/PostCard'
import axios from 'axios'
import { API_URL } from '../config'
import { Box, Typography, Paper, Avatar, CircularProgress, Alert, Grid, Button } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useMessage } from '../context/MessageContext'
import ApiService from '../services/apiService'

// API_URL from config

const ProfileContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
}));

const ProfileImage = styled(Avatar)(({ theme }) => ({
  width: 180,
  height: 180,
  marginBottom: theme.spacing(2),
  border: `4px solid ${theme.palette.primary.main}`,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  borderBottom: `2px solid ${theme.palette.primary.light}`,
  paddingBottom: theme.spacing(1),
}));

function UserProfileViewPage() {
  const { userId } = useParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [posts, setPosts] = useState([])
  const { selectChat } = useMessage()

  useEffect(() => {
    loadUserProfile()
  }, [userId])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/users/${userId}`)
      setUser(response.data)

      // Use the API endpoint to get posts by user ID
      const userPosts = await ApiService.getPostsByUserId(userId)
      setPosts(userPosts)

      setError(null)
    } catch (err) {
      console.error('Error loading profile:', err)
      setError(err.response?.data?.message || 'Failed to load profile. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', px: 2 }}>
        <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>
      </Box>
    )
  }

  if (!user) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', px: 2 }}>
        <Alert severity="warning" sx={{ mt: 3 }}>User not found</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: 2 }}>
      <ProfileContainer elevation={3} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', mb: 4, p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: { md: 4, xs: 0 }, mb: { xs: 2, md: 0 } }}>
          <ProfileImage
            src={user?.profileImageUrl ? `${API_URL}/media/${user.profileImageUrl.replace('/api/media/', '')}` : '/default_profile.jpg'}
            alt={`${user?.firstName} ${user?.lastName}`}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Button variant="contained" onClick={() => selectChat({ id: userId, participant: user })}>Message</Button>
          </Box>
          {user?.title && (
            <Typography variant="body1" sx={{ mb: 0.5 }}>
              <b>Title:</b> {user.title}
            </Typography>
          )}
          {user?.location && (
            <Typography variant="body1" sx={{ mb: 0.5 }}>
              <b>Location:</b> {user.location}
            </Typography>
          )}
          {user?.description && (
            <Typography variant="body2" sx={{ mb: 1.5, color: 'text.secondary' }}>
              {user.description}
            </Typography>
          )}
          {user?.skills?.length > 0 && (
            <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
              {user.skills.map((skill, index) => (
                <Typography key={index} variant="body2" sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText', padding: '4px 12px', borderRadius: '16px' }}>
                  {skill}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      </ProfileContainer>

      {posts.length > 0 && (
        <Box>
          <SectionTitle variant="h6">User's Posts</SectionTitle>
          <Box sx={{ mt: 2 }}>
            {posts.map(post => (
              <PostCard key={post._id || post.id} post={post} />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default UserProfileViewPage 