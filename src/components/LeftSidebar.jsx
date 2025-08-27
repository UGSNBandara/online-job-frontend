import { useState, useEffect } from 'react'
import { Box, Typography, CircularProgress, Button, ButtonGroup } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Link } from 'react-router-dom'
import ApiService from '../services/apiService'
import { useAuth } from '../context/AuthContext'
import { useMessage } from '../context/MessageContext'

const SidebarContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
  background: 'white',
}));

const ProfileImage = styled('img')(({ theme }) => ({
  width: '150px',
  height: '150px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: `4px solid ${theme.palette.primary.main}`,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
  },
}));

const UserName = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 600,
  fontSize: '1.25rem',
  marginTop: theme.spacing(2),
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

const UserInfo = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.9rem',
  marginTop: theme.spacing(0.5),
}));

const UserTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 500,
  fontSize: '1rem',
  marginTop: theme.spacing(1),
}));

const UserLocation = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.9rem',
  marginTop: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

const UserDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: '0.9rem',
  marginTop: theme.spacing(2),
  lineHeight: 1.6,
}));

const SkillsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

const SkillButton = styled('button')(({ theme }) => ({
  background: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  border: 'none',
  padding: '6px 16px',
  borderRadius: '20px',
  fontSize: '0.9rem',
  cursor: 'default',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
}));

function LeftSidebar() {
  const { currentUserId, profileRefreshToken } = useMessage()
  const { user: authUser, isLoggedIn } = useAuth()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeSection, setActiveSection] = useState('posts') // 'posts' or 'jobs'

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userId = authUser?.id || currentUserId
      if (!userId) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await ApiService.getUser(userId)
        setUser(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching user profile:', err)
        setError('Failed to load profile')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [authUser?.id, currentUserId, profileRefreshToken])

  // Listen for section changes to update button styles
  useEffect(() => {
    const handleSwitchToPosts = () => setActiveSection('posts');
    const handleSwitchToJobs = () => setActiveSection('jobs');

    window.addEventListener('switchToPosts', handleSwitchToPosts);
    window.addEventListener('switchToJobs', handleSwitchToJobs);

    return () => {
      window.removeEventListener('switchToPosts', handleSwitchToPosts);
      window.removeEventListener('switchToJobs', handleSwitchToJobs);
    };

    //Cross-Component Communication
  }, []);

  if (loading) {
    return (
      <SidebarContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </SidebarContainer>
    )
  }

  if (!isLoggedIn) {
    return (
      <SidebarContainer>
        <Typography color="text.secondary" align="center">
          Please log in to view your profile
        </Typography>
      </SidebarContainer>
    )
  }

  if (loading) {
    return (
      <SidebarContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </SidebarContainer>
    )
  }

  if (error) {
    return (
      <SidebarContainer>
        <Typography color="error" align="center">{error}</Typography>
      </SidebarContainer>
    )
  }

  if (!user) {
    return (
      <SidebarContainer>
        <Typography color="text.secondary" align="center">No profile loaded</Typography>
      </SidebarContainer>
    )
  }

  return (
    <SidebarContainer>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Link to={`/profile`}>
          <ProfileImage 
            src={user?.profileImageUrl ? ApiService.getMediaUrl(user.profileImageUrl.replace('/api/media/', '')) : '/default_profile.jpg'} 
            alt={user ? `${user.firstName} ${user.lastName}` : 'Profile'} 
          />
        </Link>
        
        <Link to={`/profile`} style={{ textDecoration: 'none' }}>
          <UserName>
            {user ? `${user.firstName} ${user.lastName}` : ''}
          </UserName>
        </Link>
        
        <UserInfo>{user?.email || ''}</UserInfo>
        
        {user.title && (
          <UserTitle>{user.title}</UserTitle>
        )}
        
        {user.location && (
          <UserLocation>
            <span>📍</span> {user.location}
          </UserLocation>
        )}
        
        {user.description && (
          <UserDescription>
            {user.description}
          </UserDescription>
        )}
        
        {user.skills && user.skills.length > 0 && (
          <SkillsContainer>
            {user.skills.map(skill => (
              <SkillButton key={skill}>
                {skill}
              </SkillButton>
            ))}
          </SkillsContainer>
        )}
        
        {/* Toggle between Posts and Jobs */}
        <Box sx={{ mt: 3, width: '100%' }}>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
            View
          </Typography>
          <ButtonGroup variant="outlined" size="small" fullWidth>
            <Button 
              onClick={() => window.dispatchEvent(new CustomEvent('switchToPosts'))}
              variant={activeSection === 'posts' ? 'contained' : 'outlined'}
              sx={{ 
                flex: 1, 
                borderRadius: '8px 0 0 8px',
                textTransform: 'none',
                backgroundColor: activeSection === 'posts' ? 'primary.main' : 'transparent',
                color: activeSection === 'posts' ? 'white' : 'primary.main',
                borderColor: 'primary.main',
                '&:hover': {
                  backgroundColor: activeSection === 'posts' ? 'primary.dark' : 'primary.light',
                  borderColor: 'primary.dark',
                }
              }}
            >
              Posts
            </Button>
            <Button 
              onClick={() => window.dispatchEvent(new CustomEvent('switchToJobs'))}
              variant={activeSection === 'jobs' ? 'contained' : 'outlined'}
              sx={{ 
                flex: 1, 
                borderRadius: '0 8px 8px 0',
                textTransform: 'none',
                backgroundColor: activeSection === 'jobs' ? 'primary.main' : 'transparent',
                color: activeSection === 'jobs' ? 'white' : 'primary.main',
                borderColor: 'primary.main',
                '&:hover': {
                  backgroundColor: activeSection === 'jobs' ? 'primary.dark' : 'primary.light',
                  borderColor: 'primary.dark',
                }
              }}
            >
              Jobs
            </Button>
          </ButtonGroup>
        </Box>
      </Box>
    </SidebarContainer>
  )
}

export default LeftSidebar 