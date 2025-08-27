import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  IconButton,
  Button,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL as BACKEND_URL, API_URL } from '../config';
import { useMessage } from '../context/MessageContext';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/apiService';
import DeleteConfirmDialog from './DeleteConfirmDialog';

// API_URL and BACKEND_URL from config

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
  marginBottom: theme.spacing(2),
  width: '100%',
}));

const PostImage = styled(CardMedia)({
  width: '100%',
  height: 'auto',
  objectFit: 'contain',
  maxWidth: '100%',
});

const PostContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const PostHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const InfoChip = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
  '& svg': {
    marginRight: theme.spacing(0.5),
    fontSize: '1rem',
  },
}));

const UserInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.8,
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 40,
  height: 40,
  border: `2px solid ${theme.palette.primary.main}`,
}));

function PostCard({ post, onPostUpdated, onDelete }) {
  const [liked, setLiked] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { profileRefreshToken } = useMessage();
  const { user: authUser, isLoggedIn } = useAuth();

  // Check if current user is the post owner
  const isPostOwner = isLoggedIn && authUser?.id === post.user_id;

  useEffect(() => {
    loadUserDetails();
    // Check if current user has liked this post
    if (isLoggedIn && authUser?.id && post.likedBy) {
      setLiked(post.likedBy.includes(authUser.id));
    }
  }, [post.user_id, profileRefreshToken, isLoggedIn, authUser?.id, post.likedBy]);

  const loadUserDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/users/${post.user_id}`);
      setUser(response.data);
      setError(null);
    } catch (err) {
      console.error('Error loading user details:', err);
      setError('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isLoggedIn || !authUser?.id) {
      // If not logged in, just toggle the UI state for demo
      setLiked(!liked);
      return;
    }

    try {
      setLikeLoading(true);
      const response = await ApiService.likePost(post._id || post.id, authUser.id);
      
      // Update the post's like count
      if (response.likeCount !== undefined) {
        post.likeCount = response.likeCount;
      }
      
      setLiked(!liked);
      
      // Notify parent component to refresh if needed
      if (onPostUpdated) {
        onPostUpdated();
      }
    } catch (err) {
      console.error('Error liking/unliking post:', err);
      // Revert the like state on error
      setLiked(liked);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      await ApiService.deletePost(post._id || post.id);
      
      // Notify parent component
      if (onDelete) {
        onDelete(post._id || post.id);
      }
      
      setShowDeleteDialog(false);
    } catch (err) {
      console.error('Error deleting post:', err);
      // Throw the error so the DeleteConfirmDialog can handle it
      throw err;
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  const handleProfileClick = () => {
    navigate(`/profile/${post.user_id}`);
  };

  // Format date to a readable format
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    // If the image path is already a full URL, return it as is
    if (imagePath.startsWith('http')) return imagePath;
    // If it's a media ID, use the media endpoint
    if (imagePath.startsWith('/api/media/')) return `${BACKEND_URL}${imagePath}`;
    // Otherwise, prepend the backend URL
    return `${BACKEND_URL}${imagePath}`;
  };


  return (
    <>
      <StyledCard>
        {post.image_url && (
          <Box sx={{ width: '100%', overflow: 'hidden' }}>
            <PostImage
              component="img"
              src={getImageUrl(post.image_url)}
              alt={post.title}
            />
          </Box>
        )}
        <PostContent>
          <PostHeader>
            <Box sx={{ width: '100%' }}>
              <UserInfo onClick={handleProfileClick}>
                {loading ? (
                  <CircularProgress size={40} />
                ) : error ? (
                  <StyledAvatar alt="Error loading profile" />
                ) : (
                  <StyledAvatar
                    src={user?.profileImageUrl ? `${BACKEND_URL}${user.profileImageUrl}` : '/default_profile.jpg'}
                    alt={`${user?.firstName} ${user?.lastName}`}
                  />
                )}
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {loading ? 'Loading...' : error ? 'Error' : `${user?.firstName} ${user?.lastName}`}
                  </Typography>
                  <InfoChip>
                    <AccessTimeIcon />
                    <Typography variant="body2">
                      Posted on {formatDate(post.created_at || post.createdAt)}
                    </Typography>
                  </InfoChip>
                </Box>
              </UserInfo>
              <Typography variant="h6" component="h2" mt={1}>
                {post.title}
              </Typography>
            </Box>
          </PostHeader>

          <Typography variant="body1" paragraph>
            {post.description}
          </Typography>

          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <IconButton 
                onClick={handleLike} 
                color="primary"
                disabled={likeLoading}
              >
                {likeLoading ? (
                  <CircularProgress size={20} />
                ) : liked ? (
                  <FavoriteIcon />
                ) : (
                  <FavoriteBorderIcon />
                )}
              </IconButton>
              <Typography variant="body2" color="textSecondary">
                {post.likeCount || 0} likes
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              {isPostOwner && (
                <IconButton
                  onClick={handleDeleteClick}
                  color="error"
                  disabled={deleteLoading}
                  title="Delete post"
                >
                  {deleteLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <DeleteIcon />
                  )}
                </IconButton>
              )}
              <Button
                variant="contained"
                color="primary"
              >
                View Details
              </Button>
            </Box>
          </Box>
        </PostContent>
      </StyledCard>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Post"
        message={`Are you sure you want to delete the post "${post.title}"? This action cannot be undone.`}
        itemName="post"
        loading={deleteLoading}
      />
    </>
  );
}

export default PostCard; 