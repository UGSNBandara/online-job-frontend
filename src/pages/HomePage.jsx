import CreatePostButton from '../components/CreatePostButton';
import PostCard from '../components/PostCard';
import JobSection from '../components/JobSection';
import { Box, Pagination, CircularProgress, Alert } from '@mui/material';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/apiService';

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentView, setCurrentView] = useState('posts'); // 'posts' or 'jobs'
  const { user: authUser, isLoggedIn } = useAuth();

  const fetchPosts = async (pageNum = 1) => {
    try {
      setLoading(true);
      
      // If user is logged in but ID is not available yet, wait
      if (isLoggedIn && !authUser?.id) {
        setLoading(false);
        return;
      }
      
      if (!isLoggedIn || !authUser?.id) {
        // If not logged in, show regular posts
        const response = await ApiService.getPosts(pageNum, 10);
        setPosts(response.posts || response);
        setTotalPages(response.totalPages || 1);
      } else {
        // If logged in, try wall posts first, fallback to regular posts if it fails
        try {
          const response = await ApiService.getWallPosts(authUser.id);
          setPosts(response.posts || response || []);
          setTotalPages(response.totalPages || 1);
        } catch (wallError) {
          console.warn('Wall posts endpoint not available, falling back to regular posts:', wallError);
          // Fallback to regular posts
          const response = await ApiService.getPosts(pageNum, 10);
          setPosts(response.posts || response);
          setTotalPages(response.totalPages || 1);
        }
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authUser?.id !== undefined) {
      fetchPosts(page);
    }
  }, [page, authUser?.id, isLoggedIn]);

  // Listen for toggle events from LeftSidebar
  useEffect(() => {
    const handleSwitchToPosts = () => setCurrentView('posts');
    const handleSwitchToJobs = () => setCurrentView('jobs');

    window.addEventListener('switchToPosts', handleSwitchToPosts);
    window.addEventListener('switchToJobs', handleSwitchToJobs);

    return () => {
      window.removeEventListener('switchToPosts', handleSwitchToPosts);
      window.removeEventListener('switchToJobs', handleSwitchToJobs);
    };
  }, []);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleNewPostCreated = (newPost) => {
    if (newPost && newPost.user_id === authUser?.id) {
      // Add the new post to the top of the current posts list
      setPosts(prevPosts => [newPost, ...prevPosts]);
    }
  };

  return (
    <>
      {currentView === 'posts' ? (
        <>
          <Box sx={{ mb: 3 }}>
            <CreatePostButton onPostCreated={handleNewPostCreated} />
          </Box>

          {!isLoggedIn && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Please log in to see personalized wall posts and like/unlike functionality.
            </Alert>
          )}

          {error ? (
            <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
              {error}
            </Box>
          ) : loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {posts.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                  {isLoggedIn ? 'No posts available in your wall. Try following more users!' : 'No posts available.'}
                </Box>
              ) : (
                posts.map(post => (
                  <Box key={post._id || post.id} sx={{ mb: 2 }}>
                    <PostCard post={post} onPostUpdated={() => fetchPosts(page)} />
                  </Box>
                ))
              )}
              
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 3 }}>
                  <Pagination 
                    count={totalPages} 
                    page={page} 
                    onChange={handlePageChange} 
                    color="primary" 
                  />
                </Box>
              )}
            </>
          )}
        </>
      ) : (
        <JobSection />
      )}
    </>
  );
}

export default HomePage; 