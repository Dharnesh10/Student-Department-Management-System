import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import DashboardLayout from './pages/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import AddStudent from './pages/AddStudent';
import MentorAcademics from './pages/MentorAcademics';
import StudentDashboardLayout from './pages/StudentDashboardLayout';
import StudentDashboard from './pages/StudentDashboard';
import StudentAcademics from './pages/StudentAcademics';
import StudentPerformance from './pages/StudentPerformance';
import StudentProfile from './pages/StudentProfile';

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Mentor Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute allowedRoles={['mentor']}>
                  <DashboardLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="students" element={<Students />} />
              <Route path="add-student" element={<AddStudent />} />
              <Route path="academics" element={<MentorAcademics />} />
            </Route>

            {/* Student Routes */}
            <Route
              path="/student-dashboard"
              element={
                <PrivateRoute allowedRoles={['student']}>
                  <StudentDashboardLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<StudentDashboard />} />
              <Route path="academics" element={<StudentAcademics />} />
              <Route path="performance" element={<StudentPerformance />} />
              <Route path="profile" element={<StudentProfile />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;