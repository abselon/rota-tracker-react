import React from 'react';
import {
  Box,
  Typography,
  Paper,
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
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  People as PeopleIcon,
  Work as ShiftIcon,
  ChevronRight as ChevronRightIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { formatDate } from '../utils/dateUtils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const { employees, shifts, assignments, schedules } = state;

  const today = new Date();
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() - today.getDay());

  const currentSchedule = schedules.find(
    (schedule) =>
      formatDate(new Date(schedule.weekStart)) === formatDate(currentWeekStart)
  );

  const todayAssignments = assignments.filter(
    (assignment) => formatDate(new Date(assignment.date)) === formatDate(today)
  );

  const upcomingAssignments = assignments
    .filter((assignment) => new Date(assignment.date) > today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const stats = [
    {
      title: 'Total Employees',
      value: employees.length,
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      trend: '+2 this month',
    },
    {
      title: 'Active Shifts',
      value: shifts.length,
      icon: <ShiftIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      trend: 'All shifts covered',
    },
    {
      title: 'Today\'s Assignments',
      value: todayAssignments.length,
      icon: <CalendarIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      trend: `${todayAssignments.length}/${shifts.length} shifts covered`,
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Dashboard
        </Typography>
        <Button
          variant="contained"
          endIcon={<ChevronRightIcon />}
          onClick={() => navigate('/calendar')}
        >
          View Calendar
        </Button>
      </Box>

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} md={4} key={stat.title}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {stat.icon}
                  <Box sx={{ ml: 2 }}>
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
              title="Upcoming Assignments"
              action={
                <Button
                  size="small"
                  endIcon={<ChevronRightIcon />}
                  onClick={() => navigate('/calendar')}
                >
                  View All
                </Button>
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
                      return (
                        <React.Fragment key={assignment.id}>
                          <ListItem>
                            <ListItemText
                              primary={employee?.name || 'Unknown Employee'}
                              secondary={formatDate(new Date(assignment.date))}
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

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Quick Actions" />
            <Divider />
            <CardContent>
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<PeopleIcon />}
                  onClick={() => navigate('/employees')}
                  fullWidth
                >
                  Manage Employees
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ShiftIcon />}
                  onClick={() => navigate('/shifts')}
                  fullWidth
                >
                  Manage Shifts
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CalendarIcon />}
                  onClick={() => navigate('/schedules')}
                  fullWidth
                >
                  Manage Schedules
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardHeader title="System Status" />
            <Divider />
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                    <Typography variant="body2">All systems operational</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={100} color="success" />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WarningIcon sx={{ color: 'warning.main', mr: 1 }} />
                    <Typography variant="body2">3 pending notifications</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={30} color="warning" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 