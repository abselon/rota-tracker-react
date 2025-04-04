import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  NightsStay as NightsStayIcon,
} from '@mui/icons-material';
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay } from 'date-fns';
import { useAppContext } from '../context/AppContext';
import { Shift, ShiftAssignment } from '../types';

const RoleBasedCalendar: React.FC = () => {
  const theme = useTheme();
  const { state } = useAppContext();
  const { roles, shifts, assignments } = state;
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedRole, setSelectedRole] = useState<string>('');

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getShiftsForDayAndRole = (date: Date, roleId: string): (Shift & { assignment: ShiftAssignment })[] => {
    // Get assignments for this day and role
    const dayAssignments = assignments.filter(assignment => {
      const assignmentDate = new Date(assignment.date);
      return isSameDay(assignmentDate, date) && assignment.employeeId === roleId; // Using employeeId as a temporary workaround
    });

    // Map assignments to shifts
    return dayAssignments.map(assignment => {
      const shift = shifts.find(s => s.id === assignment.shiftId);
      if (!shift) return null;
      return { ...shift, assignment };
    }).filter(Boolean) as (Shift & { assignment: ShiftAssignment })[];
  };

  const handlePreviousWeek = () => {
    setWeekStart(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setWeekStart(prev => addWeeks(prev, 1));
  };

  const handleRoleChange = (event: SelectChangeEvent) => {
    setSelectedRole(event.target.value);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          backgroundColor: theme.palette.background.default 
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Role-Based Calendar
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Select Role</InputLabel>
              <Select
                value={selectedRole}
                onChange={handleRoleChange}
                label="Select Role"
              >
                {roles.map(role => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Previous Week">
                <IconButton onClick={handlePreviousWeek} size="small">
                  <ChevronLeftIcon />
                </IconButton>
              </Tooltip>
              <Typography variant="h6" sx={{ mx: 2, fontSize: '1rem', color: theme.palette.text.secondary }}>
                {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
              </Typography>
              <Tooltip title="Next Week">
                <IconButton onClick={handleNextWeek} size="small">
                  <ChevronRightIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
          <Table sx={{ minWidth: 800, borderCollapse: 'separate', borderSpacing: 0 }}>
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ 
                    width: '120px',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    fontWeight: 600,
                    color: theme.palette.text.secondary,
                    backgroundColor: theme.palette.background.paper,
                    borderRight: `1px solid ${theme.palette.divider}`
                  }}
                >
                  Day
                </TableCell>
                {weekDays.map((day) => (
                  <TableCell
                    key={day.toISOString()}
                    align="center"
                    sx={{
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      borderLeft: `1px solid ${theme.palette.divider}`,
                      borderRight: `1px solid ${theme.palette.divider}`,
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      p: 0,
                      backgroundColor: theme.palette.background.paper,
                      width: `${100 / 7}%`
                    }}
                  >
                    <Box sx={{ 
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      py: 1.5,
                      px: 2
                    }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        {format(day, 'EEEE')}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        display="block" 
                        sx={{ 
                          color: theme.palette.text.secondary,
                          mt: 0.5,
                          fontSize: '0.75rem'
                        }}
                      >
                        {format(day, 'MMM d')}
                      </Typography>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedRole && roles.map(role => {
                if (role.id !== selectedRole) return null;
                return (
                  <TableRow key={role.id}>
                    <TableCell
                      sx={{
                        borderBottom: 'none',
                        fontWeight: 500,
                        backgroundColor: theme.palette.background.paper,
                        p: 0,
                        borderRight: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      <Box sx={{ p: 1.5 }}>
                        {role.name}
                      </Box>
                    </TableCell>
                    {weekDays.map((day) => {
                      const dayShifts = getShiftsForDayAndRole(day, role.id);
                      return (
                        <TableCell
                          key={`${day.toISOString()}-${role.id}`}
                          sx={{
                            borderBottom: 'none',
                            backgroundColor: theme.palette.background.paper,
                            p: 0,
                            minWidth: '100px',
                            borderLeft: `1px solid ${theme.palette.divider}`,
                            borderRight: `1px solid ${theme.palette.divider}`,
                            width: `${100 / 7}%`
                          }}
                        >
                          <Box sx={{ p: 1 }}>
                            {dayShifts.length === 0 ? (
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: theme.palette.text.secondary,
                                  fontSize: '0.75rem'
                                }}
                              >
                                No shifts
                              </Typography>
                            ) : (
                              dayShifts.map((shift) => (
                                <Paper
                                  key={`${day.toISOString()}-${shift.id}`}
                                  elevation={0}
                                  sx={{
                                    p: 1,
                                    mb: 1,
                                    backgroundColor: theme.palette.action.hover,
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                      backgroundColor: theme.palette.action.selected,
                                      transform: 'scale(1.02)',
                                    }
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {shift.name}
                                    </Typography>
                                    {shift.isOvernight && (
                                      <Tooltip title="Overnight Shift">
                                        <NightsStayIcon fontSize="small" color="primary" />
                                      </Tooltip>
                                    )}
                                  </Box>
                                  <Typography variant="caption">
                                    {shift.assignment.startTime} - {shift.assignment.endTime}
                                  </Typography>
                                </Paper>
                              ))
                            )}
                          </Box>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default RoleBasedCalendar; 