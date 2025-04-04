import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/master-calendar" element={<MasterCalendar />} />
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
    </ThemeProvider>
  );
}

export default App;
