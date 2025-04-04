import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAppContext } from '../context/AppContext';
import { WeeklySchedule } from '../types';
import { format } from 'date-fns';

interface FormData {
  weekStart: Date;
  weekEnd: Date;
}

export default function WeeklyScheduleManagement() {
  const { state, addSchedule, updateSchedule, deleteSchedule } = useAppContext();
  const { schedules, isLoading, error } = state;
  const [open, setOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WeeklySchedule | null>(null);
  const [formData, setFormData] = useState<FormData>({
    weekStart: new Date(),
    weekEnd: new Date(),
  });

  const handleOpen = (schedule?: WeeklySchedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        weekStart: new Date(schedule.weekStart),
        weekEnd: new Date(schedule.weekEnd),
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        weekStart: new Date(),
        weekEnd: new Date(),
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingSchedule(null);
  };

  const handleSubmit = async () => {
    const newSchedule: Omit<WeeklySchedule, 'id'> = {
      weekStart: format(formData.weekStart, 'yyyy-MM-dd'),
      weekEnd: format(formData.weekEnd, 'yyyy-MM-dd'),
      shifts: {},
    };

    try {
      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, newSchedule);
      } else {
        await addSchedule(newSchedule);
      }
      handleClose();
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const handleDelete = async (scheduleId: string) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await deleteSchedule(scheduleId);
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Weekly Schedule Management</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Schedule
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Week Start</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  No schedules found. Add your first schedule to get started.
                </TableCell>
              </TableRow>
            ) : (
              schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>{schedule.weekStart}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(schedule)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(schedule.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSchedule ? 'Edit Schedule' : 'Add Schedule'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Week Start"
                  value={formData.weekStart}
                  onChange={(newValue) => {
                    if (newValue) {
                      setFormData({ ...formData, weekStart: newValue });
                    }
                  }}
                />
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Week End"
                  value={formData.weekEnd}
                  onChange={(newValue) => {
                    if (newValue) {
                      setFormData({ ...formData, weekEnd: newValue });
                    }
                  }}
                />
              </LocalizationProvider>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 