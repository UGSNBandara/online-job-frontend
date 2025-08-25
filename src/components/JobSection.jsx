import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  ButtonGroup,
  Alert,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/apiService';
import DeleteConfirmDialog from './DeleteConfirmDialog';

const CreateJobButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(2),
  justifyContent: 'center',
  textTransform: 'none',
  borderRadius: '12px',
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  fontSize: '1.1rem',
  fontWeight: 600,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
}));

const JobCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: '12px',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  },
}));

const CompanyAvatar = styled(Avatar)(({ theme }) => ({
  width: 60,
  height: 60,
  backgroundColor: theme.palette.primary.main,
  fontSize: '1.5rem',
}));

function JobSection() {
  const { user: authUser, isLoggedIn } = useAuth();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [currentView, setCurrentView] = useState('all'); // 'all' or 'my'
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    jobType: 'Full-time',
    salaryRange: '',
    description: '',
    requirements: ''
  });

  // Fetch jobs based on current view
  useEffect(() => {
    fetchJobs();
  }, [currentView, authUser?.id]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const allJobs = await ApiService.getAllJobs();
      
      if (currentView === 'my' && authUser?.id) {
        // Filter jobs created by current user
        const myJobs = allJobs.filter(job => job.user_id === authUser.id);
        setJobs(myJobs);
      } else {
        // Show all jobs
        setJobs(allJobs);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
    setFormData({
      title: '',
      company: '',
      location: '',
      jobType: 'Full-time',
      salaryRange: '',
      description: '',
      requirements: ''
    });
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
  };

  const handleOpenEditDialog = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      jobType: job.jobType || 'Full-time',
      salaryRange: job.salaryRange || '',
      description: job.description || '',
      requirements: job.requirements ? job.requirements.join(', ') : ''
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditingJob(null);
  };

  const handleSubmit = async () => {
    try {
      const jobData = {
        ...formData,
        requirements: formData.requirements.split(',').map(req => req.trim()).filter(req => req),
        user_id: authUser?.id
      };

      if (editingJob) {
        // Update existing job
        await ApiService.updateJob(editingJob._id, jobData);
        setOpenEditDialog(false);
        setEditingJob(null);
      } else {
        // Create new job
        await ApiService.createJob(jobData);
        setOpenCreateDialog(false);
      }

      // Refresh jobs
      fetchJobs();
    } catch (err) {
      console.error('Error saving job:', err);
      setError('Failed to save job. Please try again.');
    }
  };

  const handleDeleteClick = (jobId) => {
    setDeletingJobId(jobId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      await ApiService.deleteJob(deletingJobId);
      setShowDeleteDialog(false);
      setDeletingJobId(null);
      fetchJobs(); // Refresh jobs
    } catch (err) {
      console.error('Error deleting job:', err);
      throw err; // Propagate error to dialog
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const isJobOwner = (job) => {
    return authUser?.id && job.user_id === authUser.id;
  };

  return (
    <>
      {/* Create Job Button - Always visible */}
      <Box sx={{ mb: 3 }}>
        <CreateJobButton
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Post a New Job
        </CreateJobButton>
      </Box>

      {/* Toggle between All Jobs and My Jobs */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
          View Jobs
        </Typography>
        <ButtonGroup variant="outlined" size="small" fullWidth>
          <Button 
            onClick={() => setCurrentView('all')}
            variant={currentView === 'all' ? 'contained' : 'outlined'}
            sx={{ 
              flex: 1, 
              borderRadius: '8px 0 0 8px',
              textTransform: 'none'
            }}
          >
            All Jobs
          </Button>
          <Button 
            onClick={() => setCurrentView('my')}
            variant={currentView === 'my' ? 'contained' : 'outlined'}
            sx={{ 
              flex: 1, 
              borderRadius: '0 8px 8px 0',
              textTransform: 'none'
            }}
          >
            My Jobs
          </Button>
        </ButtonGroup>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : jobs.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
          <WorkIcon sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6">
            {currentView === 'my' ? 'No jobs posted yet' : 'No jobs available'}
          </Typography>
          <Typography variant="body2">
            {currentView === 'my' ? 'Be the first to post a job opportunity!' : 'Check back later for new opportunities.'}
          </Typography>
        </Box>
      ) : (
        jobs.map(job => (
          <JobCard key={job._id || job.id}>
            <CardContent>
              <Box display="flex" alignItems="flex-start" gap={2}>
                <CompanyAvatar>
                  {job.company.charAt(0)}
                </CompanyAvatar>
                <Box sx={{ flex: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
                      {job.title}
                    </Typography>
                    {isJobOwner(job) && (
                      <Box display="flex" gap={1}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenEditDialog(job)}
                          sx={{ color: 'primary.main' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteClick(job._id)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                    <BusinessIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {job.company}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                    <LocationOnIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {job.location}
                    </Typography>
                  </Box>
                  
                  {job.salaryRange && (
                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                      <AttachMoneyIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {job.salaryRange}
                      </Typography>
                    </Box>
                  )}
                  
                  <Box display="flex" gap={1} sx={{ mb: 2 }}>
                    <Chip 
                      label={job.jobType} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                    <Chip 
                      label={new Date(job.created_at).toLocaleDateString()} 
                      size="small" 
                      variant="outlined" 
                    />
                  </Box>
                  
                  {job.description && (
                    <Typography variant="body2" paragraph>
                      {job.description}
                    </Typography>
                  )}
                  
                  {job.requirements && job.requirements.length > 0 && (
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {job.requirements.map((req, index) => (
                        <Chip 
                          key={index} 
                          label={req} 
                          size="small" 
                          variant="outlined" 
                          color="secondary"
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary">
                Apply Now
              </Button>
              <Button size="small">
                View Details
              </Button>
            </CardActions>
          </JobCard>
        ))
      )}

      {/* Create Job Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} maxWidth="md" fullWidth>
        <DialogTitle>Post a New Job</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Job Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Job Type</InputLabel>
                <Select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleInputChange}
                  label="Job Type"
                >
                  <MenuItem value="Full-time">Full-time</MenuItem>
                  <MenuItem value="Part-time">Part-time</MenuItem>
                  <MenuItem value="Contract">Contract</MenuItem>
                  <MenuItem value="Internship">Internship</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Salary Range"
                name="salaryRange"
                value={formData.salaryRange}
                onChange={handleInputChange}
                placeholder="e.g., $50,000 - $80,000"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Requirements (comma-separated)"
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                placeholder="e.g., React, JavaScript, 3+ years experience"
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Post Job</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Job Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>Edit Job</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Job Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Job Type</InputLabel>
                <Select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleInputChange}
                  label="Job Type"
                >
                  <MenuItem value="Full-time">Full-time</MenuItem>
                  <MenuItem value="Part-time">Part-time</MenuItem>
                  <MenuItem value="Contract">Contract</MenuItem>
                  <MenuItem value="Internship">Internship</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Salary Range"
                name="salaryRange"
                value={formData.salaryRange}
                onChange={handleInputChange}
                placeholder="e.g., $50,000 - $80,000"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Requirements (comma-separated)"
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                placeholder="e.g., React, JavaScript, 3+ years experience"
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Update Job</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Job"
        message="Are you sure you want to delete this job posting? This action cannot be undone."
        itemName="job"
        loading={deleteLoading}
      />
    </>
  );
}

export default JobSection;
