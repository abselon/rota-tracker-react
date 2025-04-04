import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  Avatar,
  Tooltip,
  Divider,
  Badge,
  Paper,
  Stack,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  CalendarMonth as CalendarIcon,
  People as PeopleIcon,
  AccessTime as ShiftIcon,
  CalendarViewWeek as ScheduleIcon,
  Schedule as TimeCalendarIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Work as WorkIcon,
  CalendarToday as MasterCalendarIcon,
} from '@mui/icons-material';

const drawerWidth = 260;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Master Calendar', icon: <MasterCalendarIcon />, path: '/master-calendar' },
    { text: 'Employee Calendar', icon: <CalendarIcon />, path: '/calendar' },
    { text: 'Shift Calendar', icon: <TimeCalendarIcon />, path: '/shift-calendar' },
    { text: 'Employees', icon: <PeopleIcon />, path: '/employees' },
    { text: 'Shifts', icon: <ShiftIcon />, path: '/shifts' },
    { text: 'Schedules', icon: <ScheduleIcon />, path: '/schedules' },
    { text: 'Roles', icon: <WorkIcon />, path: '/roles' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 2.5, 
          background: '#f8fafc',
          color: 'text.primary',
          borderRadius: 0,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            fontSize: '1.1rem',
            color: '#1e293b',
          }}
        >
          ROTA Tracker
        </Typography>
      </Paper>
      <Divider />
      <List sx={{ px: 1, py: 2 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
            selected={location.pathname === item.path}
            sx={{
              mb: 0.5,
              borderRadius: 1.5,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                color: '#1976d2',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.12)',
                },
                '& .MuiListItemIcon-root': {
                  color: '#1976d2',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 3,
                  height: '40%',
                  backgroundColor: '#1976d2',
                  borderRadius: '0 4px 4px 0',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>{item.icon}</ListItemIcon>
            <ListItemText 
              primary={item.text}
              primaryTypographyProps={{
                sx: {
                  fontSize: '0.875rem',
                  fontWeight: location.pathname === item.path ? 500 : 400,
                }
              }}
            />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <List sx={{ px: 1, py: 2 }}>
        <ListItemButton 
          sx={{ 
            borderRadius: 1.5,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Settings"
            primaryTypographyProps={{
              sx: { 
                fontSize: '0.875rem',
                fontWeight: 400 
              }
            }}
          />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600, fontSize: '1.1rem' }}>
            {menuItems.find((item) => item.path === location.pathname)?.text || 'ROTA Tracker'}
          </Typography>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Tooltip title="Notifications">
              <IconButton size="small">
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Profile">
              <IconButton size="small">
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    backgroundColor: '#1976d2',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                  }}
                >
                  U
                </Avatar>
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          backgroundColor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 