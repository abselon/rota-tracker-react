import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Stack,
  Popover,
  useTheme,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Chip,
  Tabs,
  Tab,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Palette as PaletteIcon,
  AccessTime as AccessTimeIcon,
  CalendarMonth as CalendarMonthIcon,
  TrendingUp as TrendingUpIcon,
  DateRange as DateRangeIcon,
  Close as CloseIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  LocalHospital as HospitalIcon,
  Restaurant as RestaurantIcon,
  Store as StoreIcon,
  Security as SecurityIcon,
  Engineering as EngineeringIcon,
  Science as ScienceIcon,
  AccountBalance as AccountBalanceIcon,
  SportsEsports as SportsEsportsIcon,
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { Employee, DayAvailability, EmployeeInsights, ShiftAssignment, Role } from '../types';
import { generateUniqueColor, isColorTooSimilar } from '../utils/colorUtils';
import { SketchPicker } from 'react-color';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isBefore, isAfter, parseISO } from 'date-fns';

// Initialize default availability for each day of the week
const defaultAvailability: Record<string, DayAvailability> = {
  monday: { start: '09:00', end: '17:00', isClosed: false },
  tuesday: { start: '09:00', end: '17:00', isClosed: false },
  wednesday: { start: '09:00', end: '17:00', isClosed: false },
  thursday: { start: '09:00', end: '17:00', isClosed: false },
  friday: { start: '09:00', end: '17:00', isClosed: false },
  saturday: { start: '00:00', end: '00:00', isClosed: true },
  sunday: { start: '00:00', end: '00:00', isClosed: true },
};

