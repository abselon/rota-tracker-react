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
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay } from 'date-fns';
import { useAppContext } from '../context/AppContext';
import { Shift, ShiftAssignment } from '../types';

const ShiftBasedCalendar: React.FC = () => {
  const { state, addAssignment, deleteAssignment } = useAppContext();
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

  const handleCellClick = (event: React.MouseEvent<HTMLElement>, date: Date, shift: Shift) => {
    setAnchorEl(event.currentTarget);
    setSelectedCell({ date, shift });
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setSelectedCell(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Shift-Based Calendar
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

      <TableContainer 
        component={Paper} 
        sx={{ 
          mt: 2,
          maxHeight: 'calc(100vh - 200px)',
          overflow: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Table 
          size="small" 
          stickyHeader
          sx={{
            borderCollapse: 'separate',
            borderSpacing: 0,
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
                    minWidth: 120,
                    borderRight: index < weekDays.length - 1 ? '2px solid' : 'none',
                    borderColor: 'divider',
                    borderBottom: '2px solid',
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
                  }}
                >
                  <Box sx={{ p: 1, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: 'background.paper' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {shift.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {shift.startTime} - {shift.endTime}
                    </Typography>
                    <Chip
                      label={`${shift.requiredEmployees} required`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </TableCell>
                {weekDays.map((day, dayIndex) => {
                  const dayAssignments = getAssignmentsForShiftAndDate(shift.id, day);
                  return (
                    <TableCell
                      key={`${day.toString()}-${shift.id}`}
                      onClick={(e) => handleCellClick(e, day, shift)}
                      sx={{
                        height: 180,
                        backgroundColor: 'background.paper',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                        position: 'relative',
                        p: 0,
                        borderRight: dayIndex < weekDays.length - 1 ? '2px solid' : 'none',
                        borderColor: 'divider',
                        borderBottom: index < shifts.length - 1 ? '2px solid' : 'none',
                      }}
                    >
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          p: 1.5,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                        }}
                      >
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            flexShrink: 0,
                            pb: 1,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Chip
                            label={`${dayAssignments.length}/${shift.requiredEmployees}`}
                            size="small"
                            color={dayAssignments.length >= shift.requiredEmployees ? 'success' : 'warning'}
                          />
                          <Tooltip title="Add assignment">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDialog(day, shift);
                              }}
                              sx={{ color: 'primary.main' }}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>

                        <Box 
                          sx={{ 
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.75,
                            minHeight: 0,
                          }}
                        >
                          {dayAssignments.length > 2 ? (
                            <>
                              {dayAssignments.slice(0, 2).map((assignment) => (
                                <Box
                                  key={assignment.id}
                                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                                >
                                  <PersonIcon color="primary" fontSize="small" />
                                  <Typography 
                                    variant="body2" 
                                    noWrap
                                    sx={{ 
                                      maxWidth: '120px',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {getEmployeeName(assignment.employeeId)}
                                  </Typography>
                                </Box>
                              ))}
                              <Typography variant="body2" color="text.secondary">
                                +{dayAssignments.length - 2} more
                              </Typography>
                            </>
                          ) : (
                            dayAssignments.map((assignment) => (
                              <Box
                                key={assignment.id}
                                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                              >
                                <PersonIcon color="primary" fontSize="small" />
                                <Typography 
                                  variant="body2" 
                                  noWrap
                                  sx={{ 
                                    maxWidth: '120px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {getEmployeeName(assignment.employeeId)}
                                </Typography>
                              </Box>
                            ))
                          )}
                          {dayAssignments.length === 0 && (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                p: 1,
                                borderRadius: 0.75,
                                backgroundColor: 'background.default',
                                height: '100%',
                                minHeight: 32,
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              <Typography variant="body2" color="text.secondary">
                                No assignments
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                  );
                })}
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