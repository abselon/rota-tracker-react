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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { Employee } from '../types';

const EmployeeManagement: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { employees } = state;
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    availability: {},
    color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
  });

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setSelectedEmployee(employee);
      setFormData({
        name: employee.name,
        email: employee.email,
        role: employee.role,
        phone: employee.phone,
        availability: employee.availability,
        color: employee.color,
      });
    } else {
      setSelectedEmployee(null);
      setFormData({
        name: '',
        email: '',
        role: '',
        phone: '',
        availability: {},
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEmployee(null);
    setFormData({
      name: '',
      email: '',
      role: '',
      phone: '',
      availability: {},
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
    });
  };

  const handleSaveEmployee = () => {
    if (selectedEmployee) {
      // Update existing employee
      dispatch({
        type: 'UPDATE_EMPLOYEE',
        payload: {
          ...selectedEmployee,
          ...formData,
        },
      });
    } else {
      // Add new employee
      const newEmployee: Employee = {
        id: Date.now().toString(),
        ...formData,
      };
      dispatch({ type: 'ADD_EMPLOYEE', payload: newEmployee });
    }
    handleCloseDialog();
  };

  const handleDeleteEmployee = (id: string) => {
    dispatch({ type: 'DELETE_EMPLOYEE', payload: id });
  };

  return (
    <Box>
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
            {employees.map((employee) => (
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedEmployee ? 'Edit Employee' : 'Add Employee'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
          </Box>
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