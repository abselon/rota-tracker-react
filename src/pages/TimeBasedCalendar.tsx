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
} from '@mui/icons-material';
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay } from 'date-fns';
import { useAppContext } from '../context/AppContext';
import { Shift, ShiftAssignment } from '../types';

const ShiftBasedCalendar: React.FC = () => {
  const { state, addAssignment, deleteAssignment, dispatch } = useAppContext();
  const { employees, shifts, assignments } = state;
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<ShiftAssignment | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ date: Date; shift: Shift } | null>(null);
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
          assignment.employeeId === selectedEmployee &&
          assignment.shiftId === selectedShift.id &&
          isSameDay(new Date(assignment.date), selectedDate)
      );

      if (existingAssignment) {
        alert('This employee is already assigned to this shift on this day.');
        return;
      }

      await addAssignment({
        date: selectedDate.toISOString(),
        employeeId: selectedEmployee,
        shiftId: selectedShift.id,
        status: 'pending',
      });
      handleCloseDialog();
    }
  };

  const getAssignmentsForShiftAndDate = (shiftId: string, date: Date) => {
    return assignments.filter(
      (assignment) =>
        assignment.shiftId === shiftId &&
        isSameDay(new Date(assignment.date), date)
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
                        }}>
                          <GroupIcon sx={{ fontSize: 12 }} />
                          <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.7rem' }}>
                            {shift.requiredEmployees}
                          </Typography>
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
              {getAssignmentsForShiftAndDate(selectedCell.shift.id, selectedCell.date).map((assignment) => (
                <ListItem key={assignment.id}>
                  <ListItemIcon>
                    <PersonIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={getEmployeeName(assignment.employeeId)}
                    secondary={assignment.status}
                  />
                </ListItem>
              ))}
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
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.name}
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
    </Box>
  );
};

export default ShiftBasedCalendar; 