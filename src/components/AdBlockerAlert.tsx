import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Alert,
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

export const AdBlockerAlert: React.FC = () => {
  const [isAdBlockerDetected, setIsAdBlockerDetected] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const checkForAdBlocker = async () => {
      try {
        const testUrl = 'https://firestore.googleapis.com/google.firestore.v1';
        const response = await fetch(testUrl, { 
          method: 'HEAD',
          mode: 'no-cors'
        });
        setIsAdBlockerDetected(false);
      } catch (error) {
        setIsAdBlockerDetected(true);
      }
    };

    checkForAdBlocker();

    const checkFirebase = () => {
      const testScript = document.createElement('script');
      testScript.src = 'https://www.gstatic.com/firebasejs/9.x.x/firebase-app.js';
      testScript.onerror = () => setIsAdBlockerDetected(true);
      document.head.appendChild(testScript);
      setTimeout(() => document.head.removeChild(testScript), 1000);
    };

    checkFirebase();
  }, []);

  if (!isAdBlockerDetected) {
    return null;
  }

  return (
    <>
      <Tooltip title="Ad blocker detected - Click for more info">
        <IconButton
          color="warning"
          onClick={() => setIsDialogOpen(true)}
          size="small"
          sx={{ ml: 1 }}
        >
          <WarningIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="warning" />
            <Typography>Firebase Connection Blocked</Typography>
            <IconButton
              aria-label="close"
              onClick={() => setIsDialogOpen(false)}
              sx={{ ml: 'auto' }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography>
              Your ad blocker is preventing connections to Firebase. This may affect app functionality.
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Disable ad blocker for this site"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Whitelist these domains:"
                  secondary="firestore.googleapis.com, *.firebaseio.com, *.firebase.google.com"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Try using an Incognito/Private window"
                />
              </ListItem>
            </List>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>
            Close
          </Button>
          <Button 
            variant="contained"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}; 