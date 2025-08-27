import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Alert, Paper, Grid, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import ApiService from '../services/apiService';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { useMessage } from '../context/MessageContext';

const ProfileContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
}));

const SkillButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0.5),
  textTransform: 'none',
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  borderRadius: '20px',
  padding: '6px 16px',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
}));

const ProfileImage = styled(Avatar)(({ theme }) => ({
  width: 180,
  height: 180,
  marginBottom: theme.spacing(2),
  cursor: 'pointer',
  border: `4px solid ${theme.palette.primary.main}`,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  '&:hover': {
    opacity: 0.9,
    transform: 'scale(1.02)',
    transition: 'all 0.3s ease',
  },
}));

const HiddenInput = styled('input')({
  display: 'none',
});

const SectionTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  borderBottom: `2px solid ${theme.palette.primary.light}`,
  paddingBottom: theme.spacing(1),
}));

const EditButton = styled(Button)(({ theme }) => ({
  borderRadius: '20px',
  padding: '8px 24px',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
}));

const UserProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const { user: authUser, isLoggedIn, setShowAuthModal } = useAuth();
  const { triggerProfileRefresh ,profileRefreshToken } = useMessage();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    title: '',
    location: '',
    description: '',
    skills: []
  });
  const [newSkill, setNewSkill] = useState('');
  const fileInputRef = useRef(null);
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState(null);

  useEffect(() => {
    const uid = authUser?.id || null;
    setCurrentUserId(uid);
  }, [authUser?.id]);

  useEffect(() => {
    if (!currentUserId) return;
    loadProfile();
    fetchUserPosts();
  }, [currentUserId, profileRefreshToken]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getUser(currentUserId);
      setProfile(data);
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        title: data.title || '',
        location: data.location || '',
        description: data.description || '',
        skills: data.skills || []
      });
      setError(null);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err.response?.data?.message || 'Failed to load profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Update profile
      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        title: formData.title,
        location: formData.location,
        description: formData.description
      };

      await ApiService.updateUser(currentUserId, profileData);
      await ApiService.updateUserSkills(currentUserId, formData.skills);

      await loadProfile();
      triggerProfileRefresh();
      setEditMode(false);
      setError(null);
    } catch (err) {
      setError('Failed to update profile. Please try again later.');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = () => {
    if (editMode) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (event) => {
    // Step 1: Extract the selected file from the file input event
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      await ApiService.uploadProfileImage(currentUserId, file);
      await loadProfile();
      setError(null);
    } catch (err) {
      setError('Failed to update profile image. Please try again later.');
      console.error('Error updating profile image:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      setPostsLoading(true);
      setPostsError(null);
      
      // Use the API endpoint to get posts by user ID
      const posts = await ApiService.getPostsByUserId(currentUserId);
      setUserPosts(posts);
    } catch (err) {
      setPostsError('Failed to load user posts.');
      console.error('Error fetching user posts:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await ApiService.deletePost(postId);
      triggerProfileRefresh();
      setUserPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  if (loading && !profile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isLoggedIn) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', px: 2 }}>
        <Alert severity="info" sx={{ mt: 3 }}>Please login to view and edit your profile.</Alert>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => setShowAuthModal(true)}>Login / Register</Button>
        </Box>
      </Box>
    );
  }

  const isRecruiter = profile?.role === 'recruiter';

  return (
  <Box sx={{ maxWidth: 900, mx: 'auto', px: 2, minHeight: '70vh', width: '100%' }}>
      {/* Current user profile */}

      {/* User Details Card - Modern Horizontal Layout */}
      <ProfileContainer elevation={3} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', mb: 4, p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: { md: 4, xs: 0 }, mb: { xs: 2, md: 0 } }}>
          <ProfileImage
            src={profile?.profileImageUrl ? ApiService.getMediaUrl(profile.profileImageUrl.replace('/api/media/', '')) : '/default_profile.jpg'}
            alt={`${profile?.firstName} ${profile?.lastName}`}
            onClick={handleImageClick}
          />
          {editMode && (
            <>
              <HiddenInput
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
              />
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                Click on the image to change it
              </Typography>
            </>
          )}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {profile?.firstName} {profile?.lastName}
            </Typography>
            <EditButton
              variant={editMode ? "outlined" : "contained"}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </EditButton>
          </Box>
          {profile?.title && (
            <Typography variant="body1" sx={{ mb: 0.5 }}>
              <b>Title:</b> {profile.title}
            </Typography>
          )}
          {profile?.location && (
            <Typography variant="body1" sx={{ mb: 0.5 }}>
              <b>Location:</b> {profile.location}
            </Typography>
          )}
          {profile?.description && (
            <Typography variant="body2" sx={{ mb: 1.5, color: 'text.secondary' }}>
              {profile.description}
            </Typography>
          )}
          {profile?.skills?.length > 0 && (
            <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
              {profile.skills.map((skill, index) => (
                <SkillButton key={index} size="small" disabled>
                  {skill}
                </SkillButton>
              ))}
            </Box>
          )}
        </Box>
      </ProfileContainer>

      {/* Edit Mode Form */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
          {error}
        </Alert>
      )}
      {editMode && (
        <Box mb={4}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
              </Grid>
              {/* Only show add skill section if not recruiter */}
              {!isRecruiter && (
                <Grid item xs={12}>
                  <Box display="flex" gap={1} mb={2}>
                    <TextField
                      fullWidth
                      label="Add Skill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleAddSkill}
                      disabled={!newSkill.trim()}
                      sx={{ borderRadius: '8px', minWidth: '100px' }}
                    >
                      Add
                    </Button>
                  </Box>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {formData.skills.map((skill, index) => (
                      <SkillButton
                        key={index}
                        size="small"
                        onClick={() => handleRemoveSkill(skill)}
                      >
                        {skill} ×
                      </SkillButton>
                    ))}
                  </Box>
                </Grid>
              )}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  fullWidth
                  sx={{ 
                    borderRadius: '8px',
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      )}

      {/* User's Posts Section */}
      <Box>
        <SectionTitle variant="h6">User's Posts</SectionTitle>
        {postsError ? (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{postsError}</Alert>
        ) : postsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : userPosts.length === 0 ? (
          <Typography variant="body1" color="textSecondary">This user has not posted anything yet.</Typography>
        ) : (
          userPosts.map(post => (
            <Box key={post._id || post.id} sx={{ mb: 2 }}>
              <PostCard post={post} onDelete={handleDeletePost} />
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default UserProfilePage;