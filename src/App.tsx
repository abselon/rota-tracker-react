import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AppProvider } from './context/AppContext';
import theme from './theme';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RotaCalendar from './pages/RotaCalendar';
import ShiftBasedCalendar from './pages/TimeBasedCalendar';
import EmployeeManagement from './pages/EmployeeManagement';
import ShiftManagement from './pages/ShiftManagement';
import WeeklyScheduleManagement from './pages/WeeklyScheduleManagement';
import RoleManagement from './pages/RoleManagement';
import MasterCalendar from './pages/MasterCalendar';
import RoleBasedCalendar from './pages/RoleBasedCalendar';
import { AdBlockerAlert } from './components/AdBlockerAlert';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AppProvider>
          <Router>
            <AdBlockerAlert />
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/master-calendar" element={<MasterCalendar />} />
                <Route path="/role-calendar" element={<RoleBasedCalendar />} />
                <Route path="/calendar" element={<RotaCalendar />} />
                <Route path="/shift-calendar" element={<ShiftBasedCalendar />} />
                <Route path="/employees" element={<EmployeeManagement />} />
                <Route path="/shifts" element={<ShiftManagement />} />
                <Route path="/schedules" element={<WeeklyScheduleManagement />} />
                <Route path="/roles" element={<RoleManagement />} />
              </Routes>
            </Layout>
          </Router>
        </AppProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
