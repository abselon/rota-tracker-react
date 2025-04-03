import React, { useState } from 'react';
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
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Tooltip,
  DialogContentText,
  Stack,
  Chip,
  Card,
  CardContent,
  Grid,
  Fade,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Event as EventIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { useAppContext } from '../context/AppContext';
import { Shift, Employee, ShiftAssignment } from '../types';
import { formatDate, formatTime } from '../utils/dateUtils';

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

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

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

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee?.name || 'Unknown Employee';
  };

  const getShiftName = (shiftId: string) => {
    const shift = shifts.find((s) => s.id === shiftId);
    return shift?.name || 'Unknown Shift';
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
        {weekDays.map((day) => {
          const dayAssignments = getAssignmentsForDate(day);
          return (
            <Grid item xs={12} md={4} key={day.toString()}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {format(day, 'EEEE, MMMM d')}
                    </Typography>
                    <Chip
                      label={`${dayAssignments.length} assignments`}
                      size="small"
                      color={dayAssignments.length > 0 ? 'primary' : 'default'}
                    />
                  </Box>
                  {dayAssignments.length === 0 ? (
                    <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                      No assignments
                    </Typography>
                  ) : (
                    <Stack spacing={2}>
                      {dayAssignments.map((assignment) => {
                        const employee = employees.find((e) => e.id === assignment.employeeId);
                        const shift = shifts.find((s) => s.id === assignment.shiftId);
                        return (
                          <Paper
                            key={assignment.id}
                            sx={{
                              p: 2,
                              backgroundColor: 'background.default',
                              position: 'relative',
                              '&:hover': {
                                backgroundColor: 'action.hover',
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <PersonIcon color="primary" fontSize="small" />
                              <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                                {employee?.name || 'Unknown Employee'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <TimeIcon color="action" fontSize="small" />
                              <Typography variant="body2" color="text.secondary">
                                {shift?.name || 'Unknown Shift'}
                              </Typography>
                            </Box>
                            <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                              <Tooltip title="Delete assignment">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteClick(assignment)}
                                  sx={{ color: 'error.main' }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Paper>
                        );
                      })}
                    </Stack>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => handleOpenDialog(day)}
                  >
                    Add Assignment
                  </Button>
                </CardContent>
              </Card>
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