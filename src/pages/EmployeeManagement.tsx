import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { Employee, AvailabilityDay } from '../types';
import { generateUniqueColor, isColorTooSimilar } from '../utils/colorUtils';
import { SketchPicker } from 'react-color';

// Initialize default availability for each day of the week
const defaultAvailability: Record<string, AvailabilityDay> = {
  monday: { isClosed: false, startTime: '09:00', endTime: '17:00' },
  tuesday: { isClosed: false, startTime: '09:00', endTime: '17:00' },
  wednesday: { isClosed: false, startTime: '09:00', endTime: '17:00' },
  thursday: { isClosed: false, startTime: '09:00', endTime: '17:00' },
  friday: { isClosed: false, startTime: '09:00', endTime: '17:00' },
  saturday: { isClosed: true },
  sunday: { isClosed: true },
};

const EmployeeManagement: React.FC = () => {
  const { state, addEmployee, updateEmployee, deleteEmployee } = useAppContext();
  const { employees, isLoading, error } = state;
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [colorPickerAnchor, setColorPickerAnchor] = useState<null | HTMLElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    availability: defaultAvailability,
    color: generateUniqueColor(employees.map(emp => emp.color)),
  });

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setSelectedEmployee(employee);
      setFormData({
        name: employee.name,
        email: employee.email,
        role: employee.role,
        phone: employee.phone,
        availability: employee.availability || defaultAvailability,
        color: employee.color,
      });
    } else {
      setSelectedEmployee(null);
      setFormData({
        name: '',
        email: '',
        role: '',
        phone: '',
        availability: defaultAvailability,
        color: generateUniqueColor(employees.map(emp => emp.color)),
      });
    }
    setFormError(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEmployee(null);
    setFormError(null);
    setFormData({
      name: '',
      email: '',
      role: '',
      phone: '',
      availability: defaultAvailability,
      color: generateUniqueColor(employees.map(emp => emp.color)),
    });
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
      .map(emp => emp.color);

    if (isColorTooSimilar(newColor, usedColors)) {
      setFormError('This color is too similar to another employee\'s color. Please choose a different color.');
      return;
    }

    setFormData({ ...formData, color: newColor });
    handleColorPickerClose();
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setFormError('Email is required');
      return false;
    }
    if (!formData.role.trim()) {
      setFormError('Role is required');
      return false;
    }
    return true;
  };

  const handleSaveEmployee = async () => {
    if (!validateForm()) return;
    
    try {
      // Ensure availability is properly structured
      const employeeData = {
        ...formData,
        availability: formData.availability || defaultAvailability
      };
      
      if (selectedEmployee) {
        // Update existing employee
        await updateEmployee(selectedEmployee.id, employeeData);
      } else {
        // Add new employee
        await addEmployee(employeeData);
      }
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving employee:', err);
      setFormError('Failed to save employee. Please try again.');
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Employee Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Employee
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No employees found. Add your first employee to get started.
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.phone}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(employee)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteEmployee(employee.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedEmployee ? 'Edit Employee' : 'Add Employee'}
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Stack spacing={3} sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <TextField
              fullWidth
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography>Employee Color:</Typography>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  backgroundColor: formData.color,
                  border: '1px solid #e0e0e0',
                  cursor: 'pointer',
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
          <Button onClick={handleSaveEmployee} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeManagement; 