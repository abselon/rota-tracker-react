import React, { useState, useMemo } from 'react';
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
  Chip,
  Alert,
  Avatar,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  NightsStay as NightsStayIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay, endOfWeek } from 'date-fns';
import { useAppContext } from '../context/AppContext';
import { Shift, ShiftAssignment, Employee, Role } from '../types/index';
import { hasRequiredRole } from '../utils/shiftUtils';

// Constants from ShiftManagement
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface DayShiftAssignment {
  shiftId: string;
  startTime: string;
  endTime: string;
  isOvernight: boolean;
  nextDayEndTime?: string;
  employeeId?: string;
}

interface WeeklyDesign {
  [day: string]: DayShiftAssignment[];
}

const MasterCalendar: React.FC = () => {
  const theme = useTheme();
  const { state, addAssignment, deleteAssignment } = useAppContext();
  const { roles, shifts, assignments, employees } = state;
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedAssignment, setSelectedAssignment] = useState<{
    day: string;
    shiftId: string;
    employeeId?: string;
  } | null>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // This would normally come from ShiftManagement's state
  // For now, we'll use a default empty design
  const weeklyDesign: WeeklyDesign = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = [];
    return acc;
  }, {} as WeeklyDesign);

  const getShiftsForDay = (date: Date): (Shift & { assignment: ShiftAssignment })[] => {
    // Get assignments for this day
    const dayAssignments = assignments.filter(assignment => {
      const assignmentDate = new Date(assignment.date);
      return isSameDay(assignmentDate, date);
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

  const handleEmployeeAssignment = async (day: string, shiftId: string, employeeId: string) => {
    const shift = shifts.find(s => s.id === shiftId);
    const employee = employees.find(e => e.id === employeeId);
    
    if (!shift || !employee) return;

    // Check if employee has required role
    if (!hasRequiredRole(employee, shift)) {
      return;
    }

    // Check if employee already has this shift on this day
    const existingAssignment = assignments.find(
      (assignment) =>
        assignment.employeeId === employeeId &&
        assignment.shiftId === shiftId &&
        isSameDay(new Date(assignment.date), new Date(day))
    );

    if (existingAssignment) {
      alert('This employee is already assigned to this shift on this day.');
      return;
    }

    // Create new assignment
    const assignment: Omit<ShiftAssignment, 'id'> = {
      shiftId,
      employeeId,
      date: day,
      startTime: shift.startTime,
      endTime: shift.endTime,
      isOvernight: shift.isOvernight,
      status: 'pending',
      roleId: shift.roles[0].roleId // Use the first role by default
    };

    try {
      await addAssignment(assignment);
      setSelectedAssignment(null);
    } catch (error) {
      console.error('Error assigning employee:', error);
    }
  };

  const getEligibleEmployees = (shift: Shift) => {
    return employees.filter(employee => hasRequiredRole(employee, shift));
  };

  const getRoleColor = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.color || theme.palette.primary.main;
  };

  // Add these constants for consistent sizing
  const SLOT_HEIGHT = 60;
  const SLOT_WIDTH = 120;
  const SLOT_GAP = 8;

  const renderSlotContent = (
    shift: Shift & { assignment: ShiftAssignment }, 
    role: Role, 
    canAssign: boolean, 
    day: Date,
    currentAssignment: ShiftAssignment | undefined
  ) => {
    const assignedEmployee = currentAssignment 
      ? employees.find(e => e.id === currentAssignment.employeeId)
      : null;

    const isOvernightStartDay = shift.isOvernight && shift.assignment.startTime !== '00:00';

    if (assignedEmployee) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 0.5,
          height: '100%',
          justifyContent: 'center',
          p: 0.5
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5 
          }}>
            <Avatar
              sx={{
                width: 20,
                height: 20,
                bgcolor: assignedEmployee.color || theme.palette.primary.main,
                fontSize: '0.7rem'
              }}
            >
              {assignedEmployee.name.charAt(0)}
            </Avatar>
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.text.primary,
                fontSize: '0.7rem',
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {assignedEmployee.name}
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            gap: 0.5,
            flexWrap: 'wrap'
          }}>
            {(Array.isArray(assignedEmployee.role) 
              ? assignedEmployee.role 
              : [assignedEmployee.role]
            ).map(roleId => (
              <Box
                key={roleId}
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: getRoleColor(roleId)
                }}
              />
            ))}
          </Box>
        </Box>
      );
    }

    if (canAssign) {
      return (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 0.5,
          height: '100%',
          justifyContent: 'center',
          p: 0.5
        }}>
          <AddIcon sx={{ fontSize: 16, color: theme.palette.success.main }} />
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.text.secondary,
              fontSize: '0.7rem',
              fontStyle: 'italic'
            }}
          >
            Assign
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 0.5,
        height: '100%',
        justifyContent: 'center',
        p: 0.5
      }}>
        {shift.isOvernight && !isOvernightStartDay ? (
          <Tooltip title="Cannot assign overnight shift on this day">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <NightsStayIcon fontSize="small" color="error" />
              <RemoveIcon fontSize="small" color="error" />
            </Box>
          </Tooltip>
        ) : (
          <Tooltip title="Role not required for this shift">
            <RemoveIcon fontSize="small" color="error" />
          </Tooltip>
        )}
      </Box>
    );
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
            Master Calendar
          </Typography>
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

        <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
          <Table sx={{ minWidth: 800, borderCollapse: 'separate', borderSpacing: 0 }}>
            <TableHead>
              <TableRow>
                <TableCell 
                  rowSpan={2}
                  sx={{ 
                    width: `${SLOT_WIDTH}px`,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    fontWeight: 600,
                    color: theme.palette.text.secondary,
                    verticalAlign: 'top',
                    pt: 2,
                    backgroundColor: theme.palette.background.paper,
                    borderRight: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Box sx={{ pb: 2 }}>
                    Role
                  </Box>
                </TableCell>
                {weekDays.map((day) => {
                  const dayShifts = getShiftsForDay(day);
                  const maxShifts = Math.max(...weekDays.map(d => getShiftsForDay(d).length), 1);
                  return (
                    <TableCell
                      key={day.toISOString()}
                      colSpan={maxShifts}
                      align="center"
                      sx={{
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        borderLeft: `1px solid ${theme.palette.divider}`,
                        borderRight: `1px solid ${theme.palette.divider}`,
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                        p: 0,
                        backgroundColor: theme.palette.background.paper,
                        width: `${maxShifts * (SLOT_WIDTH + SLOT_GAP)}px`
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
                      <Box sx={{ 
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 1,
                        p: 1
                      }}>
                        {dayShifts.length === 0 ? (
                          <Box sx={{ 
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 1
                          }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: theme.palette.text.secondary,
                                fontSize: '0.75rem'
                              }}
                            >
                              No shifts
                            </Typography>
                          </Box>
                        ) : (
                          dayShifts.map((shift, index) => (
                            <Box
                              key={`${day.toISOString()}-${shift.id}`}
                              sx={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 0.5,
                                py: 0.5
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
                            </Box>
                          ))
                        )}
                      </Box>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell
                    sx={{
                      borderBottom: 'none',
                      fontWeight: 500,
                      backgroundColor: theme.palette.background.paper,
                      p: 0,
                      borderRight: `1px solid ${theme.palette.divider}`,
                      width: `${SLOT_WIDTH}px`
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        color: theme.palette.text.primary,
                        fontWeight: 500,
                        height: `${SLOT_HEIGHT}px`,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {role.name}
                    </Box>
                  </TableCell>
                  {weekDays.map((day) => {
                    const dayShifts = getShiftsForDay(day);
                    const maxShifts = Math.max(...weekDays.map(d => getShiftsForDay(d).length), 1);
                    return (
                      <TableCell
                        key={`${day.toISOString()}-${role.id}`}
                        colSpan={maxShifts}
                        sx={{
                          borderBottom: 'none',
                          backgroundColor: theme.palette.background.paper,
                          p: 0,
                          borderLeft: `1px solid ${theme.palette.divider}`,
                          borderRight: `1px solid ${theme.palette.divider}`,
                          width: `${maxShifts * (SLOT_WIDTH + SLOT_GAP)}px`
                        }}
                      >
                        <Box
                          sx={{
                            p: 0.5,
                            display: 'grid',
                            gridTemplateColumns: `repeat(${maxShifts}, ${SLOT_WIDTH}px)`,
                            gap: `${SLOT_GAP}px`,
                            height: `${SLOT_HEIGHT}px`
                          }}
                        >
                          {dayShifts.length === 0 ? (
                            <Box sx={{ width: `${SLOT_WIDTH}px` }} />
                          ) : (
                            dayShifts.map((shift) => {
                              const isRoleRequired = shift.roles.some(r => r.roleId === role.id);
                              const isOvernightStartDay = shift.isOvernight && shift.assignment.startTime !== '00:00';
                              const canAssign = isRoleRequired && (!shift.isOvernight || isOvernightStartDay);
                              const currentAssignment = assignments.find(
                                a => a.shiftId === shift.id && 
                                new Date(a.date).toISOString() === day.toISOString()
                              );

                              return (
                                <Box
                                  key={`${day.toISOString()}-${shift.id}-${role.id}`}
                                  sx={{ width: `${SLOT_WIDTH}px` }}
                                >
                                  <Paper
                                    elevation={0}
                                    sx={{
                                      height: '100%',
                                      backgroundColor: canAssign 
                                        ? theme.palette.action.hover 
                                        : theme.palette.action.disabledBackground,
                                      borderRadius: 1,
                                      cursor: canAssign ? 'pointer' : 'not-allowed',
                                      transition: 'all 0.2s ease-in-out',
                                      '&:hover': {
                                        backgroundColor: canAssign 
                                          ? theme.palette.action.selected 
                                          : theme.palette.action.disabledBackground,
                                        transform: canAssign ? 'scale(1.02)' : 'none',
                                      }
                                    }}
                                    onClick={() => {
                                      const employee = currentAssignment 
                                        ? employees.find(e => e.id === currentAssignment.employeeId)
                                        : null;
                                      canAssign && setSelectedAssignment({
                                        day: day.toISOString(),
                                        shiftId: shift.id,
                                        employeeId: employee?.id
                                      });
                                    }}
                                  >
                                    {renderSlotContent(shift, role, canAssign, day, currentAssignment)}
                                  </Paper>
                                </Box>
                              );
                            })
                          )}
                        </Box>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Employee Assignment Dialog */}
      {selectedAssignment && (
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            p: 2,
            minWidth: 300,
            zIndex: 1000
          }}
        >
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Assign Employee
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {format(new Date(selectedAssignment.day), 'EEEE, MMM d')}
            </Typography>
          </Box>

          <FormControl fullWidth>
            <InputLabel>Select Employee</InputLabel>
            <Select
              value={selectedAssignment.employeeId || ''}
              label="Select Employee"
              onChange={(e) => handleEmployeeAssignment(
                selectedAssignment.day,
                selectedAssignment.shiftId,
                e.target.value
              )}
            >
              {getEligibleEmployees(shifts.find(s => s.id === selectedAssignment.shiftId)!).map(employee => (
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
                    {employee.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
      )}
    </Box>
  );
};

export default MasterCalendar; 