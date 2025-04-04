import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  AccessTime as AccessTimeIcon,
  Group as GroupIcon,
  Palette as PaletteIcon,
  AddCircle as AddCircleIcon,
  CalendarMonth as CalendarMonthIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAppContext } from '../context/AppContext';
import { Shift, ShiftRole, Employee, ShiftAssignment } from '../types/index';
import { SketchPicker } from 'react-color';
import { format } from 'date-fns';
import { hasRequiredRole } from '../utils/shiftUtils';

interface FormData {
  name: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  requiredEmployees: number;
  color: string;
  isOvernight: boolean;
  roles: ShiftRole[];
}

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

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const isOvernightShift = (startTime: string, endTime: string): boolean => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  // Convert times to minutes for easier comparison
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  // If end time is less than start time, it's overnight
  return endMinutes < startMinutes;
};

export default function ShiftManagement() {
  const theme = useTheme();
  const { state, addShift, updateShift, deleteShift, addAssignment, deleteAssignment, roles } = useAppContext();
  const { shifts, isLoading, error } = state;
  const employees = state.employees;
  const [open, setOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [colorPickerAnchor, setColorPickerAnchor] = useState<null | HTMLElement>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [weeklyDesign, setWeeklyDesign] = useState<WeeklyDesign>({});
  const [formData, setFormData] = useState<FormData>({
    name: '',
    startTime: new Date(),
    endTime: new Date(),
    duration: 0,
    requiredEmployees: 1,
    color: '#1976d2',
    isOvernight: false,
    roles: [],
  });
  const [expandedDays, setExpandedDays] = useState<string[]>([]);
  const [warningMessage, setWarningMessage] = useState<{
    open: boolean;
    title: string;
    message: string;
    details?: string;
  }>({
    open: false,
    title: '',
    message: '',
  });
  const [firebaseBlockedError, setFirebaseBlockedError] = useState(false);

  // Initialize weekly design with proper structure
  useEffect(() => {
    const initializeWeeklyDesign = () => {
      const design: WeeklyDesign = {};
      DAYS_OF_WEEK.forEach(day => {
        design[day] = [];
      });
      setWeeklyDesign(design);
    };

    if (Object.keys(weeklyDesign).length === 0) {
      initializeWeeklyDesign();
    }
  }, []);

  // Load existing assignments into weekly design
  useEffect(() => {
    const loadWeeklyDesign = () => {
      try {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay() + 1); // Set to Monday
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        // Filter assignments for current week
        const weeklyAssignments = state.assignments.filter(assignment => {
          const assignmentDate = new Date(assignment.date);
          return assignmentDate >= weekStart && assignmentDate <= weekEnd;
        });

        // Group assignments by day
        const design: WeeklyDesign = {};
        DAYS_OF_WEEK.forEach(day => {
          design[day] = [];
        });

        weeklyAssignments.forEach(assignment => {
          const assignmentDate = new Date(assignment.date);
          const dayIndex = (assignmentDate.getDay() + 6) % 7; // Convert to 0-6 where 0 is Monday
          const day = DAYS_OF_WEEK[dayIndex];

          const shift = shifts.find(s => s.id === assignment.shiftId);
          if (!shift) return;

          // For overnight shifts, handle both parts
          if (assignment.isOvernight) {
            if (assignment.startTime !== '00:00') {
              // This is the first part of an overnight shift
              design[day].push({
                shiftId: assignment.shiftId,
                startTime: assignment.startTime,
                endTime: '23:59',
                isOvernight: true,
                nextDayEndTime: shift.endTime
              });

              // Add the continuation to the next day
              const nextDayIndex = (dayIndex + 1) % 7;
              const nextDay = DAYS_OF_WEEK[nextDayIndex];
              design[nextDay].push({
                shiftId: assignment.shiftId,
                startTime: '00:00',
                endTime: shift.endTime,
                isOvernight: true
              });
            }
          } else {
            // Regular shift
            design[day].push({
              shiftId: assignment.shiftId,
              startTime: assignment.startTime,
              endTime: assignment.endTime,
              isOvernight: false
            });
          }
        });

        setWeeklyDesign(design);
      } catch (error) {
        console.error('Error loading weekly design:', error);
      }
    };

    if (state.assignments.length > 0) {
      loadWeeklyDesign();
    }
  }, [state.assignments, shifts]);

  const parseTimeString = (timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date;
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateTotalHours = (dayShifts: DayShiftAssignment[]): number => {
    return dayShifts.reduce((total, assignment) => {
      const shift = shifts.find(s => s.id === assignment.shiftId);
      if (!shift) return total;
      
      if (assignment.isOvernight) {
        // For overnight shifts, calculate hours that fall on this day
        const [startHour, startMinute] = assignment.startTime.split(':').map(Number);
        const [endHour, endMinute] = assignment.endTime.split(':').map(Number);
        
        // Convert times to minutes for more accurate calculation
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        
        if (assignment.startTime === '00:00') {
          // If this is the continuation of an overnight shift (starts at midnight)
          // Just count the hours until the end time
          return total + (endMinutes / 60);
        } else {
          // If this is the start of an overnight shift
          // Count hours from start until midnight
          return total + ((24 * 60 - startMinutes) / 60);
        }
      }
      
      return total + shift.duration;
    }, 0);
  };

  const handleAddShiftToDay = (day: string) => {
    if (shifts.length === 0) {
      setWarningMessage({
        open: true,
        title: 'No Shifts Available',
        message: 'Please create at least one shift type before adding shifts to the schedule.',
      });
      return;
    }

    const defaultShift = shifts[0];
    const isOvernight = isOvernightShift(defaultShift.startTime, defaultShift.endTime);

    setWeeklyDesign(prev => {
      const updatedDesign = { ...prev };
      
      // Add the main shift
      updatedDesign[day] = [
        ...updatedDesign[day],
        {
          shiftId: defaultShift.id,
          startTime: defaultShift.startTime,
          endTime: isOvernight ? '23:59' : defaultShift.endTime,
          isOvernight,
          nextDayEndTime: isOvernight ? defaultShift.endTime : undefined
        }
      ];

      // If overnight, add the continuation to the next day
      if (isOvernight) {
        const nextDayIndex = (DAYS_OF_WEEK.indexOf(day) + 1) % 7;
        const nextDay = DAYS_OF_WEEK[nextDayIndex];
        
        updatedDesign[nextDay] = [
          ...updatedDesign[nextDay],
          {
            shiftId: defaultShift.id,
            startTime: '00:00',
            endTime: defaultShift.endTime,
            isOvernight: true
          }
        ];
      }

      return updatedDesign;
    });

    setExpandedDays(prev => [...prev, day]);
  };

  const handleRemoveShiftFromDay = (day: string, index: number) => {
    setWeeklyDesign(prev => {
      const assignmentToRemove = prev[day][index];
      const selectedShift = shifts.find(s => s.id === assignmentToRemove.shiftId);
      
      // If this is an overnight shift, we need to handle both cases:
      // 1. If it's the start of the overnight shift (not starting at 00:00)
      // 2. If it's the continuation of an overnight shift (starting at 00:00)
      if (selectedShift?.isOvernight) {
        // Case 1: This is the start of the overnight shift
        if (assignmentToRemove.startTime !== '00:00') {
          const nextDayIdx = DAYS_OF_WEEK.indexOf(day) + 1;
          const nextDay = nextDayIdx < DAYS_OF_WEEK.length 
            ? DAYS_OF_WEEK[nextDayIdx] 
            : DAYS_OF_WEEK[0]; // Wrap around to Monday if it's Sunday

          // Remove the shift from the current day
          const updatedCurrentDay = prev[day].filter((_, i) => i !== index);
          
          // Remove the corresponding overnight shift from the next day
          const updatedNextDay = prev[nextDay].filter(assignment => 
            assignment.shiftId !== assignmentToRemove.shiftId || 
            assignment.startTime !== '00:00'
          );

          return {
            ...prev,
            [day]: updatedCurrentDay,
            [nextDay]: updatedNextDay,
          };
        }
        // Case 2: This is the continuation of an overnight shift
        else {
          const prevDayIdx = DAYS_OF_WEEK.indexOf(day) - 1;
          const prevDay = prevDayIdx >= 0 
            ? DAYS_OF_WEEK[prevDayIdx] 
            : DAYS_OF_WEEK[DAYS_OF_WEEK.length - 1]; // Wrap around to Sunday if it's Monday

          // Remove the shift from the current day
          const updatedCurrentDay = prev[day].filter((_, i) => i !== index);
          
          // Remove the corresponding overnight shift from the previous day
          const updatedPrevDay = prev[prevDay].filter(assignment => 
            assignment.shiftId !== assignmentToRemove.shiftId || 
            assignment.startTime === '00:00'
          );

          return {
            ...prev,
            [day]: updatedCurrentDay,
            [prevDay]: updatedPrevDay,
          };
        }
      }

      // For non-overnight shifts, just remove from the current day
      return {
        ...prev,
        [day]: prev[day].filter((_, i) => i !== index),
      };
    });
  };

  const handleShiftAssignmentChange = (day: string, index: number, field: keyof DayShiftAssignment, value: any) => {
    setWeeklyDesign(prev => {
      if (field === 'shiftId') {
        const selectedShift = shifts.find(s => s.id === value);
        if (!selectedShift) return prev;

        const isOvernight = isOvernightShift(selectedShift.startTime, selectedShift.endTime);
        const updatedAssignments = prev[day].map((assignment, i) => {
          if (i === index) {
            return {
              ...assignment,
              shiftId: value,
              startTime: selectedShift.startTime,
              endTime: isOvernight ? '23:59' : selectedShift.endTime,
              isOvernight,
              nextDayEndTime: isOvernight ? selectedShift.endTime : undefined,
            };
          }
          return assignment;
        });

        // If this is an overnight shift, handle the next day part
        if (isOvernight) {
          const nextDayIndex = DAYS_OF_WEEK.indexOf(day) + 1;
          const nextDay = nextDayIndex < DAYS_OF_WEEK.length 
            ? DAYS_OF_WEEK[nextDayIndex] 
            : DAYS_OF_WEEK[0];

          // Remove any existing overnight continuation for this shift
          const nextDayAssignments = prev[nextDay]?.filter(a => 
            !(a.shiftId === value && a.startTime === '00:00')
          ) || [];

          // Add the new overnight continuation
          nextDayAssignments.push({
            shiftId: value,
            startTime: '00:00',
            endTime: selectedShift.endTime,
            isOvernight: true,
          });

          return {
            ...prev,
            [day]: updatedAssignments,
            [nextDay]: nextDayAssignments,
          };
        }

        return {
          ...prev,
          [day]: updatedAssignments,
        };
      }

      // Handle other field changes
      return {
        ...prev,
        [day]: prev[day].map((assignment, i) => 
          i === index ? { ...assignment, [field]: value } : assignment
        ),
      };
    });
  };

  const getShiftTimeConstraints = (shiftId: string) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return { min: '00:00', max: '23:59' };
    return {
      min: shift.startTime,
      max: shift.endTime,
    };
  };

  const handleAddRole = () => {
    setFormData(prev => ({
      ...prev,
      roles: [...prev.roles, { roleId: '', count: 1, duration: prev.duration }]
    }));
  };

  const handleRemoveRole = (index: number) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.filter((_, i) => i !== index)
    }));
  };

  const handleRoleChange = (index: number, field: keyof ShiftRole, value: any) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.map((role, i) => 
        i === index ? { ...role, [field]: value } : role
      )
    }));
  };

  const handleOpen = (shift?: Shift) => {
    if (shift) {
      setEditingShift(shift);
      const today = new Date();
      const [startHours, startMinutes] = shift.startTime.split(':').map(Number);
      const [endHours, endMinutes] = shift.endTime.split(':').map(Number);
      
      const startDate = new Date(today);
      startDate.setHours(startHours, startMinutes, 0, 0);
      
      const endDate = new Date(today);
      endDate.setHours(endHours, endMinutes, 0, 0);

      setFormData({
        name: shift.name,
        startTime: startDate,
        endTime: endDate,
        duration: shift.duration,
        requiredEmployees: shift.requiredEmployees,
        color: shift.color,
        isOvernight: shift.isOvernight || false,
        roles: shift.roles || [],
      });
    } else {
      setEditingShift(null);
      setFormData({
        name: '',
        startTime: new Date(),
        endTime: new Date(),
        duration: 0,
        requiredEmployees: 1,
        color: '#1976d2',
        isOvernight: false,
        roles: [],
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingShift(null);
  };

  const handleColorPickerOpen = (event: React.MouseEvent<HTMLElement>) => {
    setColorPickerAnchor(event.currentTarget);
  };

  const handleColorPickerClose = () => {
    setColorPickerAnchor(null);
  };

  const handleColorChange = (color: any) => {
    setFormData({ ...formData, color: color.hex });
    handleColorPickerClose();
  };

  const handleSave = () => {
    const isOvernight = formData.startTime > formData.endTime;
    const shiftData = {
      name: formData.name,
      startTime: format(formData.startTime, 'HH:mm'),
      endTime: format(formData.endTime, 'HH:mm'),
      duration: formData.duration,
      requiredEmployees: formData.requiredEmployees,
      color: formData.color,
      isOvernight,
      roles: formData.roles,
    };

    if (editingShift) {
      updateShift(editingShift.id, shiftData);
    } else {
      addShift(shiftData);
    }
    handleClose();
  };

  const handleDelete = async (shiftId: string) => {
    if (window.confirm('Are you sure you want to delete this shift?')) {
      try {
        await deleteShift(shiftId);
      } catch (error) {
        console.error('Error deleting shift:', error);
      }
    }
  };

  const handleAccordionChange = (day: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedDays(prev => 
      isExpanded 
        ? [...prev, day]
        : prev.filter(d => d !== day)
    );
  };

  const sortShiftsByStartTime = (shifts: DayShiftAssignment[]): DayShiftAssignment[] => {
    return [...shifts].sort((a, b) => {
      const [aHour, aMinute] = a.startTime.split(':').map(Number);
      const [bHour, bMinute] = b.startTime.split(':').map(Number);
      
      if (aHour !== bHour) return aHour - bHour;
      return aMinute - bMinute;
    });
  };

  const renderWeeklyDesign = () => (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CalendarMonthIcon color="primary" />
        Weekly Shift Design
      </Typography>
      <Grid container spacing={2}>
        {DAYS_OF_WEEK.map((day, dayIndex) => (
          <Grid item xs={12} md={6} key={day}>
            <Paper 
              sx={{ 
                p: 2,
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Accordion 
                expanded={expandedDays.includes(day)}
                onChange={handleAccordionChange(day)}
                sx={{ 
                  background: 'transparent',
                  boxShadow: 'none',
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ 
                    minHeight: '48px !important',
                    '& .MuiAccordionSummary-content': {
                      margin: '0 !important',
                    }
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                        <CalendarMonthIcon sx={{ color: 'primary.main' }} />
                        {day}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 0.5,
                          color: 'text.secondary',
                          backgroundColor: 'background.default',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                        }}
                      >
                        <AccessTimeIcon sx={{ fontSize: 16 }} />
                        {calculateTotalHours(weeklyDesign[day])}h
                      </Typography>
                    </Box>
                    <Button
                      startIcon={<AddCircleIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddShiftToDay(day);
                      }}
                      size="small"
                      variant="contained"
                      color="primary"
                      sx={{ borderRadius: 1 }}
                    >
                      Add Shift
                    </Button>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 0, pt: 2 }}>
                  <Stack spacing={1.5}>
                    {sortShiftsByStartTime(weeklyDesign[day]).map((assignment, index) => {
                      const selectedShift = shifts.find(s => s.id === assignment.shiftId);
                      const shiftColor = selectedShift?.color || '#1976d2';
                      const isOvernight = selectedShift?.isOvernight;
                      
                      return (
                        <Paper 
                          key={index} 
                          variant="outlined" 
                          sx={{ 
                            p: 1.5,
                            borderColor: isOvernight ? 'primary.main' : shiftColor,
                            borderWidth: isOvernight ? 2 : 1,
                            backgroundColor: 'background.paper',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.2s ease-in-out',
                            borderRadius: 2,
                            '&:hover': {
                              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                              transform: 'translateY(-1px)',
                              borderColor: isOvernight ? 'primary.dark' : shiftColor,
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: 3,
                              height: '100%',
                              backgroundColor: shiftColor,
                              opacity: 0.8,
                              transition: 'all 0.2s ease-in-out',
                            },
                            '&:hover::before': {
                              opacity: 1,
                            }
                          }}
                        >
                          <Stack spacing={1}>
                            {/* Header Section */}
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                            }}>
                              <FormControl size="small" sx={{ flex: 1, mr: 1 }}>
                                <Select
                                  value={assignment.shiftId}
                                  onChange={(e) => handleShiftAssignmentChange(day, index, 'shiftId', e.target.value)}
                                  displayEmpty
                                  sx={{
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: shiftColor,
                                      borderRadius: 1,
                                      transition: 'all 0.2s ease-in-out',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                      borderColor: shiftColor,
                                      borderWidth: 2,
                                    },
                                    '& .MuiSelect-select': {
                                      py: 0.5,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.5,
                                    }
                                  }}
                                >
                                  <MenuItem value="" disabled>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                      <AccessTimeIcon sx={{ fontSize: 16 }} />
                                      Select Shift
                                    </Box>
                                  </MenuItem>
                                  {shifts.map((shift) => (
                                    <MenuItem 
                                      key={shift.id} 
                                      value={shift.id}
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          width: 6,
                                          height: 6,
                                          borderRadius: '50%',
                                          backgroundColor: shift.color,
                                          border: '1px solid',
                                          borderColor: 'white',
                                        }}
                                      />
                                      {shift.name}
                                      {shift.isOvernight && (
                                        <Chip
                                          label="Overnight"
                                          size="small"
                                          color="primary"
                                          variant="outlined"
                                          sx={{ 
                                            ml: 0.5,
                                            height: 16,
                                            '& .MuiChip-label': {
                                              px: 0.5,
                                              fontSize: '0.7rem',
                                            }
                                          }}
                                        />
                                      )}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveShiftFromDay(day, index)}
                                sx={{
                                  '&:hover': {
                                    backgroundColor: 'error.light',
                                    color: 'error.dark',
                                    transform: 'scale(1.1)',
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            
                            {selectedShift && (
                              <Box sx={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                gap: 0.75,
                                p: 0.75,
                                borderRadius: 1,
                                backgroundColor: `${shiftColor}08`,
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  backgroundColor: `${shiftColor}12`,
                                }
                              }}>
                                {/* Time Information */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {assignment.startTime} - {assignment.endTime}
                                  </Typography>
                                  {selectedShift.isOvernight && (
                                    <Typography 
                                      variant="caption" 
                                      sx={{ 
                                        color: 'primary.main',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        ml: 'auto',
                                      }}
                                    >
                                      <AccessTimeIcon sx={{ fontSize: 14 }} />
                                      {assignment.startTime === '00:00' ? 'Continued' : `Until ${assignment.nextDayEndTime}`}
                                    </Typography>
                                  )}
                                </Box>

                                {/* Shift Details */}
                                <Box sx={{ 
                                  display: 'flex', 
                                  gap: 0.5,
                                  flexWrap: 'wrap',
                                }}>
                                  <Chip
                                    icon={<AccessTimeIcon />}
                                    label={`${selectedShift.duration}h`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ 
                                      height: 16,
                                      borderColor: shiftColor,
                                      color: shiftColor,
                                      '& .MuiChip-label': {
                                        px: 0.5,
                                        fontSize: '0.7rem',
                                      }
                                    }}
                                  />
                                  <Chip
                                    icon={<GroupIcon />}
                                    label={`${selectedShift.requiredEmployees} req`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ 
                                      height: 16,
                                      borderColor: shiftColor,
                                      color: shiftColor,
                                      '& .MuiChip-label': {
                                        px: 0.5,
                                        fontSize: '0.7rem',
                                      }
                                    }}
                                  />
                                </Box>
                              </Box>
                            )}
                          </Stack>
                        </Paper>
                      );
                    })}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const handleEmployeeAssignment = (e: React.ChangeEvent<HTMLSelectElement>, shiftId: string) => {
    const employeeId = e.target.value;
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return;

    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    if (!hasRequiredRole(employee, shift)) {
      setWarningMessage({
        open: true,
        title: 'Invalid Role Assignment',
        message: `Cannot assign ${employee.name} to this shift. Required roles: ${shift.roles.map((r: ShiftRole) => {
          const role = roles.find(role => role.id === r.roleId);
          return role?.name || r.roleId;
        }).join(', ')}`,
        details: `Employee ${employee.name} does not have the required role(s) for this shift.`
      });
      return;
    }

    // Proceed with assignment if role check passes
    // ... rest of your assignment logic ...
  };

  const handleFirebaseError = (error: any) => {
    if (error?.message?.includes('ERR_BLOCKED_BY_CLIENT') || 
        error?.code === 'permission-denied' ||
        error?.name === 'FirebaseError') {
      setFirebaseBlockedError(true);
    }
  };

  const saveWeeklyDesign = async () => {
    try {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay() + 1);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      console.log('Saving weekly design for week:', {
        start: weekStart.toISOString(),
        end: weekEnd.toISOString()
      });

      // Validate assignments
      const invalidAssignments = [];
      Object.entries(weeklyDesign).forEach(([day, assignments]) => {
        assignments.forEach((assignment, index) => {
          if (!assignment.shiftId) {
            invalidAssignments.push({ day, index });
          }
        });
      });

      if (invalidAssignments.length > 0) {
        setWarningMessage({
          open: true,
          title: 'Invalid Assignments',
          message: `Found ${invalidAssignments.length} invalid assignments. Please ensure all shifts have been properly configured.`,
          details: 'Each shift must have a selected shift type.'
        });
        return;
      }

      // Delete existing assignments
      const existingAssignments = state.assignments.filter(assignment => {
        const assignmentDate = new Date(assignment.date);
        return assignmentDate >= weekStart && assignmentDate <= weekEnd;
      });

      await Promise.all(existingAssignments.map(assignment => 
        deleteAssignment(assignment.id)
      ));

      // Create new assignments
      const assignmentsToCreate: Omit<ShiftAssignment, 'id'>[] = [];
      const processedOvernightShifts = new Set<string>();

      Object.entries(weeklyDesign).forEach(([day, assignments]) => {
        const dayIndex = DAYS_OF_WEEK.indexOf(day);
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + dayIndex);

        assignments.forEach(assignment => {
          const shift = shifts.find(s => s.id === assignment.shiftId);
          if (!shift) return;

          // Skip processed overnight continuations
          const overnightKey = `${assignment.shiftId}-${currentDate.toISOString()}`;
          if (assignment.isOvernight && assignment.startTime === '00:00' &&
              processedOvernightShifts.has(overnightKey)) {
            return;
          }

          // Create the main assignment
          assignmentsToCreate.push({
            shiftId: assignment.shiftId,
            employeeId: '',
            date: currentDate.toISOString(),
            startTime: assignment.startTime,
            endTime: assignment.isOvernight ? '23:59' : assignment.endTime,
            isOvernight: assignment.isOvernight,
            status: 'pending',
            roleId: shift.roles[0].roleId
          });

          // Handle overnight shifts
          if (assignment.isOvernight && assignment.startTime !== '00:00') {
            const nextDate = new Date(currentDate);
            nextDate.setDate(currentDate.getDate() + 1);
            
            assignmentsToCreate.push({
              shiftId: assignment.shiftId,
              employeeId: '',
              date: nextDate.toISOString(),
              startTime: '00:00',
              endTime: assignment.nextDayEndTime || shift.endTime,
              isOvernight: true,
              status: 'pending',
              roleId: shift.roles[0].roleId
            });

            processedOvernightShifts.add(`${assignment.shiftId}-${nextDate.toISOString()}`);
          }
        });
      });

      // Save all assignments
      await Promise.all(assignmentsToCreate.map(assignment => 
        addAssignment(assignment)
      ));

      setWarningMessage({
        open: true,
        title: 'Success',
        message: 'Weekly design saved successfully',
      });
    } catch (error) {
      console.error('Error saving weekly design:', error);
      handleFirebaseError(error);
      setWarningMessage({
        open: true,
        title: 'Error',
        message: 'Failed to save weekly design',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  };

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
              Shift Management
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Manage your shift types and weekly schedule design
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            sx={{ 
              backgroundColor: 'white',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              }
            }}
          >
            Add Shift
          </Button>
        </Box>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          sx={{ px: 0 }}
        >
          <Tab 
            icon={<AccessTimeIcon />} 
            label="Shift Types" 
            iconPosition="start"
          />
          <Tab 
            icon={<CalendarMonthIcon />} 
            label="Weekly Design" 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {selectedTab === 0 ? (
        <Grid container spacing={2}>
          {isLoading ? (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            </Grid>
          ) : shifts.length === 0 ? (
            <Grid item xs={12}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 2
                }}
              >
                <Typography color="text.secondary">
                  No shifts found. Click "Add Shift" to create your first shift.
                </Typography>
              </Paper>
            </Grid>
          ) : (
            shifts.map((shift) => (
              <Grid item xs={12} md={6} lg={4} key={shift.id}>
                <Card 
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: theme.shadows[2],
                      borderColor: 'primary.main',
                    }
                  }}
                >
                  <CardContent>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: shift.color,
                            }}
                          />
                          <Typography variant="h6">{shift.name}</Typography>
                        </Box>
                        <Box>
                          <Tooltip title="Edit">
                            <IconButton 
                              onClick={() => handleOpen(shift)} 
                              color="primary"
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              onClick={() => handleDelete(shift.id)} 
                              color="error"
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {shift.startTime} - {shift.endTime}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Chip
                          label={`${shift.duration} hrs`}
                          size="small"
                          variant="outlined"
                          icon={<AccessTimeIcon />}
                        />
                        <Chip
                          label={`${shift.requiredEmployees} req.`}
                          size="small"
                          variant="outlined"
                          icon={<GroupIcon />}
                        />
                        {shift.isOvernight && (
                          <Chip
                            label="Overnight"
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </Box>

                      {shift.roles && shift.roles.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            Required Roles:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {shift.roles.map((role: ShiftRole, index: number) => {
                              const roleData = roles.find(r => r.id === role.roleId);
                              if (!roleData) return null;
                              return (
                                <Chip
                                  key={index}
                                  label={`${roleData.name} (${role.count})`}
                                  size="small"
                                  sx={{
                                    backgroundColor: roleData.color,
                                    color: 'white',
                                    '&:hover': {
                                      backgroundColor: roleData.color,
                                      opacity: 0.9,
                                    }
                                  }}
                                />
                              );
                            })}
                          </Box>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      ) : (
        <>
          {renderWeeklyDesign()}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={saveWeeklyDesign}
              startIcon={<CheckCircleIcon />}
            >
              Save Weekly Design
            </Button>
          </Box>
        </>
      )}

      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {editingShift ? <EditIcon color="primary" /> : <AddIcon color="primary" />}
            <Typography variant="h6">
              {editingShift ? 'Edit Shift' : 'Add New Shift'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Shift Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
            />
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TimePicker
                    label="Start Time"
                    value={formData.startTime}
                    onChange={(newValue) => setFormData({ ...formData, startTime: newValue || new Date() })}
                    slotProps={{ 
                      textField: { 
                        fullWidth: true,
                        sx: { '& .MuiOutlinedInput-root': { borderRadius: 1 } }
                      } 
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TimePicker
                    label="End Time"
                    value={formData.endTime}
                    onChange={(newValue) => setFormData({ ...formData, endTime: newValue || new Date() })}
                    slotProps={{ 
                      textField: { 
                        fullWidth: true,
                        sx: { '& .MuiOutlinedInput-root': { borderRadius: 1 } }
                      } 
                    }}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>

            <TextField
              label="Duration (hours)"
              type="number"
              fullWidth
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
            />

            <TextField
              label="Required Employees"
              type="number"
              fullWidth
              value={formData.requiredEmployees}
              onChange={(e) => setFormData({ ...formData, requiredEmployees: Number(e.target.value) })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
            />

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2">
                  Required Roles
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddRole}
                  size="small"
                  variant="outlined"
                >
                  Add Role
                </Button>
              </Box>
              <Stack spacing={2}>
                {formData.roles.map((role, index) => (
                  <Paper
                    key={index}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      borderColor: 'divider',
                      backgroundColor: 'background.paper',
                    }}
                  >
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2">Role {index + 1}</Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveRole(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <FormControl fullWidth>
                        <InputLabel>Select Role</InputLabel>
                        <Select
                          value={role.roleId}
                          label="Select Role"
                          onChange={(e) => handleRoleChange(index, 'roleId', e.target.value)}
                        >
                          {roles.map((r) => (
                            <MenuItem key={r.id} value={r.id}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: r.color,
                                  }}
                                />
                                {r.name}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField
                            label="Count"
                            type="number"
                            fullWidth
                            value={role.count}
                            onChange={(e) => handleRoleChange(index, 'count', Number(e.target.value))}
                            inputProps={{ min: 1 }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="Duration (hours)"
                            type="number"
                            fullWidth
                            value={role.duration}
                            onChange={(e) => handleRoleChange(index, 'duration', Number(e.target.value))}
                            inputProps={{ min: 0, max: formData.duration }}
                          />
                        </Grid>
                      </Grid>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Shift Color
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1,
                    backgroundColor: formData.color,
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                  }}
                  onClick={handleColorPickerOpen}
                />
                <Button
                  startIcon={<PaletteIcon />}
                  onClick={handleColorPickerOpen}
                  variant="outlined"
                  sx={{ borderRadius: 1 }}
                >
                  Choose Color
                </Button>
              </Box>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isOvernight}
                  onChange={(e) => setFormData({ ...formData, isOvernight: e.target.checked })}
                />
              }
              label="Overnight Shift"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={handleClose} sx={{ borderRadius: 1 }}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            sx={{ borderRadius: 1 }}
          >
            {editingShift ? 'Update' : 'Add'} Shift
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={warningMessage.open}
        onClose={() => setWarningMessage(prev => ({ ...prev, open: false }))}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="warning" />
            <Typography>{warningMessage.title}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography>{warningMessage.message}</Typography>
            {warningMessage.details && (
              <Typography variant="body2" color="text.secondary">
                {warningMessage.details}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWarningMessage(prev => ({ ...prev, open: false }))}>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={firebaseBlockedError}
        onClose={() => setFirebaseBlockedError(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="warning" />
            <Typography>Firebase Connection Blocked</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography>
              It looks like your browser is blocking connections to Firebase. This is usually caused by ad blockers or privacy extensions.
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              To fix this, you can:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Temporarily disable your ad blocker for this site"
                  secondary="This is the quickest solution"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Add these domains to your ad blocker's whitelist:"
                  secondary="firestore.googleapis.com, *.firebaseio.com, *.firebase.google.com"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Try using the app in an Incognito/Private window"
                  secondary="Extensions are usually disabled in private browsing"
                />
              </ListItem>
            </List>
            <Alert severity="info" sx={{ mt: 2 }}>
              After making these changes, you may need to refresh the page.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFirebaseBlockedError(false)}>
            Close
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              window.location.reload();
            }}
          >
            Refresh Page
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 