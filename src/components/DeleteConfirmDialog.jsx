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

// Styled Components for custom appearance

// Custom styled dialog with rounded corners and specific width constraints
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '12px',
    minWidth: '400px',
    maxWidth: '500px',
  },
}));

// Styled component for the confirmation text box
// Uses monospace font and gray background to make it look like a code block
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

// Warning text styled in red to grab attention
const WarningText = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  fontWeight: 600,
  marginBottom: theme.spacing(2),
}));

function DeleteConfirmDialog({ open, onClose, onConfirm, title, message, itemName, loading = false }) {
  // State Management
  const [confirmationText, setConfirmationText] = useState(''); // Random text user must type
  const [userInput, setUserInput] = useState(''); // What user actually types
  const [error, setError] = useState(''); // Validation error message
  const [deleteError, setDeleteError] = useState(''); // Deletion operation error

  useEffect(() => {
    if (open) {
      const generateConfirmationText = () => {
        const patterns = [
          `DELETE-${itemName?.toUpperCase() || 'POST'}`, // Pattern 1: DELETE-ITEMNAME
          `REMOVE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`, // Pattern 2: REMOVE-RANDOM6CHARS
          `CONFIRM-${Date.now().toString().slice(-6)}`, // Pattern 3: CONFIRM-TIMESTAMP
          `TYPE-${Math.random().toString(36).substring(2, 10).toUpperCase()}`, // Pattern 4: TYPE-RANDOM8CHARS
        ];
        // Randomly select one of the patterns
        return patterns[Math.floor(Math.random() * patterns.length)];
      };
      
      setConfirmationText(generateConfirmationText());
      setUserInput(''); 
      setError(''); 
      setDeleteError(''); 
    }
  }, [open, itemName]); // Re-run when dialog opens or itemName changes

  const handleConfirm = async () => {
    if (userInput.trim() !== confirmationText) {
      setError('Confirmation text does not match. Please type it exactly as shown.');
      return; 
    }

    // if passed
    setError('');
    setDeleteError('');
    
    try {
      await onConfirm();
      // If onConfirm succeeds, the dialog will be closed by the parent component
    } catch (err) {
      setDeleteError('Failed to delete. Please try again.');
    }
  };

  const handleClose = () => {
    setUserInput('');
    setError(''); 
    setDeleteError(''); 
    onClose(); 
  }; //only when called

  const isConfirmDisabled = userInput.trim() !== confirmationText || loading; //runs on every render

  // STEP 5: Render the dialog UI
  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      {/* Dialog Header with warning icon and title */}
      <DialogTitle sx={{ 
        color: 'error.main', 
        fontWeight: 600,
        borderBottom: '2px solid',
        borderColor: 'error.light'
      }}>
        🗑️ {title || 'Delete Confirmation'}
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {/* Warning message to emphasize permanent action */}
        <WarningText variant="h6">
          ⚠️ This action cannot be undone
        </WarningText>
        
        {/* Main confirmation message */}
        <Typography variant="body1" sx={{ mb: 3 }}>
          {message || `Are you sure you want to delete this ${itemName || 'item'}?`}
        </Typography>

        {/* Box containing confirmation text instructions and the generated text */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            To confirm deletion, please type the following text exactly:
          </Typography>
          {/* Display the generated confirmation text in a styled box */}
          <ConfirmationText variant="body1">
            {confirmationText}
          </ConfirmationText>
        </Box>

        {/* Input field where user types the confirmation text */}
        <TextField
          fullWidth
          label="Type confirmation text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)} 
          error={!!error} // Show error styling if there's a validation error /!!error gives for false empty error
          helperText={error} // Show error message below input
          placeholder="Enter the text above"
          variant="outlined"
          sx={{ mb: 2 }}
        />

        {/* Show deletion error if the API call fails */}
        {deleteError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {deleteError}
          </Alert>
        )}

        {/* Show loading indicator during deletion process */}
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Deleting...
            </Typography>
          </Box>
        )}
      </DialogContent>

      {/* Dialog action buttons */}
      <DialogActions sx={{ p: 3, pt: 0 }}>
        {/* Cancel button - always available unless loading */}
        <Button 
          onClick={handleClose} 
          variant="outlined"
          disabled={loading}
          sx={{ borderRadius: '8px' }}
        >
          Cancel
        </Button>
        
        {/* Delete button - disabled until user types correct confirmation text */}
        <Button 
          onClick={handleConfirm}
          variant="contained" 
          color="error"
          disabled={isConfirmDisabled} // Disabled until validation passes
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
