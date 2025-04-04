import React, { useState, useEffect } from 'react';
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
  Stack,
  Chip,
  Tooltip,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
  Badge,
  Alert,
  Avatar,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Info as InfoIcon,
  Today as TodayIcon,
  FilterList as FilterIcon,
  AccessTime as AccessTimeIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay } from 'date-fns';
import { useAppContext } from '../context/AppContext';
import { Shift, ShiftAssignment, Employee } from '../types';

const ShiftBasedCalendar: React.FC = () => {
  const { state, addAssignment, deleteAssignment, dispatch } = useAppContext();
  const { employees, shifts, assignments, roles } = state;
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<ShiftAssignment | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ date: Date; shift: Shift } | null>(null);
  const [firebaseBlockedError, setFirebaseBlockedError] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [multiAssignmentDate, setMultiAssignmentDate] = useState<Date | null>(null);
  const [multiAssignmentShift, setMultiAssignmentShift] = useState<Shift | null>(null);
  const [multiAssignments, setMultiAssignments] = useState<Array<{ employeeId: string; roleId: string }>>([]);
  const theme = useTheme();

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Add this useEffect to load the saved order when the component mounts
  useEffect(() => {
    // Only proceed if we have shifts loaded
    if (shifts.length > 0) {
      const savedOrder = localStorage.getItem('shiftOrder');
      if (savedOrder) {
        const orderIds = JSON.parse(savedOrder);
        const orderedShifts = orderIds
          .map((id: string) => shifts.find(shift => shift.id === id))
          .filter((shift: Shift | undefined): shift is Shift => shift !== undefined);
        
        // Add any new shifts that weren't in the saved order
        const newShifts = shifts.filter(shift => !orderIds.includes(shift.id));
        const finalOrderedShifts = [...orderedShifts, ...newShifts];
        
        // Update the shifts in the context
        dispatch({ type: 'SET_SHIFTS', payload: finalOrderedShifts });
      } else {
        // If no saved order exists, save the current order
        localStorage.setItem('shiftOrder', JSON.stringify(shifts.map(shift => shift.id)));
      }
    }
  }, [shifts, dispatch]); // Add shifts and dispatch to dependencies

  const handleMoveShift = (index: number, direction: 'up' | 'down') => {
    const newShifts = [...shifts];
    if (direction === 'up' && index > 0) {
      [newShifts[index], newShifts[index - 1]] = [newShifts[index - 1], newShifts[index]];
    } else if (direction === 'down' && index < shifts.length - 1) {
      [newShifts[index], newShifts[index + 1]] = [newShifts[index + 1], newShifts[index]];
    }

    // Save the new order to localStorage
    localStorage.setItem('shiftOrder', JSON.stringify(newShifts.map(shift => shift.id)));
    
    // Update the local state
    dispatch({ type: 'SET_SHIFTS', payload: newShifts });
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
    setSelectedEmployee('');
    setSelectedRole('');
  };

  const handleDeleteClick = (assignment: ShiftAssignment) => {
    setAssignmentToDelete(assignment);
    setDeleteDialogOpen(true);
  };

  const handleFirebaseError = (error: any) => {
    if (error?.message?.includes('ERR_BLOCKED_BY_CLIENT') || 
        error?.code === 'permission-denied' ||
        error?.name === 'FirebaseError') {
      setFirebaseBlockedError(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (assignmentToDelete) {
      try {
        await deleteAssignment(assignmentToDelete.id);
        setDeleteDialogOpen(false);
        setAssignmentToDelete(null);
      } catch (error) {
        console.error('Error deleting assignment:', error);
        handleFirebaseError(error);
      }
    }
  };

  const getRoleAssignmentsForShiftAndDate = (shiftId: string, date: Date) => {
    const shiftAssignments = assignments.filter(
      (assignment) =>
        assignment.shiftId === shiftId &&
        isSameDay(new Date(assignment.date), date)
    );

    // Count how many times each role is assigned
    const roleCounts: Record<string, number> = {};
    shiftAssignments.forEach(assignment => {
      // Use the roleId from the assignment, not the employee's roles
      roleCounts[assignment.roleId] = (roleCounts[assignment.roleId] || 0) + 1;
    });

    return roleCounts;
  };

  const isRoleAvailable = (roleId: string, shift: Shift, date: Date) => {
    const roleAssignments = getRoleAssignmentsForShiftAndDate(shift.id, date);
    const shiftRole = shift.roles.find(r => r.roleId === roleId);
    if (!shiftRole) return false;
    
    return (roleAssignments[roleId] || 0) < shiftRole.count;
  };

  const handleSubmit = async () => {
    if (selectedDate && selectedEmployee && selectedShift && selectedRole) {
      try {
        // Check if employee already has this shift on this day
        const existingAssignment = assignments.find(
          (assignment) =>
            assignment.employeeId === selectedEmployee &&
            assignment.shiftId === selectedShift.id &&
            isSameDay(new Date(assignment.date), selectedDate)
        );

        if (existingAssignment) {
          alert('This employee is already assigned to this shift on this day.');
          return;
        }

        // Check if the role is still available
        if (!isRoleAvailable(selectedRole, selectedShift, selectedDate)) {
          alert('This role has already been filled for this shift.');
          return;
        }

        // Verify that the selected role exists in the shift's roles
        const shiftRole = selectedShift.roles.find(r => r.roleId === selectedRole);
        if (!shiftRole) {
          alert('Invalid role selected for this shift.');
          return;
        }

        const newAssignment: Omit<ShiftAssignment, 'id'> = {
          date: selectedDate.toISOString(),
          employeeId: selectedEmployee,
          shiftId: selectedShift.id,
          startTime: selectedShift.startTime,
          endTime: selectedShift.endTime,
          isOvernight: selectedShift.isOvernight,
          status: 'pending',
          roleId: shiftRole.roleId
        };

        await addAssignment(newAssignment);
        handleCloseDialog();
      } catch (error) {
        console.error('Error adding assignment:', error);
        handleFirebaseError(error);
      }
    }
  };

  const getAssignmentsForShiftAndDate = (shiftId: string, date: Date) => {
    return assignments.filter(
      (assignment) =>
        assignment.shiftId === shiftId &&
        isSameDay(new Date(assignment.date), date) &&
        assignment.employeeId
    );
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee?.name || 'Unknown Employee';
  };

  const getEmployeeColor = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee?.color || '#e0e0e0';
  };

  const handleCellClick = (event: React.MouseEvent<HTMLElement>, date: Date, shift: Shift) => {
    setAnchorEl(event.currentTarget);
    setSelectedCell({ date, shift });
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setSelectedCell(null);
  };

  const open = Boolean(anchorEl);

  const renderAssignments = (shiftId: string, date: Date) => {
    const assignments = getAssignmentsForShiftAndDate(shiftId, date);
    const shift = shifts.find(s => s.id === shiftId);
    
    return (
      <Box sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        p: 1,
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 1,
          px: 0.5,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              backgroundColor: assignments.length >= (shift?.requiredEmployees || 0) 
                ? 'success.light' 
                : 'warning.light',
              borderRadius: 1,
              px: 1,
              py: 0.5,
              transition: 'all 0.2s ease-in-out',
              border: '1px solid',
              borderColor: assignments.length >= (shift?.requiredEmployees || 0)
                ? 'success.main'
                : 'warning.main',
              '&:hover': {
                backgroundColor: assignments.length >= (shift?.requiredEmployees || 0)
                  ? 'success.main'
                  : 'warning.main',
                color: 'white',
                transform: 'translateY(-1px)',
                boxShadow: theme.shadows[1],
              }
            }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontSize: '0.7rem',
                }}
              >
                <PersonIcon sx={{ fontSize: 14 }} />
                {assignments.length}/{shift?.requiredEmployees || 0}
              </Typography>
            </Box>
          </Box>
          <Tooltip title="Add Assignment">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDialog(date, shift || undefined);
              }}
              sx={{ 
                color: 'white', 
                p: 0.5,
                backgroundColor: 'primary.main',
                transition: 'all 0.2s ease-in-out',
                width: 24,
                height: 24,
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  transform: 'scale(1.1)',
                }
              }}
            >
              <AddIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 0.5,
          flex: 1,
          overflow: 'hidden',
        }}>
          {assignments.slice(0, 6).map((assignment) => (
            <Paper
              key={assignment.id}
              elevation={0}
              sx={{
                width: '100%',
                height: 28,
                borderRadius: 1,
                backgroundColor: 'background.paper',
                border: '2px solid',
                borderColor: getEmployeeColor(assignment.employeeId),
                display: 'flex',
                alignItems: 'center',
                px: 1,
                transition: 'all 0.2s ease-in-out',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: theme.shadows[1],
                  borderColor: getEmployeeColor(assignment.employeeId),
                },
              }}
            >
              <Box 
                sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%',
                  backgroundColor: getEmployeeColor(assignment.employeeId),
                  mr: 1,
                  flexShrink: 0,
                }} 
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: 500,
                }}
              >
                {getEmployeeName(assignment.employeeId)}
              </Typography>
              <Tooltip title="Delete Assignment">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(assignment);
                  }}
                  sx={{ 
                    color: 'error.main',
                    p: 0.5,
                    ml: 0.5,
                    '&:hover': {
                      backgroundColor: 'error.light',
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Paper>
          ))}
          {assignments.length > 6 && (
            <Paper
              elevation={0}
              sx={{
                p: 1,
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
              onClick={(e) => shift && handleCellClick(e, date, shift)}
            >
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                  '&:hover': {
                    color: 'primary.main',
                  }
                }}
              >
                <InfoIcon fontSize="small" />
                View {assignments.length - 6} more assignments
              </Typography>
            </Paper>
          )}
          {assignments.length === 0 && (
            <Box 
              sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 1,
                color: 'text.secondary',
              }}
            >
              <PersonIcon sx={{ fontSize: 24, opacity: 0.5 }} />
              <Typography 
                variant="caption" 
                sx={{ 
                  textAlign: 'center',
                  fontStyle: 'italic',
                  opacity: 0.7,
                }}
              >
                No assignments
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  const hasRequiredRole = (employee: Employee, shift: Shift): boolean => {
    const employeeRoles = Array.isArray(employee.role) ? employee.role : [employee.role];
    const requiredRoles = shift.roles.map(role => role.roleId);
    return employeeRoles.some((role: string) => requiredRoles.includes(role));
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleMultiAssignmentDateChange = (date: Date | null) => {
    setMultiAssignmentDate(date);
    setMultiAssignments([]);
  };

  const handleMultiAssignmentShiftChange = (shift: Shift | null) => {
    setMultiAssignmentShift(shift);
    setMultiAssignments([]);
  };

  const handleAddMultiAssignment = (employeeId: string, roleId: string) => {
    setMultiAssignments(prev => [...prev, { employeeId, roleId }]);
  };

  const handleRemoveMultiAssignment = (index: number) => {
    setMultiAssignments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitMultiAssignments = async () => {
    if (!multiAssignmentDate || !multiAssignmentShift) return;

    try {
      for (const assignment of multiAssignments) {
        const newAssignment: Omit<ShiftAssignment, 'id'> = {
          date: multiAssignmentDate.toISOString(),
          employeeId: assignment.employeeId,
          shiftId: multiAssignmentShift.id,
          startTime: multiAssignmentShift.startTime,
          endTime: multiAssignmentShift.endTime,
          isOvernight: multiAssignmentShift.isOvernight,
          status: 'pending',
          roleId: assignment.roleId
        };

        await addAssignment(newAssignment);
      }

      setMultiAssignmentDate(null);
      setMultiAssignmentShift(null);
      setMultiAssignments([]);
    } catch (error) {
      console.error('Error adding multi-assignments:', error);
      handleFirebaseError(error);
    }
  };

  const MultiAssignmentPanel = () => (
    <Box sx={{ p: 3 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Multi-assignment Panel</Typography>
        
        <Stack spacing={3}>
          <TextField
            label="Date"
            type="date"
            value={multiAssignmentDate ? format(multiAssignmentDate, 'yyyy-MM-dd') : ''}
            onChange={(e) => handleMultiAssignmentDateChange(e.target.value ? new Date(e.target.value) : null)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <FormControl fullWidth>
            <InputLabel>Select Shift</InputLabel>
            <Select
              value={multiAssignmentShift?.id || ''}
              onChange={(e) => {
                const shift = shifts.find(s => s.id === e.target.value);
                handleMultiAssignmentShiftChange(shift || null);
              }}
              label="Select Shift"
            >
              {shifts.map((shift) => (
                <MenuItem key={shift.id} value={shift.id}>
                  {shift.name} ({shift.startTime} - {shift.endTime})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {multiAssignmentDate && multiAssignmentShift && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Available Employees</Typography>
              <Grid container spacing={2}>
                {employees
                  .filter(employee => {
                    const employeeRoles = Array.isArray(employee.role) ? employee.role : [employee.role];
                    return multiAssignmentShift.roles.some(shiftRole => 
                      employeeRoles.includes(shiftRole.roleId) &&
                      isRoleAvailable(shiftRole.roleId, multiAssignmentShift, multiAssignmentDate)
                    );
                  })
                  .map(employee => (
                    <Grid item xs={12} sm={6} md={4} key={employee.id}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Avatar sx={{ bgcolor: employee.color }}>
                              {employee.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1">{employee.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {Array.isArray(employee.role) ? employee.role.length : 1} roles
                              </Typography>
                            </Box>
                          </Box>
                          <FormControl fullWidth>
                            <InputLabel>Select Role</InputLabel>
                            <Select
                              value={multiAssignments.find(a => a.employeeId === employee.id)?.roleId || ''}
                              onChange={(e) => handleAddMultiAssignment(employee.id, e.target.value)}
                              label="Select Role"
                            >
                              {multiAssignmentShift.roles
                                .filter(shiftRole => {
                                  const employeeRoles = Array.isArray(employee.role) ? employee.role : [employee.role];
                                  return employeeRoles.includes(shiftRole.roleId) &&
                                         isRoleAvailable(shiftRole.roleId, multiAssignmentShift, multiAssignmentDate);
                                })
                                .map(shiftRole => {
                                  const role = roles.find(r => r.id === shiftRole.roleId);
                                  return (
                                    <MenuItem key={shiftRole.roleId} value={shiftRole.roleId}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                          sx={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: '50%',
                                            backgroundColor: role?.color || 'primary.main',
                                          }}
                                        />
                                        <Typography>
                                          {role?.name || 'Unknown Role'} ({getRoleAssignmentsForShiftAndDate(multiAssignmentShift.id, multiAssignmentDate)[role?.id || ''] || 0}/{shiftRole.count})
                                        </Typography>
                                      </Box>
                                    </MenuItem>
                                  );
                                })}
                            </Select>
                          </FormControl>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
            </Box>
          )}

          {multiAssignments.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Selected Assignments</Typography>
              <List>
                {multiAssignments.map((assignment, index) => {
                  const employee = employees.find(e => e.id === assignment.employeeId);
                  const role = roles.find(r => r.id === assignment.roleId);
                  return (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton edge="end" onClick={() => handleRemoveMultiAssignment(index)}>
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: employee?.color }}>
                          {employee?.name.charAt(0)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={employee?.name}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: role?.color || 'primary.main',
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {role?.name || 'Unknown Role'}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
              <Button
                variant="contained"
                onClick={handleSubmitMultiAssignments}
                fullWidth
                sx={{ mt: 2 }}
              >
                Submit Assignments
              </Button>
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
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
              Shift-Based Calendar
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
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Calendar View" />
          <Tab label="Multi-assignment Panel" />
        </Tabs>
      </Paper>

      {activeTab === 0 ? (
        <TableContainer 
          component={Paper} 
          sx={{ 
            mt: 2,
            height: 'calc(100vh - 200px)',
            overflow: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            boxShadow: theme.shadows[2],
            position: 'relative',
            '&::-webkit-scrollbar': {
              width: '10px',
              height: '10px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'background.default',
              borderRadius: '5px',
              margin: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.primary.main,
              borderRadius: '5px',
              border: '2px solid',
              borderColor: 'background.default',
              backgroundClip: 'padding-box',
              minHeight: '40px',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                background: theme.palette.primary.dark,
                borderColor: 'background.default',
              },
              '&:active': {
                background: theme.palette.primary.dark,
              },
            },
            '&::-webkit-scrollbar-corner': {
              background: 'background.default',
            },
          }}
        >
          <Table 
            size="small" 
            stickyHeader
            sx={{
              borderCollapse: 'separate',
              borderSpacing: 0,
              tableLayout: 'fixed',
              '& th, & td': {
                borderColor: 'divider',
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ 
                    width: 150, 
                    backgroundColor: 'background.default',
                    position: 'sticky',
                    left: 0,
                    zIndex: 2,
                    borderRight: '2px solid',
                    borderColor: 'divider',
                    borderBottom: '2px solid',
                    p: 2,
                    boxShadow: '2px 0 4px rgba(0,0,0,0.05)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimeIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Shift
                    </Typography>
                  </Box>
                </TableCell>
                {weekDays.map((day, index) => (
                  <TableCell 
                    key={day.toString()} 
                    align="center" 
                    sx={{ 
                      backgroundColor: 'background.default',
                      width: 150,
                      borderRight: index < weekDays.length - 1 ? '2px solid' : 'none',
                      borderColor: 'divider',
                      borderBottom: '2px solid',
                      p: 2,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      }
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                      {format(day, 'EEE')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(day, 'MMM d')}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {shifts.map((shift, index) => (
                <TableRow key={shift.id}>
                  <TableCell 
                    component="th" 
                    scope="row" 
                    sx={{ 
                      backgroundColor: 'background.default',
                      position: 'sticky',
                      left: 0,
                      zIndex: 1,
                      borderRight: '2px solid',
                      borderColor: 'divider',
                      borderBottom: index < shifts.length - 1 ? '2px solid' : 'none',
                      p: 2,
                      width: 150,
                      boxShadow: '2px 0 4px rgba(0,0,0,0.05)',
                      height: 160,
                    }}
                  >
                    <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      {index > 0 && (
                        <IconButton
                          size="small"
                          onClick={() => handleMoveShift(index, 'up')}
                          sx={{ 
                            position: 'absolute',
                            top: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: 'background.paper',
                            boxShadow: theme.shadows[1],
                            width: 24,
                            height: 24,
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            }
                          }}
                        >
                          <ChevronLeftIcon sx={{ transform: 'rotate(90deg)', fontSize: 20 }} />
                        </IconButton>
                      )}
                      <Paper
                        elevation={0}
                        sx={{ 
                          p: 1.5, 
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          backgroundColor: 'background.paper',
                          transition: 'all 0.2s ease-in-out',
                          mt: index > 0 ? 2 : 0,
                          mb: index < shifts.length - 1 ? 2 : 0,
                          position: 'relative',
                          '&:hover': {
                            boxShadow: theme.shadows[1],
                            borderColor: 'primary.main',
                          }
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          gap: 1,
                        }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.75,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            pb: 0.75,
                          }}>
                            <AccessTimeIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {shift.name}
                            </Typography>
                          </Box>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.75,
                            pl: 0.5,
                          }}>
                            <ScheduleIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {shift.startTime} - {shift.endTime}
                            </Typography>
                          </Box>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            gap: 0.5,
                            backgroundColor: 'primary.light',
                            color: 'primary.main',
                            borderRadius: 1,
                            px: 0.75,
                            py: 0.25,
                            width: 'fit-content',
                            mx: 'auto',
                            minWidth: '24px',
                            height: '20px',
                            cursor: 'pointer',
                          }}>
                            <Tooltip 
                              title={
                                <Box sx={{ p: 1 }}>
                                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Required Roles:</Typography>
                                  {shift.roles.map((role, index) => {
                                    const roleData = roles.find(r => r.id === role.roleId);
                                    return (
                                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <Box sx={{ 
                                          width: 8, 
                                          height: 8, 
                                          borderRadius: '50%',
                                          backgroundColor: roleData?.color || theme.palette.primary.main,
                                        }} />
                                        <Typography variant="body2">
                                          {roleData?.name || role.roleId} ({role.count})
                                        </Typography>
                                      </Box>
                                    );
                                  })}
                                </Box>
                              }
                              arrow
                              placement="top"
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <GroupIcon sx={{ fontSize: 12 }} />
                                <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.7rem' }}>
                                  {shift.requiredEmployees}
                                </Typography>
                              </Box>
                            </Tooltip>
                          </Box>
                        </Box>
                      </Paper>
                      {index < shifts.length - 1 && (
                        <IconButton
                          size="small"
                          onClick={() => handleMoveShift(index, 'down')}
                          sx={{ 
                            position: 'absolute',
                            bottom: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: 'background.paper',
                            boxShadow: theme.shadows[1],
                            width: 24,
                            height: 24,
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            }
                          }}
                        >
                          <ChevronRightIcon sx={{ transform: 'rotate(90deg)', fontSize: 20 }} />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                  {weekDays.map((day, dayIndex) => (
                    <TableCell
                      key={day.toString()}
                      align="center"
                      onClick={(e) => handleCellClick(e, day, shift)}
                      sx={{
                        cursor: 'pointer',
                        width: 150,
                        height: 160,
                        borderRight: dayIndex < weekDays.length - 1 ? '2px solid' : 'none',
                        borderColor: 'divider',
                        borderBottom: index < shifts.length - 1 ? '2px solid' : 'none',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                        p: 0,
                        overflow: 'hidden',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          border: '1px solid',
                          borderColor: 'divider',
                          pointerEvents: 'none',
                          opacity: 0.5,
                        }
                      }}
                    >
                      {renderAssignments(shift.id, day)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <MultiAssignmentPanel />
      )}

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {selectedCell && (
          <Box sx={{ p: 2, maxWidth: 300 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <InfoIcon color="primary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {format(selectedCell.date, 'EEEE, MMMM d')}
              </Typography>
            </Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              {selectedCell.shift.name} ({selectedCell.shift.startTime} - {selectedCell.shift.endTime})
            </Typography>
            <Divider sx={{ my: 1 }} />
            <List dense>
              {getAssignmentsForShiftAndDate(selectedCell.shift.id, selectedCell.date).map((assignment) => {
                const employee = employees.find(e => e.id === assignment.employeeId);
                const role = roles.find(r => r.id === assignment.roleId);
                console.log('Assignment:', assignment);
                console.log('Found role:', role);
                console.log('All roles:', roles);
                return (
                  <ListItem key={assignment.id}>
                    <ListItemIcon>
                      <PersonIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={getEmployeeName(assignment.employeeId)}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: role?.color || 'primary.main',
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {role?.name || 'Unknown Role'} • {assignment.status}
                          </Typography>
                        </Box>
                      }
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
              onClick={() => {
                handlePopoverClose();
                handleOpenDialog(selectedCell.date, selectedCell.shift);
              }}
            >
              Add Assignment
            </Button>
          </Box>
        )}
      </Popover>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Assignment</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Employee</InputLabel>
              <Select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                label="Employee"
              >
                {employees
                  .filter(employee => {
                    if (!selectedShift) return true;
                    const employeeRoles = Array.isArray(employee.role) ? employee.role : [employee.role];
                    return selectedShift.roles.some(shiftRole => 
                      employeeRoles.includes(shiftRole.roleId)
                    );
                  })
                  .map((employee) => {
                    const employeeRoles = Array.isArray(employee.role) ? employee.role : [employee.role];
                    const roleData = employeeRoles.map(roleId => roles.find(r => r.id === roleId));
                    return (
                      <MenuItem key={employee.id} value={employee.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              bgcolor: employee.color || theme.palette.primary.main,
                              fontSize: '0.75rem'
                            }}
                          >
                            {employee.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">{employee.name}</Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                              {roleData.map((role, index) => role && (
                                <Chip
                                  key={index}
                                  label={role.name}
                                  size="small"
                                  sx={{
                                    backgroundColor: role.color || theme.palette.primary.main,
                                    color: 'white',
                                    height: 20,
                                    '& .MuiChip-label': {
                                      px: 0.5,
                                      fontSize: '0.7rem'
                                    }
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        </Box>
                      </MenuItem>
                    );
                  })}
              </Select>
            </FormControl>

            {selectedEmployee && selectedShift && (
              <FormControl fullWidth>
                <InputLabel>Select Role</InputLabel>
                <Select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  label="Select Role"
                >
                  {(() => {
                    const employee = employees.find(e => e.id === selectedEmployee);
                    if (!employee) return null;
                    
                    const employeeRoles = Array.isArray(employee.role) ? employee.role : [employee.role];
                    return selectedShift.roles
                      .filter(shiftRole => {
                        // Only show roles that the employee has AND are still available
                        return employeeRoles.includes(shiftRole.roleId) && 
                               isRoleAvailable(shiftRole.roleId, selectedShift, selectedDate!);
                      })
                      .map((shiftRole) => {
                        const role = roles.find(r => r.id === shiftRole.roleId);
                        if (!role) return null;
                        return (
                          <MenuItem key={role.id} value={role.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  backgroundColor: role.color,
                                }}
                              />
                              <Typography>
                                {role.name} ({getRoleAssignmentsForShiftAndDate(selectedShift.id, selectedDate!)[role.id] || 0}/{shiftRole.count})
                              </Typography>
                            </Box>
                          </MenuItem>
                        );
                      });
                  })()}
                </Select>
              </FormControl>
            )}

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
            disabled={!selectedEmployee || !selectedDate}
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

      <Dialog
        open={firebaseBlockedError}
        onClose={() => setFirebaseBlockedError(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="warning" />
            <Typography>Firebase Connection Blocked</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography>
              It looks like your browser is blocking connections to Firebase. This is usually caused by ad blockers or privacy extensions.
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              To fix this, you can:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Temporarily disable your ad blocker for this site"
                  secondary="This is the quickest solution"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Add these domains to your ad blocker's whitelist:"
                  secondary="firestore.googleapis.com, *.firebaseio.com, *.firebase.google.com"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Try using the app in an Incognito/Private window"
                  secondary="Extensions are usually disabled in private browsing"
                />
              </ListItem>
            </List>
            <Alert severity="info" sx={{ mt: 2 }}>
              After making these changes, you may need to refresh the page.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFirebaseBlockedError(false)}>
            Close
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              window.location.reload();
            }}
          >
            Refresh Page
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShiftBasedCalendar; 