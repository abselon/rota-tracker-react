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
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { format, addWeeks, subWeeks, startOfWeek, addDays } from 'date-fns';
import { useAppContext } from '../context/AppContext';

const MasterCalendar: React.FC = () => {
  const theme = useTheme();
  const { state } = useAppContext();
  const { roles } = state;
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const shifts = ['Shift 1', 'Shift 2', 'Shift 3'];

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
                {weekDays.map((day) => (
                  <TableCell
                    key={day.toISOString()}
                    colSpan={3}
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
                ))}
              </TableRow>
              <TableRow>
                {weekDays.map((day) => (
                  shifts.map((shift, index) => (
                    <TableCell
                      key={`${day.toISOString()}-${shift}`}
                      align="center"
                      sx={{
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        borderLeft: index === 0 ? `1px solid ${theme.palette.divider}` : 'none',
                        borderRight: index === 2 ? `1px solid ${theme.palette.divider}` : 'none',
                        fontWeight: 500,
                        color: theme.palette.text.secondary,
                        py: 1.5,
                        backgroundColor: theme.palette.background.paper,
                        fontSize: '0.75rem'
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {shift}
                      </Typography>
                    </TableCell>
                  ))
                ))}
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
                {weekDays.map((day) => (
                  shifts.map((shift, shiftIndex) => (
                    <TableCell
                      key={`${day.toISOString()}-${shift}`}
                      sx={{
                        borderBottom: 'none',
                        backgroundColor: theme.palette.background.paper,
                        p: 0,
                        minWidth: '100px',
                        borderLeft: shiftIndex === 0 ? `1px solid ${theme.palette.divider}` : 'none',
                        borderRight: shiftIndex === 2 ? `1px solid ${theme.palette.divider}` : 'none',
                      }}
                    >
                      {roles.map((role, roleIndex) => (
                        <Box
                          key={`${day.toISOString()}-${shift}-${role.id}`}
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
                              Rc Role1
                            </Typography>
                          </Paper>
                        </Box>
                      ))}
                    </TableCell>
                  ))
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default MasterCalendar; 