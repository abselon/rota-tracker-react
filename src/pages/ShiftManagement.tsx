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
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAppContext } from '../context/AppContext';
import { Shift } from '../types';

interface FormData {
  name: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  requiredEmployees: number;
}

export default function ShiftManagement() {
  const { state, dispatch } = useAppContext();
  const { shifts } = state;
  const [open, setOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    startTime: new Date(),
    endTime: new Date(),
    duration: 0,
    requiredEmployees: 1,
  });

  const parseTimeString = (timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date;
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleOpen = (shift?: Shift) => {
    if (shift) {
      setEditingShift(shift);
      setFormData({
        name: shift.name,
        startTime: parseTimeString(shift.startTime),
        endTime: parseTimeString(shift.endTime),
        duration: shift.duration,
        requiredEmployees: shift.requiredEmployees,
      });
    } else {
      setEditingShift(null);
      setFormData({
        name: '',
        startTime: new Date(),
        endTime: new Date(),
        duration: 0,
        requiredEmployees: 1,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingShift(null);
  };

  const handleSubmit = () => {
    const newShift: Shift = {
      id: editingShift?.id || Date.now().toString(),
      name: formData.name,
      startTime: formatTime(formData.startTime),
      endTime: formatTime(formData.endTime),
      duration: formData.duration,
      requiredEmployees: formData.requiredEmployees,
      color: editingShift?.color || `#${Math.floor(Math.random()*16777215).toString(16)}`,
    };

    if (editingShift) {
      dispatch({ type: 'UPDATE_SHIFT', payload: newShift });
    } else {
      dispatch({ type: 'ADD_SHIFT', payload: newShift });
    }

    handleClose();
  };

  const handleDelete = (shiftId: string) => {
    dispatch({ type: 'DELETE_SHIFT', payload: shiftId });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Shift Management</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Shift
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Duration (hours)</TableCell>
              <TableCell>Required Employees</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shifts.map((shift) => (
              <TableRow key={shift.id}>
                <TableCell>{shift.name}</TableCell>
                <TableCell>{shift.startTime}</TableCell>
                <TableCell>{shift.endTime}</TableCell>
                <TableCell>{shift.duration}</TableCell>
                <TableCell>{shift.requiredEmployees}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(shift)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(shift.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingShift ? 'Edit Shift' : 'Add Shift'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <TextField
                  fullWidth
                  label="Shift Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <TimePicker
                      label="Start Time"
                      value={formData.startTime}
                      onChange={(newValue) => {
                        if (newValue) {
                          setFormData({ ...formData, startTime: newValue });
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <TimePicker
                      label="End Time"
                      value={formData.endTime}
                      onChange={(newValue) => {
                        if (newValue) {
                          setFormData({ ...formData, endTime: newValue });
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Duration (hours)"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Required Employees"
                    value={formData.requiredEmployees}
                    onChange={(e) => setFormData({ ...formData, requiredEmployees: Number(e.target.value) })}
                  />
                </Box>
              </Box>
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