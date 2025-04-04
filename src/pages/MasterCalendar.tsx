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
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  NightsStay as NightsStayIcon,
} from '@mui/icons-material';
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay } from 'date-fns';
import { useAppContext } from '../context/AppContext';
import { Shift, ShiftAssignment } from '../types';

// Constants from ShiftManagement
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

const MasterCalendar: React.FC = () => {
  const theme = useTheme();
  const { state } = useAppContext();
  const { roles, shifts, assignments } = state;
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));

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
    setWeekStart(subWeeks(weekStart, 1));
  };

  const handleNextWeek = () => {
    setWeekStart(addWeeks(weekStart, 1));
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
                    width: '120px',
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
                  return (
                    <TableCell
                      key={day.toISOString()}
                      colSpan={dayShifts.length || 1}
                      align="center"
                      sx={{
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        borderLeft: `1px solid ${theme.palette.divider}`,
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                        pb: 1.5,
                        pt: 2,
                        backgroundColor: theme.palette.background.paper
                      }}
                    >
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
                    </TableCell>
                  );
                })}
              </TableRow>
              <TableRow>
                {weekDays.map((day) => {
                  const dayShifts = getShiftsForDay(day);
                  if (dayShifts.length === 0) {
                    return (
                      <TableCell
                        key={`${day.toISOString()}-empty`}
                        align="center"
                        sx={{
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          borderLeft: `1px solid ${theme.palette.divider}`,
                          borderRight: `1px solid ${theme.palette.divider}`,
                          fontWeight: 500,
                          color: theme.palette.text.secondary,
                          py: 1.5,
                          backgroundColor: theme.palette.background.paper,
                          fontSize: '0.75rem'
                        }}
                      >
                        No shifts
                      </TableCell>
                    );
                  }
                  return dayShifts.map((shift, index) => (
                    <TableCell
                      key={`${day.toISOString()}-${shift.id}`}
                      align="center"
                      sx={{
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        borderLeft: index === 0 ? `1px solid ${theme.palette.divider}` : 'none',
                        borderRight: index === dayShifts.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                        fontWeight: 500,
                        color: theme.palette.text.secondary,
                        py: 1.5,
                        backgroundColor: theme.palette.background.paper,
                        fontSize: '0.75rem'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {shift.name}
                        </Typography>
                        {shift.isOvernight && (
                          <Tooltip title="Overnight Shift">
                            <NightsStayIcon fontSize="small" color="primary" />
                          </Tooltip>
                        )}
                      </Box>
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                        {shift.assignment.startTime} - {shift.assignment.endTime}
                      </Typography>
                    </TableCell>
                  ));
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell
                  sx={{
                    borderBottom: 'none',
                    fontWeight: 500,
                    backgroundColor: theme.palette.background.paper,
                    p: 0,
                    borderRight: `1px solid ${theme.palette.divider}`
                  }}
                >
                  {roles.map((role, roleIndex) => (
                    <Box
                      key={role.id}
                      sx={{
                        p: 1.5,
                        borderBottom: roleIndex < roles.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                        color: theme.palette.text.primary,
                        fontWeight: 500
                      }}
                    >
                      {role.name}
                    </Box>
                  ))}
                </TableCell>
                {weekDays.map((day) => {
                  const dayShifts = getShiftsForDay(day);
                  if (dayShifts.length === 0) {
                    return (
                      <TableCell
                        key={`${day.toISOString()}-empty`}
                        sx={{
                          borderBottom: 'none',
                          backgroundColor: theme.palette.background.paper,
                          p: 0,
                          minWidth: '100px',
                          borderLeft: `1px solid ${theme.palette.divider}`,
                          borderRight: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        {roles.map((role, roleIndex) => (
                          <Box
                            key={`${day.toISOString()}-empty-${role.id}`}
                            sx={{
                              p: 1,
                              borderBottom: roleIndex < roles.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                            }}
                          />
                        ))}
                      </TableCell>
                    );
                  }
                  return dayShifts.map((shift, shiftIndex) => (
                    <TableCell
                      key={`${day.toISOString()}-${shift.id}`}
                      sx={{
                        borderBottom: 'none',
                        backgroundColor: theme.palette.background.paper,
                        p: 0,
                        minWidth: '100px',
                        borderLeft: shiftIndex === 0 ? `1px solid ${theme.palette.divider}` : 'none',
                        borderRight: shiftIndex === dayShifts.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                      }}
                    >
                      {roles.map((role, roleIndex) => (
                        <Box
                          key={`${day.toISOString()}-${shift.id}-${role.id}`}
                          sx={{
                            p: 1,
                            borderBottom: roleIndex < roles.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                          }}
                        >
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1,
                              backgroundColor: theme.palette.action.hover,
                              borderRadius: 1,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                backgroundColor: theme.palette.action.selected,
                                transform: 'scale(1.02)',
                              },
                            }}
                          >
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: theme.palette.text.primary,
                                fontSize: '0.75rem',
                                fontWeight: 500
                              }}
                            >
                              {role.name}
                            </Typography>
                          </Paper>
                        </Box>
                      ))}
                    </TableCell>
                  ));
                })}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default MasterCalendar; 