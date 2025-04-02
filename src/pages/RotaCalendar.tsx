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
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { format, addWeeks, subWeeks, startOfWeek, addDays } from 'date-fns';
import { useAppContext } from '../context/AppContext';
import { Shift, Employee, ShiftAssignment } from '../types';
import { formatDate } from '../utils/dateUtils';

const RotaCalendar: React.FC = () => {
  const { state, addAssignment } = useAppContext();
  const { employees, shifts, assignments, isLoading, error } = state;
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    shiftId: '',
    date: '',
  });

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Start from Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleAddShift = (date: Date) => {
    setSelectedDate(date);
    setFormData({
      employeeId: '',
      shiftId: '',
      date: formatDate(date),
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDate(null);
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

  const getAssignmentsForDay = (date: Date) => {
    return assignments.filter(
      (assignment) => formatDate(new Date(assignment.date)) === formatDate(date)
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Weekly Rota</Typography>
        <Box>
          <IconButton onClick={handlePreviousWeek}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h6" component="span" sx={{ mx: 2 }}>
            {format(weekStart, 'MMMM d, yyyy')}
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
              <TableCell>Employee</TableCell>
              {weekDays.map((day) => (
                <TableCell key={day.toString()} align="center">
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography>{format(day, 'EEE d')}</Typography>
                    <IconButton size="small" onClick={() => handleAddShift(day)}>
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell component="th" scope="row">
                  {employee.name}
                </TableCell>
                {weekDays.map((day) => {
                  const dayAssignments = getAssignmentsForDay(day);
                  const employeeAssignment = dayAssignments.find(
                    (assignment) => assignment.employeeId === employee.id
                  );
                  const shift = employeeAssignment
                    ? shifts.find((s) => s.id === employeeAssignment.shiftId)
                    : null;

                  return (
                    <TableCell key={day.toString()} align="center">
                      {shift ? (
                        <Box
                          sx={{
                            backgroundColor: shift.color || '#e0e0e0',
                            p: 1,
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="body2">{shift.name}</Typography>
                          <Typography variant="caption">
                            {shift.startTime} - {shift.endTime}
                          </Typography>
                        </Box>
                      ) : null}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
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
    </Box>
  );
};

export default RotaCalendar; 