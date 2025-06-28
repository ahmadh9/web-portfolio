// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import PrivateRoute from './components/common/PrivateRoute';
import Header from './components/common/Header';
import Footer from './components/common/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import CreateCoursePage from './pages/CreateCoursePage';
import EditCoursePage from './pages/EditCoursePage';
import LessonPage from './pages/LessonPage';
import StudentAssignmentPage from './pages/StudentAssignmentPage';
import StudentQuizPage from './pages/StudentQuizPage';
import UsersManagementPage from './pages/UsersManagementPage';
import NotFound from './pages/NotFound';

// Theme
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    background: { default: '#f5f5f5' },
  },
  typography: {
    fontFamily: [
      '-apple-system','BlinkMacSystemFont','"Segoe UI"','Roboto',
      '"Helvetica Neue"','Arial','sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Header />
          <main style={{ minHeight: 'calc(100vh - 200px)', paddingTop: '64px' }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:id" element={<CourseDetailsPage />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute roles={['student','instructor','admin']}>
                    <DashboardPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute roles={['student','instructor','admin']}>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/courses/create"
                element={
                  <PrivateRoute roles={['instructor']}>
                    <CreateCoursePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/courses/:id/edit"
                element={
                  <PrivateRoute roles={['instructor','admin']}>
                    <EditCoursePage />
                  </PrivateRoute>
                }
              />

              {/* Student-specific Content */}
              <Route
                path="/courses/:courseId/lesson/:lessonId/assignment"
                element={
                  <PrivateRoute roles={['student']}>
                    <StudentAssignmentPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/courses/:courseId/lesson/:lessonId/quiz"
                element={
                  <PrivateRoute roles={['student']}>
                    <StudentQuizPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/courses/:courseId/lessons/:lessonId"
                element={
                  <PrivateRoute roles={['student']}>
                    <LessonPage />
                  </PrivateRoute>
                }
              />

              {/* Admin-only */}
              <Route
                path="/admin/users"
                element={
                  <PrivateRoute roles={['admin']}>
                    <UsersManagementPage />
                  </PrivateRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
          />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
