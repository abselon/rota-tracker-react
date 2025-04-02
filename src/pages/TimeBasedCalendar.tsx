import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Tooltip,
  Stack,
  Chip,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay } from 'date-fns';
import { useAppContext } from '../context/AppContext';
import { Shift, ShiftAssignment } from '../types';
import { formatDate } from '../utils/dateUtils';

const ShiftBasedCalendar: React.FC = () => {
  const { state, addAssignment, deleteAssignment } = useAppContext();
  const { employees, shifts, assignments, isLoading, error } = state;
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    shiftId: '',
    date: '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<ShiftAssignment | null>(null);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Start from Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Sort shifts by start time
  const sortedShifts = useMemo(() => {
    return [...shifts].sort((a, b) => {
      const [aHours, aMinutes] = a.startTime.split(':').map(Number);
      const [bHours, bMinutes] = b.startTime.split(':').map(Number);
      return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes);
    });
  }, [shifts]);

  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleAddAssignment = (shiftId: string, date: Date) => {
    setFormData({
      employeeId: '',
      shiftId: shiftId,
      date: formatDate(date),
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      employeeId: '',
      shiftId: '',
      date: '',
    });
  };

  const handleSaveAssignment = async () => {
    if (formData.employeeId && formData.shiftId && formData.date) {
      const newAssignment: Omit<ShiftAssignment, 'id'> = {
        employeeId: formData.employeeId,
        shiftId: formData.shiftId,
        date: formData.date,
        status: 'pending',
      };
      await addAssignment(newAssignment);
      handleCloseDialog();
    }
  };

  const getAssignmentsForDay = (date: Date, shiftId: string) => {
    return assignments.filter((assignment) => 
      isSameDay(new Date(assignment.date), date) && assignment.shiftId === shiftId
    );
  };

  const handleDeleteAssignment = (assignment: ShiftAssignment) => {
    setAssignmentToDelete(assignment);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Shift-Based Calendar</Typography>
        <Box>
          <IconButton onClick={handlePreviousWeek}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h6" component="span" sx={{ mx: 2 }}>
            {format(weekStart, 'MMMM d')} - {format(addDays(weekStart, 6), 'MMMM d, yyyy')}
          </Typography>
          <IconButton onClick={handleNextWeek}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 200 }}>Shift</TableCell>
              {weekDays.map((day) => (
                <TableCell key={day.toString()} align="center">
                  {format(day, 'EEE, MMM d')}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedShifts.map((shift) => (
              <TableRow key={shift.id}>
                <TableCell component="th" scope="row">
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {shift.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {shift.startTime} - {shift.endTime}
                    </Typography>
                  </Box>
                </TableCell>
                {weekDays.map((day) => {
                  const dayAssignments = getAssignmentsForDay(day, shift.id);
                  return (
                    <TableCell
                      key={`${day.toString()}-${shift.id}`}
                      sx={{
                        height: 100,
                        position: 'relative',
                        borderRight: '1px solid rgba(224, 224, 224, 1)',
                        borderBottom: '1px solid rgba(224, 224, 224, 1)',
                        backgroundColor: shift.color || '#f5f5f5',
                      }}
                    >
                      <Box sx={{ p: 1 }}>
                        <Stack spacing={1}>
                          {dayAssignments.map((assignment) => {
                            const employee = employees.find((e) => e.id === assignment.employeeId);
                            return (
                              <Box
                                key={assignment.id}
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                  p: 1,
                                  borderRadius: 1,
                                }}
                              >
                                <Typography variant="body2">
                                  {employee?.name || 'Unknown Employee'}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteAssignment(assignment)}
                                  sx={{ ml: 1 }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            );
                          })}
                          <Button
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => handleAddAssignment(shift.id, day)}
                            sx={{ mt: 1 }}
                          >
                            Add Assignment
                          </Button>
                        </Stack>
                      </Box>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Shift Assignment</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Employee</InputLabel>
              <Select
                value={formData.employeeId}
                label="Employee"
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              >
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Shift</InputLabel>
              <Select
                value={formData.shiftId}
                label="Shift"
                onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}
                disabled
              >
                {shifts.map((shift) => (
                  <MenuItem key={shift.id} value={shift.id}>
                    {shift.name} ({shift.startTime} - {shift.endTime})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Date"
              value={formData.date}
              disabled
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveAssignment} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Assignment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this shift assignment?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (assignmentToDelete) {
                deleteAssignment(assignmentToDelete.id);
                setDeleteDialogOpen(false);
                setAssignmentToDelete(null);
              }
            }}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShiftBasedCalendar; 