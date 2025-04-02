import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { format, addWeeks, subWeeks, startOfWeek, addDays } from 'date-fns';

interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  startTime: string;
  endTime: string;
  date: Date;
}

const RotaCalendar: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [shifts, setShifts] = useState<Shift[]>([]);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Start from Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleAddShift = () => {
    // TODO: Implement add shift functionality
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Weekly Rota</Typography>
        <Box>
          <IconButton onClick={handlePreviousWeek}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h6" component="span" sx={{ mx: 2 }}>
            {format(weekStart, 'MMMM d, yyyy')}
          </Typography>
          <IconButton onClick={handleNextWeek}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddShift}
        >
          Add Shift
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              {weekDays.map((day) => (
                <TableCell key={day.toString()} align="center">
                  {format(day, 'EEE d')}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Example row - replace with actual employee data */}
            <TableRow>
              <TableCell component="th" scope="row">
                John Doe
              </TableCell>
              {weekDays.map((day) => (
                <TableCell key={day.toString()} align="center">
                  {/* TODO: Add shift information */}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RotaCalendar; 