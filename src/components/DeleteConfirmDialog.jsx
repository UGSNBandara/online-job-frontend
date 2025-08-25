import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '12px',
    minWidth: '400px',
    maxWidth: '500px',
  },
}));

const ConfirmationText = styled(Typography)(({ theme }) => ({
  fontFamily: 'monospace',
  backgroundColor: theme.palette.grey[100],
  padding: theme.spacing(1.5),
  borderRadius: '6px',
  border: `2px solid ${theme.palette.grey[300]}`,
  textAlign: 'center',
  fontWeight: 'bold',
  fontSize: '1.1rem',
  letterSpacing: '1px',
  color: theme.palette.text.primary,
}));

const WarningText = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  fontWeight: 600,
  marginBottom: theme.spacing(2),
}));

function DeleteConfirmDialog({ open, onClose, onConfirm, title, message, itemName, loading = false }) {
  const [confirmationText, setConfirmationText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Generate random confirmation text
  useEffect(() => {
    if (open) {
      const generateConfirmationText = () => {
        const patterns = [
          `DELETE-${itemName?.toUpperCase() || 'POST'}`,
          `REMOVE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          `CONFIRM-${Date.now().toString().slice(-6)}`,
          `TYPE-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        ];
        return patterns[Math.floor(Math.random() * patterns.length)];
      };
      
      setConfirmationText(generateConfirmationText());
      setUserInput('');
      setError('');
      setDeleteError('');
    }
  }, [open, itemName]);

  const handleConfirm = async () => {
    if (userInput.trim() !== confirmationText) {
      setError('Confirmation text does not match. Please type it exactly as shown.');
      return;
    }
    
    setError('');
    setDeleteError('');
    
    try {
      await onConfirm();
      // If onConfirm succeeds, the dialog will be closed by the parent
    } catch (err) {
      setDeleteError('Failed to delete. Please try again.');
    }
  };

  const handleClose = () => {
    setUserInput('');
    setError('');
    setDeleteError('');
    onClose();
  };

  const isConfirmDisabled = userInput.trim() !== confirmationText || loading;

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ 
        color: 'error.main', 
        fontWeight: 600,
        borderBottom: '2px solid',
        borderColor: 'error.light'
      }}>
        🗑️ {title || 'Delete Confirmation'}
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <WarningText variant="h6">
          ⚠️ This action cannot be undone
        </WarningText>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          {message || `Are you sure you want to delete this ${itemName || 'item'}?`}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            To confirm deletion, please type the following text exactly:
          </Typography>
          <ConfirmationText variant="body1">
            {confirmationText}
          </ConfirmationText>
        </Box>

        <TextField
          fullWidth
          label="Type confirmation text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          error={!!error}
          helperText={error}
          placeholder="Enter the text above"
          variant="outlined"
          sx={{ mb: 2 }}
        />

        {deleteError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {deleteError}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Deleting...
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={handleClose} 
          variant="outlined"
          disabled={loading}
          sx={{ borderRadius: '8px' }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm}
          variant="contained" 
          color="error"
          disabled={isConfirmDisabled}
          sx={{ 
            borderRadius: '8px',
            minWidth: '100px',
            '&:disabled': {
              backgroundColor: 'grey.400',
              color: 'grey.600'
            }
          }}
        >
          {loading ? <CircularProgress size={20} /> : 'Delete'}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
}

export default DeleteConfirmDialog;