// Predefined set of commonly used icons
const availableIcons = [
  { name: 'Work', component: WorkIcon },
  { name: 'Business', component: BusinessIcon },
  { name: 'School', component: SchoolIcon },
  { name: 'Hospital', component: HospitalIcon },
  { name: 'Restaurant', component: RestaurantIcon },
  { name: 'Store', component: StoreIcon },
  { name: 'Security', component: SecurityIcon },
  { name: 'Engineering', component: EngineeringIcon },
  { name: 'Science', component: ScienceIcon },
  { name: 'Account Balance', component: AccountBalanceIcon },
  { name: 'Sports', component: SportsEsportsIcon },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`insights-tabpanel-${index}`}
      aria-labelledby={`insights-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface FormData {
  name: string;
  roles: string[];
  email: string;
  phone: string;
  availability: Record<string, DayAvailability>;
  preferences: {
    preferredShifts: string[];
    preferredDays: string[];
    maxHoursPerWeek: number;
    minHoursPerWeek: number;
  };
  skills: string[];
  notes: string;
  color: string;
}

const EmployeeManagement: React.FC = () => {
  const theme = useTheme();
  const { state, addEmployee, updateEmployee, deleteEmployee, roles } = useAppContext();
  const { employees, isLoading, error, shifts, assignments } = state;
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [colorPickerAnchor, setColorPickerAnchor] = useState<null | HTMLElement>(null);
  const [insightsTab, setInsightsTab] = useState(0);
  const [employeeInsights, setEmployeeInsights] = useState<Record<string, EmployeeInsights>>({});
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date }>({
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date()),
  });
  const [formData, setFormData] = useState<FormData>({
    name: '',
    roles: [],
    email: '',
    phone: '',
    availability: defaultAvailability,
    preferences: {
      preferredShifts: [],
      preferredDays: [],
      maxHoursPerWeek: 40,
      minHoursPerWeek: 20,
    },
    skills: [],
    notes: '',
    color: generateUniqueColor([]),
  });
  const [selectedEmployeeForDetails, setSelectedEmployeeForDetails] = useState<Employee | null>(null);
  const [detailsViewTab, setDetailsViewTab] = useState(0);

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setSelectedEmployee(employee);
      setFormData({
        name: employee.name,
        roles: Array.isArray(employee.role) ? employee.role : [employee.role],
        email: employee.email,
        phone: employee.phone,
        availability: employee.availability || defaultAvailability,
        preferences: employee.preferences || {
          preferredShifts: [],
          preferredDays: [],
          maxHoursPerWeek: 40,
          minHoursPerWeek: 20,
        },
        skills: employee.skills || [],
        notes: employee.notes || '',
        color: employee.color || generateUniqueColor([]),
      });
    } else {
      setSelectedEmployee(null);
      setFormData({
        name: '',
        roles: [],
        email: '',
        phone: '',
        availability: defaultAvailability,
        preferences: {
          preferredShifts: [],
          preferredDays: [],
          maxHoursPerWeek: 40,
          minHoursPerWeek: 20,
        },
        skills: [],
        notes: '',
        color: generateUniqueColor(employees.map(e => e.color || '')),
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEmployee(null);
    setFormData({
      name: '',
      roles: [],
      email: '',
      phone: '',
      availability: defaultAvailability,
      preferences: {
        preferredShifts: [],
        preferredDays: [],
        maxHoursPerWeek: 40,
        minHoursPerWeek: 20,
      },
      skills: [],
      notes: '',
      color: generateUniqueColor(employees.map(e => e.color || '')),
    });
    setFormError(null);
  };

  const handleColorPickerOpen = (event: React.MouseEvent<HTMLElement>) => {
    setColorPickerAnchor(event.currentTarget);
  };

  const handleColorPickerClose = () => {
    setColorPickerAnchor(null);
  };

  const handleColorChange = (color: any) => {
    const newColor = color.hex;
    const usedColors = employees
      .filter(emp => emp.id !== selectedEmployee?.id)
      .map(emp => emp.color || '');

    if (isColorTooSimilar(newColor, usedColors)) {
      setFormError('This color is too similar to another employee\'s color. Please choose a different color.');
      return;
    }

    setFormData({ ...formData, color: newColor });
    handleColorPickerClose();
  };

  const handleSaveEmployee = async () => {
    try {
      setFormError(null);
      
      if (!formData.name || !formData.roles.length || !formData.email) {
        setFormError('Please fill in all required fields');
        return;
      }

      const employeeData = {
        ...formData,
        role: formData.roles,
        createdAt: selectedEmployee?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      if (selectedEmployee) {
        await updateEmployee(selectedEmployee.id, employeeData);
      } else {
        await addEmployee(employeeData);
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving employee:', error);
      setFormError('Failed to save employee');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployee(id);
      } catch (err) {
        console.error('Error deleting employee:', err);
        alert('Failed to delete employee. Please try again.');
      }
    }
  };

  const calculateEmployeeInsights = (employeeId: string): EmployeeInsights => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const employeeAssignments = assignments.filter(a => a.employeeId === employeeId);
    
    const calculateHours = (startDate: Date, endDate: Date) => {
      const relevantAssignments = employeeAssignments.filter(a => {
        const assignmentDate = parseISO(a.date);
        return assignmentDate >= startDate && assignmentDate <= endDate;
      });

      const completed = relevantAssignments.filter(a => {
        const assignmentDate = parseISO(a.date);
        return isBefore(assignmentDate, now);
      });

      const upcoming = relevantAssignments.filter(a => {
        const assignmentDate = parseISO(a.date);
        return isAfter(assignmentDate, now);
      });

      const getShiftHours = (assignment: ShiftAssignment) => {
        const shift = shifts.find(s => s.id === assignment.shiftId);
        return shift ? shift.duration : 0;
      };

      return {
        total: relevantAssignments.reduce((sum, a) => sum + getShiftHours(a), 0),
        completed: completed.reduce((sum, a) => sum + getShiftHours(a), 0),
        upcoming: upcoming.reduce((sum, a) => sum + getShiftHours(a), 0),
      };
    };

    const weekly = calculateHours(weekStart, weekEnd);
    const monthly = calculateHours(monthStart, monthEnd);
    const custom = calculateHours(customDateRange.start, customDateRange.end);

    const shiftBreakdown = shifts.reduce((acc, shift) => {
      const shiftAssignments = employeeAssignments.filter(a => a.shiftId === shift.id);
      const completed = shiftAssignments.filter(a => isBefore(parseISO(a.date), now));
      const upcoming = shiftAssignments.filter(a => isAfter(parseISO(a.date), now));

      acc[shift.id] = {
        name: shift.name,
        hours: shiftAssignments.length * shift.duration,
        completed: completed.length * shift.duration,
        upcoming: upcoming.length * shift.duration,
      };
      return acc;
    }, {} as Record<string, { name: string; hours: number; completed: number; upcoming: number; }>);

    return {
      employeeId,
      totalHours: {
        weekly: weekly.total,
        monthly: monthly.total,
        custom: custom.total,
      },
      completedHours: {
        weekly: weekly.completed,
        monthly: monthly.completed,
        custom: custom.completed,
      },
      futureHours: {
        weekly: weekly.upcoming,
        monthly: monthly.upcoming,
        custom: custom.upcoming,
      },
      shiftBreakdown,
      lastUpdated: new Date().toISOString(),
    };
  };

  useEffect(() => {
    const insights = employees.reduce((acc, employee) => {
      acc[employee.id] = calculateEmployeeInsights(employee.id);
      return acc;
    }, {} as Record<string, EmployeeInsights>);
    setEmployeeInsights(insights);
  }, [employees, assignments, shifts, customDateRange]);

  const handleInsightsTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setInsightsTab(newValue);
  };

  const handleEmployeeRowClick = (employee: Employee) => {
    setSelectedEmployeeForDetails(employee);
    setDetailsViewTab(0);
  };

  const handleDetailsViewClose = () => {
    setSelectedEmployeeForDetails(null);
  };

  const handleDetailsTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setDetailsViewTab(newValue);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
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
              Employee Management
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Manage your team members and their availability
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ 
              backgroundColor: 'white',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              }
            }}
          >
            Add Employee
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ mt: 4, borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={insightsTab} 
            onChange={handleInsightsTabChange}
            sx={{ px: 3 }}
          >
            <Tab 
              icon={<CalendarMonthIcon />} 
              label="Weekly Overview" 
              iconPosition="start"
            />
            <Tab 
              icon={<TrendingUpIcon />} 
              label="Monthly Stats" 
              iconPosition="start"
            />
            <Tab 
              icon={<DateRangeIcon />} 
              label="Custom Range" 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={insightsTab} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell align="right">Total Hours</TableCell>
                  <TableCell align="right">Completed</TableCell>
                  <TableCell align="right">Upcoming</TableCell>
                  <TableCell>Progress</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((employee) => {
                  const insights = employeeInsights[employee.id];
                  const progress = insights ? (insights.completedHours.weekly / insights.totalHours.weekly) * 100 : 0;

                  return (
                    <TableRow 
                      key={employee.id}
                      onClick={() => handleEmployeeRowClick(employee)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              backgroundColor: employee.color || '#e0e0e0',
                              border: '2px solid',
                              borderColor: 'divider',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <PersonIcon sx={{ color: 'white', fontSize: 16 }} />
                          </Box>
                          <Typography>{employee.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">
                          {insights?.totalHours.weekly || 0} hrs
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="success.main">
                          {insights?.completedHours.weekly || 0} hrs
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="primary.main">
                          {insights?.futureHours.weekly || 0} hrs
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ flexGrow: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={progress} 
                              sx={{ 
                                height: 8, 
                                borderRadius: 4,
                                backgroundColor: 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 4,
                                }
                              }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {Math.round(progress)}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={insightsTab} index={1}>
          <Grid container spacing={3}>
            {employees.map((employee) => {
              const insights = employeeInsights[employee.id];
              if (!insights) return null;

              return (
                <Grid item xs={12} md={6} key={employee.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: employee.color || '#e0e0e0',
                            border: '2px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <PersonIcon sx={{ color: 'white', fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography variant="h6">{employee.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Monthly Overview
                          </Typography>
                        </Box>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary.main">
                              {insights.totalHours.monthly}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Total Hours
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="success.main">
                              {insights.completedHours.monthly}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Completed
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="info.main">
                              {insights.futureHours.monthly}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Upcoming
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Shift Breakdown
                        </Typography>
                        <Stack spacing={1}>
                          {Object.entries(insights.shiftBreakdown).map(([shiftId, data]) => {
                            const breakdown = data as {
                              name: string;
                              hours: number;
                              completed: number;
                              upcoming: number;
                            };
                            return (
                              <Box key={shiftId} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2">{breakdown.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {breakdown.hours} hrs
                                </Typography>
                              </Box>
                            );
                          })}
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </TabPanel>

        <TabPanel value={insightsTab} index={2}>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={format(customDateRange.start, 'yyyy-MM-dd')}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={format(customDateRange.end, 'yyyy-MM-dd')}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell align="right">Total Hours</TableCell>
                  <TableCell align="right">Completed</TableCell>
                  <TableCell align="right">Upcoming</TableCell>
                  <TableCell>Shift Distribution</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((employee) => {
                  const insights = employeeInsights[employee.id];
                  if (!insights) return null;

                  return (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              backgroundColor: employee.color || '#e0e0e0',
                              border: '2px solid',
                              borderColor: 'divider',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <PersonIcon sx={{ color: 'white', fontSize: 16 }} />
                          </Box>
                          <Typography>{employee.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {insights.totalHours.custom} hrs
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="success.main">
                          {insights.completedHours.custom} hrs
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="primary.main">
                          {insights.futureHours.custom} hrs
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={1}>
                          {Object.entries(insights.shiftBreakdown).map(([shiftId, data]) => {
                            const breakdown = data as {
                              name: string;
                              hours: number;
                              completed: number;
                              upcoming: number;
                            };
                            return (
                              <Box key={shiftId} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2">{breakdown.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {breakdown.hours} hrs
                                </Typography>
                              </Box>
                            );
                          })}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      <TableContainer 
        component={Paper} 
        sx={{ 
          mt: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          boxShadow: theme.shadows[2],
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
          },
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ 
                backgroundColor: 'background.default',
                borderBottom: '2px solid',
                borderColor: 'divider',
                py: 2,
                fontWeight: 600,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" fontSize="small" />
                  <Typography>Name</Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ 
                backgroundColor: 'background.default',
                borderBottom: '2px solid',
                borderColor: 'divider',
                py: 2,
                fontWeight: 600,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon color="primary" fontSize="small" />
                  <Typography>Email</Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ 
                backgroundColor: 'background.default',
                borderBottom: '2px solid',
                borderColor: 'divider',
                py: 2,
                fontWeight: 600,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon color="primary" fontSize="small" />
                  <Typography>Phone</Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ 
                backgroundColor: 'background.default',
                borderBottom: '2px solid',
                borderColor: 'divider',
                py: 2,
                fontWeight: 600,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WorkIcon color="primary" fontSize="small" />
                  <Typography>Roles</Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ 
                backgroundColor: 'background.default',
                borderBottom: '2px solid',
                borderColor: 'divider',
                py: 2,
                fontWeight: 600,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PaletteIcon color="primary" fontSize="small" />
                  <Typography>Color</Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ 
                backgroundColor: 'background.default',
                borderBottom: '2px solid',
                borderColor: 'divider',
                py: 2,
                fontWeight: 600,
              }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <PersonIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                    <Typography color="text.secondary">
                      No employees found. Add your first employee to get started.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow 
                  key={employee.id}
                  sx={{ 
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <TableCell sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          backgroundColor: employee.color || '#e0e0e0',
                          border: '2px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <PersonIcon sx={{ color: 'white', fontSize: 16 }} />
                      </Box>
                      <Typography sx={{ fontWeight: 500 }}>{employee.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>{employee.email}</TableCell>
                  <TableCell sx={{ py: 2 }}>{employee.phone}</TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {(Array.isArray(employee.role) ? employee.role : [employee.role]).map((roleId) => {
                        const role = roles.find(r => r.id === roleId);
                        if (!role) return null;
                        return (
                          <Chip 
                            key={roleId}
                            label={role.name}
                            size="small"
                            sx={{ 
                              backgroundColor: role.color || 'primary.main',
                              color: 'white',
                              fontWeight: 500,
                              '&:hover': {
                                backgroundColor: role.color ? `${role.color}dd` : 'primary.dark',
                              }
                            }}
                          />
                        );
                      })}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: employee.color || '#e0e0e0',
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          boxShadow: theme.shadows[1],
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit Employee">
                        <IconButton 
                          onClick={() => handleOpenDialog(employee)}
                          sx={{ 
                            color: 'primary.main',
                            '&:hover': {
                              backgroundColor: 'primary.light',
                            }
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Employee">
                        <IconButton 
                          onClick={() => handleDeleteEmployee(employee.id)}
                          sx={{ 
                            color: 'error.main',
                            '&:hover': {
                              backgroundColor: 'error.light',
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />

            <FormControl fullWidth required>
              <InputLabel>Roles</InputLabel>
              <Select
                multiple
                value={formData.roles}
                label="Roles"
                onChange={(e) => setFormData({ ...formData, roles: e.target.value as string[] })}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((roleId) => {
                      const role = roles.find(r => r.id === roleId);
                      if (!role) return null;
                      return (
                        <Chip
                          key={roleId}
                          label={role.name}
                          size="small"
                          sx={{
                            backgroundColor: role.color || 'primary.main',
                            color: 'white',
                            '& .MuiChip-deleteIcon': {
                              color: 'white',
                              '&:hover': {
                                color: 'error.main',
                              },
                            },
                          }}
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {roles.map((role) => {
                  const IconComponent = availableIcons.find(icon => icon.name === role.icon)?.component || WorkIcon;
                  return (
                    <MenuItem key={role.id} value={role.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            backgroundColor: role.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <IconComponent sx={{ color: 'white', fontSize: 16 }} />
                        </Box>
                        <Typography>{role.name}</Typography>
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
            />

            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography>Employee Color:</Typography>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  backgroundColor: formData.color,
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: theme.shadows[1],
                  }
                }}
                onClick={handleColorPickerOpen}
              />
              <Popover
                open={Boolean(colorPickerAnchor)}
                anchorEl={colorPickerAnchor}
                onClose={handleColorPickerClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
              >
                <SketchPicker
                  color={formData.color}
                  onChange={handleColorChange}
                  disableAlpha
                />
              </Popover>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveEmployee} 
            variant="contained"
            sx={{ 
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeManagement; 