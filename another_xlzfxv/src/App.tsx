import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Dashboard from './pages/Dashboard';
import Research from './pages/Research';
import Survey from './pages/Survey';
import Analysis from './pages/Analysis';
import Report from './pages/Report';
import Settings from './pages/Settings';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" /> : <>{children}</>;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route
                path="/"
                element={
                  <PublicRoute>
                    <Landing />
                  </PublicRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicRoute>
                    <Signup />
                  </PublicRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="research" element={<Research />} />
                <Route path="survey" element={<Survey />} />
                <Route path="analysis" element={<Analysis />} />
                <Route path="report" element={<Report />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Direct protected routes */}
              <Route
                path="/research"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Research />} />
              </Route>

              <Route
                path="/survey"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Survey />} />
              </Route>

              <Route
                path="/analysis"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Analysis />} />
              </Route>

              <Route
                path="/report"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Report />} />
              </Route>

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Settings />} />
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-color)',
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
