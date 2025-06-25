import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Pending as PendingIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, users, courses
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectCourseId, setRejectCourseId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const usersRes = await fetch('http://localhost:5000/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      const coursesRes = await fetch('http://localhost:5000/api/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData.courses || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user and all related data?')) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (res.ok) {
        alert('User deleted successfully');
        setUsers(users.filter(u => u.id !== userId));
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const deleteCourse = async (courseId) => {
    if (!window.confirm('Delete this course?')) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (res.ok) {
        alert('Course deleted successfully');
        setCourses(courses.filter(c => c.id !== courseId));
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const approveCourse = async (courseId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (res.ok) {
        alert('Course approved successfully');
        loadData();
      } else {
        alert('Failed to approve course');
      }
    } catch (error) {
      console.error('Approve error:', error);
    }
  };

  const rejectCourse = async (courseId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'rejected',
          is_approved: false,
          rejection_reason: reason
        })
      });
      
      if (res.ok) {
        alert('Course rejected successfully');
        loadData();
      } else {
        alert('Failed to reject course');
      }
    } catch (error) {
      console.error('Reject error:', error);
    }
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center"
        minHeight="100vh"
        sx={{ bgcolor: '#fafafa' }}
      >
        <CircularProgress sx={{ color: 'primary.main', mb: 2 }} />
        <Typography>Loading admin dashboard...</Typography>
      </Box>
    );
  }

  const pendingCourses = courses.filter(c => !c.is_approved && c.status !== 'rejected');

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            mb: 4,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.200',
            bgcolor: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 6,
              background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  color: '#2c3e50',
                  mb: 0.5,
                }}
              >
                Admin Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                System administration and management
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={() => { 
                localStorage.removeItem('token'); 
                window.location.href = '/login'; 
              }}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: 1.5,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  bgcolor: 'error.50',
                },
              }}
            >
              Logout
            </Button>
          </Box>
        </Paper>

        {/* Navigation */}
        <Box sx={{ mb: 3 }}>
          <ToggleButtonGroup
            value={activeView}
            exclusive
            onChange={(e, newView) => newView && setActiveView(newView)}
            sx={{
              bgcolor: 'white',
              '& .MuiToggleButton-root': {
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.95rem',
                border: '1px solid',
                borderColor: 'grey.300',
                gap: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                },
              },
            }}
          >
            <ToggleButton value="dashboard">
              📊 Dashboard Overview
            </ToggleButton>
            <ToggleButton value="users">
              👥 User Management ({users.length})
            </ToggleButton>
            <ToggleButton value="courses">
              📚 Course Management ({courses.length})
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Dashboard Overview */}
        {activeView === 'dashboard' && (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    minHeight: 110,
                    maxWidth: 280,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      borderColor: '#1976d2',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2', mb: 0.5 }}>
                        {users.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Users
                      </Typography>
                    </Box>
                    <Box 
                      sx={{ 
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'primary.50',
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <PeopleIcon sx={{ fontSize: 24 }} />
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    minHeight: 110,
                    maxWidth: 280,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      borderColor: '#2e7d32',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#2e7d32', mb: 0.5 }}>
                        {courses.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Courses
                      </Typography>
                    </Box>
                    <Box 
                      sx={{ 
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'success.50',
                        color: 'success.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <SchoolIcon sx={{ fontSize: 24 }} />
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    minHeight: 110,
                    maxWidth: 280,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      borderColor: '#ed6c02',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#ed6c02', mb: 0.5 }}>
                        {pendingCourses.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pending Approval
                      </Typography>
                    </Box>
                    <Box 
                      sx={{ 
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'warning.50',
                        color: 'warning.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <PendingIcon sx={{ fontSize: 24 }} />
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {pendingCourses.length > 0 && (
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  bgcolor: 'white',
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    color: '#2c3e50',
                    mb: 3,
                    pb: 2,
                    borderBottom: '2px solid',
                    borderColor: 'grey.200',
                  }}
                >
                  Pending Course Approvals
                </Typography>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Instructor</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingCourses.map(course => (
                        <TableRow key={course.id}>
                          <TableCell>{course.id}</TableCell>
                          <TableCell>{course.title}</TableCell>
                          <TableCell>{course.instructor_name}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={() => approveCourse(course.id)}
                                sx={{ textTransform: 'none' }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                color="error"
                                onClick={() => rejectCourse(course.id)}
                                sx={{ textTransform: 'none' }}
                              >
                                Reject
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </>
        )}

        {/* User Management */}
        {activeView === 'users' && (
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200',
              bgcolor: 'white',
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                color: '#2c3e50',
                mb: 3,
                pb: 2,
                borderBottom: '2px solid',
                borderColor: 'grey.200',
              }}
            >
              User Management
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={user.role}
                          sx={{
                            fontWeight: 500,
                            borderRadius: 1.5,
                            bgcolor: {
                              admin: '#d1ecf1',
                              instructor: '#e2e3e5',
                              student: '#d6d8db',
                            }[user.role],
                            color: {
                              admin: '#0c5460',
                              instructor: '#383d41',
                              student: '#494d50',
                            }[user.role],
                          }}
                        />
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {user.role !== 'admin' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={() => deleteUser(user.id)}
                            sx={{ textTransform: 'none' }}
                          >
                            Delete
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Course Management */}
        {activeView === 'courses' && (
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200',
              bgcolor: 'white',
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                color: '#2c3e50',
                mb: 3,
                pb: 2,
                borderBottom: '2px solid',
                borderColor: 'grey.200',
              }}
            >
              Course Management
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Instructor</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {courses.map(course => (
                    <TableRow key={course.id}>
                      <TableCell>{course.id}</TableCell>
                      <TableCell>{course.title}</TableCell>
                      <TableCell>{course.instructor_name}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={course.status || (course.is_approved ? 'approved' : 'pending')}
                          sx={{
                            fontWeight: 500,
                            borderRadius: 1.5,
                            bgcolor: {
                              approved: '#d4edda',
                              pending: '#fff3cd',
                              rejected: '#f8d7da',
                            }[course.status || (course.is_approved ? 'approved' : 'pending')],
                            color: {
                              approved: '#155724',
                              pending: '#856404',
                              rejected: '#721c24',
                            }[course.status || (course.is_approved ? 'approved' : 'pending')],
                          }}
                        />
                      </TableCell>
                      <TableCell>{new Date(course.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {!course.is_approved && course.status !== 'rejected' && (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={() => approveCourse(course.id)}
                                sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                color="warning"
                                onClick={() => rejectCourse(course.id)}
                                sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={() => deleteCourse(course.id)}
                            sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default AdminDashboard;