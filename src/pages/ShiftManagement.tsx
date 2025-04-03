import React, { useState, useEffect } from 'react';
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
  Stack,
  Popover,
  useTheme,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Chip,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  AccessTime as AccessTimeIcon,
  Group as GroupIcon,
  Palette as PaletteIcon,
  AddCircle as AddCircleIcon,
} from '@mui/icons-material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAppContext } from '../context/AppContext';
import { Shift } from '../types';
import { SketchPicker } from 'react-color';

interface FormData {
  name: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  requiredEmployees: number;
  color: string;
  isOvernight: boolean;
}

interface DayShiftAssignment {
  shiftId: string;
  startTime: string;
  endTime: string;
  isOvernight: boolean;
  nextDayEndTime?: string;
}

interface WeeklyDesign {
  [day: string]: DayShiftAssignment[];
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const isOvernightShift = (startTime: string, endTime: string): boolean => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  // Convert times to minutes for easier comparison
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  // If end time is less than start time, it's overnight
  return endMinutes < startMinutes;
};

export default function ShiftManagement() {
  const theme = useTheme();
  const { state, addShift, updateShift, deleteShift } = useAppContext();
  const { shifts, isLoading, error } = state;
  const [open, setOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [colorPickerAnchor, setColorPickerAnchor] = useState<null | HTMLElement>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [weeklyDesign, setWeeklyDesign] = useState<WeeklyDesign>({});
  const [formData, setFormData] = useState<FormData>({
    name: '',
    startTime: new Date(),
    endTime: new Date(),
    duration: 0,
    requiredEmployees: 1,
    color: '#1976d2',
    isOvernight: false,
  });

  // Initialize weekly design if empty
  useEffect(() => {
    if (Object.keys(weeklyDesign).length === 0) {
      const initialDesign: WeeklyDesign = {};
      DAYS_OF_WEEK.forEach(day => {
        initialDesign[day] = [];
      });
      setWeeklyDesign(initialDesign);
    }
  }, []);

  const parseTimeString = (timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date;
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateTotalHours = (dayShifts: DayShiftAssignment[]): number => {
    return dayShifts.reduce((total, assignment) => {
      const shift = shifts.find(s => s.id === assignment.shiftId);
      if (!shift) return total;
      
      if (assignment.isOvernight) {
        // For overnight shifts, calculate hours that fall on this day
        const [shiftStartHour] = assignment.startTime.split(':').map(Number);
        const [shiftEndHour] = (assignment.nextDayEndTime || '00:00').split(':').map(Number);
        
        // Calculate hours from start until midnight (24 - shiftStartHour)
        // Plus hours from midnight until end time (shiftEndHour)
        return total + ((24 - shiftStartHour) + shiftEndHour);
      }
      
      return total + shift.duration;
    }, 0);
  };

  const handleAddShiftToDay = (day: string) => {
    const newAssignment: DayShiftAssignment = {
      shiftId: '',
      startTime: '09:00',
      endTime: '17:00',
      isOvernight: false,
    };
    setWeeklyDesign(prev => ({
      ...prev,
      [day]: [...prev[day], newAssignment],
    }));
  };

  const handleRemoveShiftFromDay = (day: string, index: number) => {
    setWeeklyDesign(prev => {
      const assignmentToRemove = prev[day][index];
      const selectedShift = shifts.find(s => s.id === assignmentToRemove.shiftId);
      
      // If this is an overnight shift, we need to handle both cases:
      // 1. If it's the start of the overnight shift (not starting at 00:00)
      // 2. If it's the continuation of an overnight shift (starting at 00:00)
      if (selectedShift?.isOvernight) {
        // Case 1: This is the start of the overnight shift
        if (assignmentToRemove.startTime !== '00:00') {
          const nextDayIdx = DAYS_OF_WEEK.indexOf(day) + 1;
          const nextDay = nextDayIdx < DAYS_OF_WEEK.length 
            ? DAYS_OF_WEEK[nextDayIdx] 
            : DAYS_OF_WEEK[0]; // Wrap around to Monday if it's Sunday

          // Remove the shift from the current day
          const updatedCurrentDay = prev[day].filter((_, i) => i !== index);
          
          // Remove the corresponding overnight shift from the next day
          const updatedNextDay = prev[nextDay].filter(assignment => 
            assignment.shiftId !== assignmentToRemove.shiftId || 
            assignment.startTime !== '00:00'
          );

          return {
            ...prev,
            [day]: updatedCurrentDay,
            [nextDay]: updatedNextDay,
          };
        }
        // Case 2: This is the continuation of an overnight shift
        else {
          const prevDayIdx = DAYS_OF_WEEK.indexOf(day) - 1;
          const prevDay = prevDayIdx >= 0 
            ? DAYS_OF_WEEK[prevDayIdx] 
            : DAYS_OF_WEEK[DAYS_OF_WEEK.length - 1]; // Wrap around to Sunday if it's Monday

          // Remove the shift from the current day
          const updatedCurrentDay = prev[day].filter((_, i) => i !== index);
          
          // Remove the corresponding overnight shift from the previous day
          const updatedPrevDay = prev[prevDay].filter(assignment => 
            assignment.shiftId !== assignmentToRemove.shiftId || 
            assignment.startTime === '00:00'
          );

          return {
            ...prev,
            [day]: updatedCurrentDay,
            [prevDay]: updatedPrevDay,
          };
        }
      }

      // For non-overnight shifts, just remove from the current day
      return {
        ...prev,
        [day]: prev[day].filter((_, i) => i !== index),
      };
    });
  };

  const handleShiftAssignmentChange = (day: string, index: number, field: keyof DayShiftAssignment, value: any) => {
    setWeeklyDesign(prev => {
      const updatedAssignments = prev[day].map((assignment, i) => {
        if (i === index) {
          if (field === 'shiftId') {
            // When a shift is selected, set its predefined times
            const selectedShift = shifts.find(s => s.id === value);
            if (selectedShift) {
              const isOvernight = isOvernightShift(selectedShift.startTime, selectedShift.endTime);
              return {
                ...assignment,
                shiftId: value,
                startTime: selectedShift.startTime,
                endTime: isOvernight ? '23:59' : selectedShift.endTime,
                isOvernight,
                nextDayEndTime: isOvernight ? selectedShift.endTime : undefined,
              };
            }
          }
          return { ...assignment, [field]: value };
        }
        return assignment;
      });

      // If this is an overnight shift, also add it to the next day's schedule
      if (field === 'shiftId') {
        const selectedShift = shifts.find(s => s.id === value);
        if (selectedShift && isOvernightShift(selectedShift.startTime, selectedShift.endTime)) {
          const nextDayIndex = DAYS_OF_WEEK.indexOf(day) + 1;
          const nextDay = nextDayIndex < DAYS_OF_WEEK.length 
            ? DAYS_OF_WEEK[nextDayIndex] 
            : DAYS_OF_WEEK[0]; // Wrap around to Monday if it's Sunday

          const nextDayAssignment: DayShiftAssignment = {
            shiftId: value,
            startTime: '00:00',
            endTime: selectedShift.endTime,
            isOvernight: true,
            // Don't set nextDayEndTime for the next day's portion
          };
          
          return {
            ...prev,
            [day]: updatedAssignments,
            [nextDay]: [...(prev[nextDay] || []), nextDayAssignment],
          };
        }
      }

      return {
        ...prev,
        [day]: updatedAssignments,
      };
    });
  };

  const getShiftTimeConstraints = (shiftId: string) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return { min: '00:00', max: '23:59' };
    return {
      min: shift.startTime,
      max: shift.endTime,
    };
  };

  const handleOpen = (shift?: Shift) => {
    if (shift) {
      setEditingShift(shift);
      // Create Date objects for the current time with the shift's hours and minutes
      const today = new Date();
      const [startHours, startMinutes] = shift.startTime.split(':').map(Number);
      const [endHours, endMinutes] = shift.endTime.split(':').map(Number);
      
      const startDate = new Date(today);
      startDate.setHours(startHours, startMinutes, 0, 0);
      
      const endDate = new Date(today);
      endDate.setHours(endHours, endMinutes, 0, 0);

      setFormData({
        name: shift.name,
        startTime: startDate,
        endTime: endDate,
        duration: shift.duration,
        requiredEmployees: shift.requiredEmployees,
        color: shift.color,
        isOvernight: shift.isOvernight || false,
      });
    } else {
      setEditingShift(null);
      setFormData({
        name: '',
        startTime: new Date(),
        endTime: new Date(),
        duration: 0,
        requiredEmployees: 1,
        color: '#1976d2',
        isOvernight: false,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingShift(null);
  };

  const handleColorPickerOpen = (event: React.MouseEvent<HTMLElement>) => {
    setColorPickerAnchor(event.currentTarget);
  };

  const handleColorPickerClose = () => {
    setColorPickerAnchor(null);
  };

  const handleColorChange = (color: any) => {
    setFormData({ ...formData, color: color.hex });
    handleColorPickerClose();
  };

  const handleSubmit = async () => {
    // Calculate if it's an overnight shift based on times
    const startTimeStr = formData.startTime.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: undefined
    });
    const endTimeStr = formData.endTime.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: undefined
    });

    // Calculate if it's an overnight shift
    const calculatedIsOvernight = isOvernightShift(startTimeStr, endTimeStr);
    
    // Use either the manually set value or the calculated value
    const isOvernight = formData.isOvernight || calculatedIsOvernight;

    const newShift: Omit<Shift, 'id'> = {
      name: formData.name,
      startTime: startTimeStr,
      endTime: endTimeStr,
      duration: formData.duration,
      requiredEmployees: formData.requiredEmployees,
      color: formData.color,
      isOvernight,
    };

    try {
      if (editingShift) {
        await updateShift(editingShift.id, newShift);
      } else {
        await addShift(newShift);
      }
      handleClose();
    } catch (error) {
      console.error('Error saving shift:', error);
    }
  };

  const handleDelete = async (shiftId: string) => {
    if (window.confirm('Are you sure you want to delete this shift?')) {
      try {
        await deleteShift(shiftId);
      } catch (error) {
        console.error('Error deleting shift:', error);
      }
    }
  };

  const renderWeeklyDesign = () => (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Weekly Shift Design
      </Typography>
      <Grid container spacing={2}>
        {DAYS_OF_WEEK.map((day, dayIndex) => (
          <Grid item xs={12} md={6} key={day}>
            <Paper sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">{day}</Typography>
                <Button
                  startIcon={<AddCircleIcon />}
                  onClick={() => handleAddShiftToDay(day)}
                  size="small"
                >
                  Add Shift
                </Button>
              </Stack>
              
              <Stack spacing={2}>
                {weeklyDesign[day].map((assignment, index) => {
                  const selectedShift = shifts.find(s => s.id === assignment.shiftId);
                  return (
                    <Paper 
                      key={index} 
                      variant="outlined" 
                      sx={{ 
                        p: 2,
                        borderColor: selectedShift?.isOvernight ? 'primary.main' : undefined,
                        borderWidth: selectedShift?.isOvernight ? 2 : 1,
                        backgroundColor: selectedShift?.isOvernight ? 'primary.light' : undefined,
                      }}
                    >
                      <Stack spacing={2}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Select Shift</InputLabel>
                          <Select
                            value={assignment.shiftId}
                            label="Select Shift"
                            onChange={(e) => handleShiftAssignmentChange(day, index, 'shiftId', e.target.value)}
                          >
                            {shifts.map((shift) => (
                              <MenuItem key={shift.id} value={shift.id}>
                                {shift.name} ({shift.startTime} - {shift.endTime})
                                {shift.isOvernight && ' (Overnight)'}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        
                        {selectedShift && (
                          <>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <TextField
                                  label="Start Time"
                                  type="time"
                                  value={assignment.startTime}
                                  fullWidth
                                  size="small"
                                  InputProps={{
                                    readOnly: true,
                                  }}
                                  helperText={selectedShift.isOvernight && assignment.startTime === '00:00' 
                                    ? "Continues from previous day" 
                                    : "Shift start time"}
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <TextField
                                  label="End Time"
                                  type="time"
                                  value={assignment.endTime}
                                  fullWidth
                                  size="small"
                                  InputProps={{
                                    readOnly: true,
                                  }}
                                  helperText={selectedShift.isOvernight && assignment.startTime !== '00:00' 
                                    ? "Until midnight" 
                                    : "Shift end time"}
                                />
                              </Grid>
                            </Grid>

                            {selectedShift.isOvernight && assignment.startTime !== '00:00' && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip 
                                  label="Overnight Shift" 
                                  color="primary" 
                                  size="small"
                                  icon={<AccessTimeIcon />}
                                />
                                <TextField
                                  label="Next Day End Time"
                                  type="time"
                                  value={assignment.nextDayEndTime}
                                  fullWidth
                                  size="small"
                                  InputProps={{
                                    readOnly: true,
                                  }}
                                  helperText="Shift ends on next day"
                                />
                              </Box>
                            )}
                          </>
                        )}
                        
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveShiftFromDay(day, index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Total Hours: {calculateTotalHours(weeklyDesign[day])}
                </Typography>
                <Chip
                  label={calculateTotalHours(weeklyDesign[day]) === 24 ? "24 Hours" : "Incomplete"}
                  color={calculateTotalHours(weeklyDesign[day]) === 24 ? "success" : "warning"}
                  size="small"
                />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Shift Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ borderRadius: 2 }}
        >
          Add Shift
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Shift Types" />
        <Tab label="Weekly Design" />
      </Tabs>

      {selectedTab === 0 ? (
        <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Required Employees</TableCell>
                  <TableCell>Overnight</TableCell>
                  <TableCell>Color</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : shifts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No shifts found
                    </TableCell>
                  </TableRow>
                ) : (
                  shifts.map((shift) => (
                    <TableRow key={shift.id} hover>
                      <TableCell>{shift.name}</TableCell>
                      <TableCell>{shift.startTime}</TableCell>
                      <TableCell>{shift.endTime}</TableCell>
                      <TableCell>{shift.duration} hours</TableCell>
                      <TableCell>{shift.requiredEmployees}</TableCell>
                      <TableCell>{shift.isOvernight ? 'Yes' : 'No'}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: 1,
                            backgroundColor: shift.color,
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleOpen(shift)} color="primary">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => handleDelete(shift.id)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        renderWeeklyDesign()
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingShift ? 'Edit Shift' : 'Add New Shift'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Shift Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TimePicker
                    label="Start Time"
                    value={formData.startTime}
                    onChange={(newValue) => setFormData({ ...formData, startTime: newValue || new Date() })}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TimePicker
                    label="End Time"
                    value={formData.endTime}
                    onChange={(newValue) => setFormData({ ...formData, endTime: newValue || new Date() })}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>

            <TextField
              label="Duration (hours)"
              type="number"
              fullWidth
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
            />

            <TextField
              label="Required Employees"
              type="number"
              fullWidth
              value={formData.requiredEmployees}
              onChange={(e) => setFormData({ ...formData, requiredEmployees: Number(e.target.value) })}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isOvernight}
                  onChange={(e) => {
                    const newIsOvernight = e.target.checked;
                    setFormData(prev => ({ 
                      ...prev, 
                      isOvernight: newIsOvernight 
                    }));
                    
                    // If manually setting as overnight, adjust the end time to be on the next day
                    if (newIsOvernight) {
                      const endDate = new Date(formData.endTime);
                      endDate.setDate(endDate.getDate() + 1);
                      setFormData(prev => ({ ...prev, endTime: endDate }));
                    }
                  }}
                />
              }
              label="Overnight Shift"
            />

            <Box>
              <Button
                startIcon={<PaletteIcon />}
                onClick={handleColorPickerOpen}
                sx={{ mb: 1 }}
              >
                Choose Color
              </Button>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  backgroundColor: formData.color,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
              <Popover
                open={Boolean(colorPickerAnchor)}
                anchorEl={colorPickerAnchor}
                onClose={handleColorPickerClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
              >
                <SketchPicker color={formData.color} onChange={handleColorChange} />
              </Popover>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingShift ? 'Update' : 'Add'} Shift
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 