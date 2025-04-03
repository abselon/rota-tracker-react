import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
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
  Stack,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay } from 'date-fns';
import { useAppContext } from '../context/AppContext';
import { Shift, Employee, ShiftAssignment } from '../types';
import Collapse from '@mui/material/Collapse';
import { SketchPicker } from 'react-color';

const RotaCalendar: React.FC = () => {
  const { state, addAssignment, deleteAssignment } = useAppContext();
  const { employees, shifts, assignments, isLoading, error } = state;
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<ShiftAssignment | null>(null);
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null);

  const getWeekDays = (startDate: Date) => {
    return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  };

  const handlePreviousWeek = () => {
    setWeekStart(subWeeks(weekStart, 1));
  };

  const handleNextWeek = () => {
    setWeekStart(addWeeks(weekStart, 1));
  };

  const handleOpenDialog = (date: Date, shift?: Shift) => {
    setSelectedDate(date);
    setSelectedShift(shift || null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDate(null);
    setSelectedShift(null);
    setSelectedEmployee(null);
  };

  const handleDeleteClick = (assignment: ShiftAssignment) => {
    setAssignmentToDelete(assignment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (assignmentToDelete) {
      await deleteAssignment(assignmentToDelete.id);
      setDeleteDialogOpen(false);
      setAssignmentToDelete(null);
    }
  };

  const handleSubmit = async () => {
    if (selectedDate && selectedEmployee && selectedShift) {
      await addAssignment({
        date: selectedDate.toISOString(),
        employeeId: selectedEmployee.id,
        shiftId: selectedShift.id,
        status: 'pending',
      });
      handleCloseDialog();
    }
  };

  const getAssignmentsForDate = (date: Date) => {
    return assignments.filter((assignment) =>
      isSameDay(new Date(assignment.date), date)
    );
  };

  const handleExpandClick = (assignmentId: string) => {
    setExpandedAssignment(expandedAssignment === assignmentId ? null : assignmentId);
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Employee Calendar
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {format(weekStart, 'MMMM d')} - {format(addDays(weekStart, 6), 'MMMM d, yyyy')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={handlePreviousWeek} size="large">
            <ChevronLeftIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog(new Date())}
          >
            Add Assignment
          </Button>
          <IconButton onClick={handleNextWeek} size="large">
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {Array.from({ length: 5 }).map((_, weekIndex) => {
          const weekStartDate = addWeeks(weekStart, weekIndex);
          const weekDays = getWeekDays(weekStartDate);
          const weekRange = `${format(weekStartDate, 'MMMM d')} - ${format(addDays(weekStartDate, 6), 'MMMM d')}`;

          return (
            <Grid container item xs={12} key={weekIndex} spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ padding: 2, backgroundColor: '#f5f5f5', mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Week {weekIndex + 1}: {weekRange}
                  </Typography>
                </Paper>
              </Grid>
              {weekDays.map((day) => {
                const dayAssignments = getAssignmentsForDate(day);
                return (
                  <Grid item xs={12} sm={3} md={2} key={day.toString()}>
                    <Card sx={{ height: 180, width: '100%', overflow: 'hidden' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                            {format(day, 'EEE, MMM d')}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TimeIcon fontSize="small" />
                            <Typography variant="body2" sx={{ ml: 0.5 }}>
                              {dayAssignments.length}
                            </Typography>
                          </Box>
                        </Box>
                        {dayAssignments.length === 0 ? (
                          <Typography color="text.secondary" align="center" sx={{ py: 1, fontSize: '0.8rem' }}>
                            No
                          </Typography>
                        ) : (
                          <Stack spacing={1}>
                            {dayAssignments.map((assignment) => {
                              const employee = employees.find((e) => e.id === assignment.employeeId);
                              const shift = shifts.find((s) => s.id === assignment.shiftId);
                              return (
                                <Paper
                                  key={assignment.id}
                                  sx={{
                                    p: 1,
                                    backgroundColor: employee?.color || 'background.default',
                                    position: 'relative',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 1,
                                    boxShadow: 1,
                                    overflow: 'hidden',
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PersonIcon color="primary" fontSize="small" />
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {employee?.name || 'Unknown'}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TimeIcon color="action" fontSize="small" />
                                    <Typography variant="body2" color="text.secondary">
                                      {shift?.name || 'Unknown'}
                                    </Typography>
                                  </Box>
                                  <IconButton
                                    onClick={() => handleExpandClick(assignment.id)}
                                    sx={{ position: 'absolute', top: 8, right: 8 }}
                                  >
                                    <ExpandMoreIcon
                                      sx={{
                                        transform: expandedAssignment === assignment.id ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s ease',
                                      }}
                                    />
                                  </IconButton>
                                  <Collapse in={expandedAssignment === assignment.id} timeout="auto" unmountOnExit>
                                    <Box sx={{ mt: 1, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                      <Typography variant="body2" color="text.secondary">
                                        Additional details about the assignment can go here.
                                      </Typography>
                                    </Box>
                                  </Collapse>
                                </Paper>
                              );
                            })}
                          </Stack>
                        )}
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          fullWidth
                          sx={{ mt: 1 }}
                          onClick={() => handleOpenDialog(day)}
                        >
                          Add
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          );
        })}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Assignment</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Employee</InputLabel>
              <Select
                value={selectedEmployee?.id || ''}
                onChange={(e) => {
                  const employee = employees.find((emp) => emp.id === e.target.value);
                  setSelectedEmployee(employee || null);
                }}
                label="Employee"
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
                value={selectedShift?.id || ''}
                onChange={(e) => {
                  const shift = shifts.find((s) => s.id === e.target.value);
                  setSelectedShift(shift || null);
                }}
                label="Shift"
              >
                {shifts.map((shift) => (
                  <MenuItem key={shift.id} value={shift.id}>
                    {shift.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Color</InputLabel>
              <Select
                value={selectedEmployee?.color || ''}
                onChange={(e) => {
                  const color = e.target.value;
                  setSelectedEmployee((prev) => {
                    if (prev) {
                      return { ...prev, color };
                    }
                    return null;
                  });
                }}
                label="Color"
              >
                {['#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#8E44AD'].map((color) => (
                  <MenuItem key={color} value={color}>
                    <div style={{ backgroundColor: color, width: '20px', height: '20px', borderRadius: '50%' }} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Date"
              type="date"
              value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : null)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!selectedEmployee || !selectedShift || !selectedDate}
          >
            Add Assignment
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Assignment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this assignment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RotaCalendar; 