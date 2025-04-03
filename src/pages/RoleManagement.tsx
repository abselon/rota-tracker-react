import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  Stack,
  useTheme,
  Tooltip,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Popover,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Work as WorkIcon,
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
import { SketchPicker } from 'react-color';
import { useAppContext } from '../context/AppContext';
import { Role } from '../types';

interface FormData {
  name: string;
  icon: string;
  color: string;
  description: string;
}

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

export default function RoleManagement() {
  const theme = useTheme();
  const { state, addRole, updateRole, deleteRole } = useAppContext();
  const { roles, error } = state;
  const [open, setOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [colorPickerAnchor, setColorPickerAnchor] = useState<null | HTMLElement>(null);
  const [selectedColor, setSelectedColor] = useState('#1976d2');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    icon: 'Work',
    color: '#1976d2',
    description: '',
  });

  const handleOpen = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        icon: role.icon,
        color: role.color,
        description: role.description || '',
      });
      setSelectedColor(role.color);
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        icon: 'Work',
        color: '#1976d2',
        description: '',
      });
      setSelectedColor('#1976d2');
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingRole(null);
    setFormData({
      name: '',
      icon: 'Work',
      color: '#1976d2',
      description: '',
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingRole) {
        await updateRole(editingRole.id, {
          ...formData,
          color: selectedColor,
        });
      } else {
        await addRole({
          ...formData,
          color: selectedColor,
        });
      }
      handleClose();
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const handleDelete = async (roleId: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await deleteRole(roleId);
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  const handleColorClick = (event: React.MouseEvent<HTMLElement>) => {
    setColorPickerAnchor(event.currentTarget);
  };

  const handleColorClose = () => {
    setColorPickerAnchor(null);
  };

  const handleColorChange = (color: any) => {
    setSelectedColor(color.hex);
    handleColorClose();
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
              Role Management
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Define and manage employee roles
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
            Add Role
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {roles.map((role) => {
          const IconComponent = availableIcons.find(icon => icon.name === role.icon)?.component || WorkIcon;
          return (
            <Grid item xs={12} sm={6} md={4} key={role.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4],
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: role.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComponent sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="h6">{role.name}</Typography>
                      {role.description && (
                        <Typography variant="body2" color="text.secondary">
                          {role.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
                <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleOpen(role)} size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDelete(role.id)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {editingRole ? 'Edit Role' : 'Add New Role'}
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Role Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />

            <FormControl fullWidth>
              <InputLabel>Icon</InputLabel>
              <Select
                value={formData.icon}
                label="Icon"
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              >
                {availableIcons.map((icon) => {
                  const IconComponent = icon.component;
                  return (
                    <MenuItem key={icon.name} value={icon.name}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconComponent fontSize="small" />
                        <Typography>{icon.name}</Typography>
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Color</Typography>
              <Box
                onClick={handleColorClick}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  backgroundColor: selectedColor,
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8,
                  }
                }}
              />
              <Popover
                open={Boolean(colorPickerAnchor)}
                anchorEl={colorPickerAnchor}
                onClose={handleColorClose}
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
                  color={selectedColor}
                  onChange={handleColorChange}
                  disableAlpha
                />
              </Popover>
            </Box>

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={!formData.name}
          >
            {editingRole ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 