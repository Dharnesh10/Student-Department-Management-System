// App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DepartmentView from './pages/DepartmentView';
import StudentDetail from './pages/StudentDetail';
import SmartFilter from './pages/SmartFilter';
import PlacedStudents from './pages/PlacedStudents';

const PrivateRoute = ({ children }) => {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return admin ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { admin } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={admin ? <Navigate to="/" /> : <Login />}
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/smart-filter"
        element={
          <PrivateRoute>
            <Layout>
              <SmartFilter />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/department/:code"
        element={
          <PrivateRoute>
            <Layout>
              <DepartmentView />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/student/:id"
        element={
          <PrivateRoute>
            <Layout>
              <StudentDetail />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/placed-students"
        element={
          <PrivateRoute>
            <Layout>
              <PlacedStudents />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;