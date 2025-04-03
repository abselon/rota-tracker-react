import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  Stack,
  LinearProgress,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Chip,
  useTheme,
  Paper,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  People as PeopleIcon,
  Work as ShiftIcon,
  ChevronRight as ChevronRightIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  DateRange as DateRangeIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);
  const { employees, shifts, assignments } = state;

  const today = new Date();
  const currentWeekStart = startOfWeek(today);
  const currentWeekEnd = endOfWeek(today);

  const todayAssignments = assignments.filter(
    (assignment) => format(new Date(assignment.date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  );

  const upcomingAssignments = assignments
    .filter((assignment) => new Date(assignment.date) > today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  // Calculate weekly statistics
  const weeklyStats = useMemo(() => {
    const weekDays = eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd });
    return weekDays.map(date => {
      const dayAssignments = assignments.filter(
        assignment => format(new Date(assignment.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      return {
        date: format(date, 'EEE'),
        assignments: dayAssignments.length,
        hours: dayAssignments.reduce((acc, curr) => {
          const shift = shifts.find(s => s.id === curr.shiftId);
          return acc + (shift?.duration || 0);
        }, 0),
      };
    });
  }, [assignments, shifts, currentWeekStart, currentWeekEnd]);

  // Calculate shift distribution
  const shiftDistribution = useMemo(() => {
    return shifts.map(shift => {
      const shiftAssignments = assignments.filter(a => a.shiftId === shift.id);
      return {
        name: shift.name,
        value: shiftAssignments.length,
      };
    });
  }, [shifts, assignments]);

  const stats = [
    {
      title: 'Total Employees',
      value: employees.length,
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      trend: '+2 this month',
      color: theme.palette.primary.main,
      action: () => navigate('/employees'),
    },
    {
      title: 'Active Shifts',
      value: shifts.length,
      icon: <ShiftIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      trend: 'All shifts covered',
      color: theme.palette.secondary.main,
      action: () => navigate('/shifts'),
    },
    {
      title: 'Today\'s Assignments',
      value: todayAssignments.length,
      icon: <CalendarIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      trend: `${todayAssignments.length}/${shifts.length} shifts covered`,
      color: theme.palette.success.main,
      action: () => navigate('/calendar'),
    },
  ];

  // Add new calculations for insights
  const employeeUtilization = useMemo(() => {
    const totalHours = assignments.reduce((acc, curr) => {
      const shift = shifts.find(s => s.id === curr.shiftId);
      return acc + (shift?.duration || 0);
    }, 0);
    const totalPossibleHours = employees.length * shifts.length * 8; // Assuming 8-hour shifts
    return Math.round((totalHours / totalPossibleHours) * 100);
  }, [assignments, shifts, employees]);

  const upcomingWeekStats = useMemo(() => {
    const nextWeekStart = addWeeks(currentWeekStart, 1);
    const nextWeekEnd = addWeeks(currentWeekEnd, 1);
    const nextWeekDays = eachDayOfInterval({ start: nextWeekStart, end: nextWeekEnd });
    
    return {
      totalAssignments: nextWeekDays.reduce((acc, date) => {
        return acc + assignments.filter(
          assignment => format(new Date(assignment.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        ).length;
      }, 0),
      coverage: Math.round((nextWeekDays.reduce((acc, date) => {
        return acc + assignments.filter(
          assignment => format(new Date(assignment.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        ).length;
      }, 0) / (shifts.length * 7)) * 100),
    };
  }, [assignments, shifts, currentWeekStart, currentWeekEnd]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
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
              Dashboard
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Overview of your rota management
            </Typography>
          </Box>
          <Button
            variant="contained"
            endIcon={<ChevronRightIcon />}
            onClick={() => navigate('/calendar')}
            sx={{
              backgroundColor: 'white',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              }
            }}
          >
            View Calendar
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} md={4} key={stat.title}>
            <Card 
              sx={{ 
                height: '100%', 
                position: 'relative', 
                overflow: 'hidden',
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4],
                }
              }}
              onClick={stat.action}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(45deg, ${stat.color}10, ${stat.color}05)`,
                  zIndex: 0,
                }}
              />
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: `${stat.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="success.main">
                  {stat.trend}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title="Weekly Overview"
              subheader={`${format(currentWeekStart, 'MMM dd')} - ${format(currentWeekEnd, 'MMM dd, yyyy')}`}
              action={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Filter">
                    <IconButton size="small">
                      <FilterIcon />
                    </IconButton>
                  </Tooltip>
                  <Button
                    size="small"
                    endIcon={<ChevronRightIcon />}
                    onClick={() => navigate('/calendar')}
                  >
                    View All
                  </Button>
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip />
                    <Bar dataKey="assignments" fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Card>
              <CardHeader 
                title="Employee Utilization"
                subheader="Overall workforce efficiency"
              />
              <Divider />
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUpIcon sx={{ color: employeeUtilization >= 80 ? 'success.main' : 'warning.main', mr: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {employeeUtilization}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={employeeUtilization} 
                  color={employeeUtilization >= 80 ? 'success' : 'warning'}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader 
                title="Next Week Preview"
                subheader="Upcoming coverage"
              />
              <Divider />
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccessTimeIcon sx={{ color: upcomingWeekStats.coverage >= 80 ? 'success.main' : 'warning.main', mr: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {upcomingWeekStats.coverage}%
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {upcomingWeekStats.totalAssignments} assignments scheduled
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={upcomingWeekStats.coverage} 
                  color={upcomingWeekStats.coverage >= 80 ? 'success' : 'warning'}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader 
                title="Notifications"
                subheader="Important updates"
              />
              <Divider />
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <NotificationsIcon sx={{ color: 'primary.main', mr: 1 }} />
                      <Typography variant="body2">3 pending shift requests</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={30} color="primary" />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <WarningIcon sx={{ color: 'warning.main', mr: 1 }} />
                      <Typography variant="body2">2 understaffed shifts next week</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={20} color="warning" />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Upcoming Assignments"
              action={
                <Tabs value={selectedTab} onChange={handleTabChange}>
                  <Tab icon={<CalendarIcon />} label="This Week" />
                  <Tab icon={<DateRangeIcon />} label="Next Week" />
                </Tabs>
              }
            />
            <Divider />
            <CardContent>
              <List>
                {upcomingAssignments.length === 0 ? (
                  <ListItem>
                    <ListItemText
                      primary="No upcoming assignments"
                      secondary="Add some assignments to see them here"
                    />
                  </ListItem>
                ) : (
                  <>
                    {upcomingAssignments.map((assignment) => {
                      const employee = employees.find((e) => e.id === assignment.employeeId);
                      const shift = shifts.find((s) => s.id === assignment.shiftId);
                      return (
                        <React.Fragment key={assignment.id}>
                          <ListItem
                            sx={{
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                backgroundColor: theme.palette.action.hover,
                              }
                            }}
                          >
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                backgroundColor: employee?.color || '#e0e0e0',
                                border: '2px solid',
                                borderColor: 'divider',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 2,
                              }}
                            >
                              <PersonIcon sx={{ color: 'white', fontSize: 16 }} />
                            </Box>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="subtitle1">
                                    {employee?.name || 'Unknown Employee'}
                                  </Typography>
                                  <Chip
                                    size="small"
                                    label={shift?.name || 'Unknown Shift'}
                                    color="primary"
                                    variant="outlined"
                                  />
                                </Box>
                              }
                              secondary={format(new Date(assignment.date), 'MMM dd, yyyy')}
                            />
                          </ListItem>
                          <Divider variant="inset" component="li" />
                        </React.Fragment>
                      );
                    })}
                  </>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 