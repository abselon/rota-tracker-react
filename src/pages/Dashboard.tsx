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
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  People as PeopleIcon,
  Work as ShiftIcon,
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ flex: { md: 2 } }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<CalendarIcon />}
                  fullWidth
                  onClick={() => navigate('/calendar')}
                >
                  View Calendar
                </Button>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<PeopleIcon />}
                  fullWidth
                  onClick={() => navigate('/employees')}
                >
                  Manage Employees
                </Button>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<ShiftIcon />}
                  fullWidth
                  onClick={() => navigate('/shifts')}
                >
                  Manage Shifts
                </Button>
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Today's Schedule
            </Typography>
            {todayAssignments.length > 0 ? (
              <List>
                {todayAssignments.map((assignment) => {
                  const shift = shifts.find((s) => s.id === assignment.shiftId);
                  const employee = employees.find(
                    (e) => e.id === assignment.employeeId
                  );
                  return (
                    <React.Fragment key={assignment.id}>
                      <ListItem>
                        <ListItemText
                          primary={shift?.name}
                          secondary={`${employee?.name} - ${shift?.startTime} to ${shift?.endTime}`}
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  );
                })}
              </List>
            ) : (
              <Typography color="text.secondary">
                No shifts scheduled for today
              </Typography>
            )}
          </Paper>
        </Box>

        <Box sx={{ flex: { md: 1 } }}>
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Overview" />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Total Employees"
                    secondary={employees.length}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Active Shifts"
                    secondary={shifts.length}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="This Week's Assignments"
                    secondary={
                      currentSchedule
                        ? Object.values(currentSchedule.shifts).flat().length
                        : 0
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Upcoming Shifts" />
            <CardContent>
              {upcomingAssignments.length > 0 ? (
                <List>
                  {upcomingAssignments.map((assignment) => {
                    const shift = shifts.find((s) => s.id === assignment.shiftId);
                    const employee = employees.find(
                      (e) => e.id === assignment.employeeId
                    );
                    return (
                      <React.Fragment key={assignment.id}>
                        <ListItem>
                          <ListItemText
                            primary={formatDate(new Date(assignment.date))}
                            secondary={`${shift?.name} - ${employee?.name}`}
                          />
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    );
                  })}
                </List>
              ) : (
                <Typography color="text.secondary">
                  No upcoming shifts scheduled
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
} 