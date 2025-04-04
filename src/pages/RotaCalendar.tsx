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
  Tooltip,
  Skeleton,
  Divider,
  Chip,
  useTheme,
  useMediaQuery,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Today as TodayIcon,
  FilterList as FilterIcon,
  ViewWeek as ViewWeekIcon,
  ViewDay as ViewDayIcon,
  Info as InfoIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { useAppContext } from '../context/AppContext';
import { Shift, Employee, ShiftAssignment } from '../types';
import Collapse from '@mui/material/Collapse';
import { SketchPicker } from 'react-color';

const RotaCalendar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([0]);
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [assignmentAnchorEl, setAssignmentAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<ShiftAssignment | null>(null);
  const [dayAnchorEl, setDayAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

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
      // Check if employee already has this shift on this day
      const existingAssignment = assignments.find(
        (assignment) =>
          assignment.employeeId === selectedEmployee.id &&
          assignment.shiftId === selectedShift.id &&
          isSameDay(new Date(assignment.date), selectedDate)
      );

      if (existingAssignment) {
        alert('This employee is already assigned to this shift on this day.');
        return;
      }

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

  const handleWeekExpand = (weekIndex: number) => {
    setExpandedWeeks(prev => 
      prev.includes(weekIndex) 
        ? prev.filter(w => w !== weekIndex)
        : [...prev, weekIndex]
    );
  };

  const handleAssignmentClick = (event: React.MouseEvent<HTMLElement>, assignment: ShiftAssignment) => {
    event.stopPropagation();
    setAssignmentAnchorEl(event.currentTarget);
    setSelectedAssignment(assignment);
  };

  const handleDayClick = (event: React.MouseEvent<HTMLElement>, date: Date) => {
    event.stopPropagation();
    setDayAnchorEl(event.currentTarget);
    setSelectedDay(date);
  };

  const handleClosePopover = () => {
    setAssignmentAnchorEl(null);
    setDayAnchorEl(null);
    setSelectedAssignment(null);
    setSelectedDay(null);
  };

  const LoadingSkeleton = () => (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="text" width={150} height={24} />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
      </Box>
      <Grid container spacing={3}>
        {[1, 2, 3].map((week) => (
          <Grid item xs={12} key={week}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const AssignmentPopover = () => {
    if (!selectedAssignment) return null;

    const employee = employees.find(e => e.id === selectedAssignment.employeeId);
    const shift = shifts.find(s => s.id === selectedAssignment.shiftId);

    return (
      <Popover
        open={Boolean(assignmentAnchorEl)}
        anchorEl={assignmentAnchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, maxWidth: 300 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <PersonIcon color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {employee?.name}
            </Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <List dense>
            <ListItem>
              <ListItemIcon>
                <WorkIcon color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Shift"
                secondary={shift?.name}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <TimeIcon color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Time"
                secondary={`${shift?.startTime} - ${shift?.endTime}`}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <EmailIcon color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Email"
                secondary={employee?.email}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <PhoneIcon color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Phone"
                secondary={employee?.phone}
              />
            </ListItem>
          </List>
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(selectedAssignment);
                handleClosePopover();
              }}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Popover>
    );
  };

  const DayPopover = () => {
    if (!selectedDay) return null;

    const dayAssignments = getAssignmentsForDate(selectedDay);

    return (
      <Popover
        open={Boolean(dayAnchorEl)}
        anchorEl={dayAnchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, maxWidth: 400 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <InfoIcon color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {format(selectedDay, 'EEEE, MMMM d')}
            </Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <List dense>
            {dayAssignments.map((assignment) => {
              const employee = employees.find(e => e.id === assignment.employeeId);
              const shift = shifts.find(s => s.id === assignment.shiftId);
              return (
                <ListItem key={assignment.id}>
                  <ListItemIcon>
                    <PersonIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={employee?.name}
                    secondary={`${shift?.name} (${shift?.startTime} - ${shift?.endTime})`}
                  />
                </ListItem>
              );
            })}
          </List>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            fullWidth
            sx={{ mt: 2 }}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDialog(selectedDay);
              handleClosePopover();
            }}
          >
            Add Assignment
          </Button>
        </Box>
      </Popover>
    );
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 4, 
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: 'white',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Employee Calendar
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              {format(weekStart, 'MMMM d')} - {format(addDays(weekStart, 6), 'MMMM d, yyyy')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Tooltip title="Previous Week">
              <IconButton onClick={handlePreviousWeek} sx={{ color: 'white' }}>
                <ChevronLeftIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Today">
              <IconButton onClick={() => setWeekStart(startOfWeek(new Date()))} sx={{ color: 'white' }}>
                <TodayIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Next Week">
              <IconButton onClick={handleNextWeek} sx={{ color: 'white' }}>
                <ChevronRightIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog(new Date())}
              sx={{ 
                backgroundColor: 'white',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                }
              }}
            >
              Add Assignment
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            startIcon={<ViewWeekIcon />}
            variant={viewMode === 'week' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('week')}
          >
            Week View
          </Button>
          <Button
            startIcon={<ViewDayIcon />}
            variant={viewMode === 'day' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('day')}
          >
            Day View
          </Button>
          <Button
            startIcon={<FilterIcon />}
            variant="outlined"
          >
            Filter
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {Array.from({ length: viewMode === 'week' ? 5 : 1 }).map((_, weekIndex) => {
          const weekStartDate = addWeeks(weekStart, weekIndex);
          const weekDays = getWeekDays(weekStartDate);
          const weekRange = `${format(weekStartDate, 'MMMM d')} - ${format(addDays(weekStartDate, 6), 'MMMM d')}`;
          const isExpanded = expandedWeeks.includes(weekIndex);

          return (
            <Grid container item xs={12} key={weekIndex} spacing={3}>
              <Grid item xs={12}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    backgroundColor: 'background.default',
                    mb: 2,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[2],
                    }
                  }}
                  onClick={() => handleWeekExpand(weekIndex)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Week {weekIndex + 1}: {weekRange}
                      </Typography>
                      <Chip 
                        label={isExpanded ? 'Expanded' : 'Collapsed'} 
                        size="small" 
                        color={isExpanded ? 'primary' : 'default'}
                        variant="outlined"
                      />
                    </Box>
                    <ExpandMoreIcon 
                      sx={{ 
                        transform: isExpanded ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s ease-in-out'
                      }} 
                    />
                  </Box>
                </Paper>
              </Grid>

              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Grid container spacing={2}>
                  {weekDays.map((date, dayIndex) => {
                    const assignments = getAssignmentsForDate(date);
                    const isCurrentDay = isToday(date);

                    return (
                      <Grid item xs={12} sm={6} md={4} key={dayIndex}>
                        <Card 
                          elevation={0}
                          sx={{ 
                            height: 300,
                            border: '1px solid',
                            borderColor: isCurrentDay ? 'primary.main' : 'divider',
                            borderRadius: 2,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              boxShadow: theme.shadows[2],
                            }
                          }}
                          onClick={(e) => handleDayClick(e, date)}
                        >
                          <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                  fontWeight: 600,
                                  color: isCurrentDay ? 'primary.main' : 'text.primary'
                                }}
                              >
                                {format(date, 'EEEE, MMMM d')}
                              </Typography>
                              <Badge badgeContent={assignments.length} color="primary">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenDialog(date);
                                  }}
                                  sx={{ 
                                    color: 'primary.main',
                                    '&:hover': {
                                      backgroundColor: 'primary.light',
                                    }
                                  }}
                                >
                                  <AddIcon fontSize="small" />
                                </IconButton>
                              </Badge>
                            </Box>

                            <Box sx={{ flex: 1 }}>
                              <Stack spacing={1}>
                                {assignments.slice(0, 2).map((assignment) => {
                                  const employee = employees.find(e => e.id === assignment.employeeId);
                                  const shift = shifts.find(s => s.id === assignment.shiftId);

                                  return (
                                    <Paper
                                      key={assignment.id}
                                      elevation={0}
                                      sx={{
                                        p: 1.5,
                                        backgroundColor: 'background.paper',
                                        border: '2px solid',
                                        borderColor: employee?.color || 'grey.300',
                                        borderRadius: 1,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                          transform: 'translateY(-1px)',
                                          boxShadow: theme.shadows[1],
                                          borderColor: employee?.color || 'primary.main',
                                        }
                                      }}
                                      onClick={(e) => handleAssignmentClick(e, assignment)}
                                    >
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            {employee?.name}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            {shift?.name} ({shift?.startTime} - {shift?.endTime})
                                          </Typography>
                                        </Box>
                                        <Box 
                                          sx={{ 
                                            width: 12, 
                                            height: 12, 
                                            borderRadius: '50%',
                                            backgroundColor: employee?.color || 'grey.300',
                                            ml: 1
                                          }} 
                                        />
                                      </Box>
                                    </Paper>
                                  );
                                })}
                                {assignments.length > 2 && (
                                  <Paper
                                    elevation={0}
                                    sx={{
                                      p: 1.5,
                                      backgroundColor: 'background.paper',
                                      border: '2px dashed',
                                      borderColor: 'divider',
                                      borderRadius: 1,
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease-in-out',
                                      '&:hover': {
                                        borderColor: 'primary.main',
                                        backgroundColor: 'action.hover',
                                      }
                                    }}
                                    onClick={(e) => handleDayClick(e, date)}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <Typography 
                                        variant="caption" 
                                        color="text.secondary"
                                        sx={{ 
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 0.5,
                                          '&:hover': {
                                            color: 'primary.main',
                                          }
                                        }}
                                      >
                                        <InfoIcon fontSize="small" />
                                        View {assignments.length - 2} more assignments
                                      </Typography>
                                    </Box>
                                  </Paper>
                                )}
                              </Stack>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Collapse>
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
                  setSelectedEmployee((prev: Employee | null) => {
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

      <AssignmentPopover />
      <DayPopover />
    </Box>
  );
};

export default RotaCalendar; 