// src/components/dashboard/StudentDashboard.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  LinearProgress,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  Assignment as AssignmentIcon,
  ArrowForward as ArrowForwardIcon,
  MenuBook as MenuBookIcon,
} from '@mui/icons-material';
import enrollmentService from '../../services/enrollmentService';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading]     = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [error, setError]         = useState('');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const data = await enrollmentService.getMyEnrollments();
      // API returns { data: [...] } or [...] ?
      // adjust if needed: data.data vs data
      const list = Array.isArray(data) ? data : data.data || [];
      setEnrollments(list);
    } catch (err) {
      console.error('Error fetching enrollments:', err);
      setError('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueCourse = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        sx={{ bgcolor: '#fafafa' }}
      >
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  // حساب الإحصائيات من enrollments
  const enrolledCount    = enrollments.length;
  const completedCount   = enrollments.filter(e => (e.progress || 0) >= 100).length;
  const avgProgressValue = enrolledCount > 0
    ? Math.round(
        enrollments.reduce((sum, e) => sum + (e.progress || 0), 0)
        / enrolledCount
      )
    : 0;
  const totalAssignments = enrollments.reduce(
    (sum, e) => sum + (e.assignments?.length || 0),
    0
  );

  const stats = [
    {
      icon: <SchoolIcon sx={{ fontSize: 24 }} />,
      title: 'Enrolled Courses',
      value: enrolledCount,
      color: '#1976d2',
      bgColor: 'primary.50',
    },
    {
      icon: <CheckCircleIcon sx={{ fontSize: 24 }} />,
      title: 'Completed Courses',
      value: completedCount,
      color: '#2e7d32',
      bgColor: 'success.50',
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 24 }} />,
      title: 'Average Progress',
      value: `${avgProgressValue}%`,
      color: '#ed6c02',
      bgColor: 'warning.50',
    },
    {
      icon: <AssignmentIcon sx={{ fontSize: 24 }} />,
      title: 'Total Assignments',
      value: totalAssignments,
      color: '#0288d1',
      bgColor: 'info.50',
    },
  ];

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#2c3e50', mb: 1 }}>
            Student Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your learning progress and manage your courses
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: 'error.50', border: '1px solid', borderColor: 'error.200' }}>
            {error}
          </Alert>
        )}

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {stats.map((stat, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Paper
                elevation={0}
                sx={{
                  p: 3, height: '100%', minHeight: 110, maxWidth: 280,
                  border: '1px solid', borderColor: 'grey.200', borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    borderColor: stat.color,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color, mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: stat.bgColor, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {stat.icon}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* My Courses */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50', mb: 0.5 }}>
            My Courses
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Continue where you left off
          </Typography>
        </Box>

        {enrollments.length === 0 ? (
          <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: '2px dashed', borderColor: 'grey.300', borderRadius: 2, bgcolor: 'white' }}>
            <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: 'primary.50', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
              <MenuBookIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              You haven't enrolled in any courses yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Start your learning journey today!
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/courses')}
              startIcon={<SchoolIcon />}
              sx={{
                px: 4, py: 1.5, borderRadius: 2, textTransform: 'none', fontSize: '1rem', fontWeight: 600,
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                boxShadow: '0 3px 10px rgba(25, 118, 210, 0.3)',
                '&:hover': { boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)' },
              }}
            >
              Browse Courses
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {enrollments.map((enrollment) => (
              <Grid item xs={12} md={6} lg={4} key={enrollment.enrollment_id || enrollment.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%', display: 'flex', flexDirection: 'column',
                    border: '1px solid', borderColor: 'grey.200', borderRadius: 2,
                    overflow: 'hidden', transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: 6,
                      background: (enrollment.progress || 0) >= 100
                        ? 'linear-gradient(90deg, #2e7d32 0%, #66bb6a 100%)'
                        : 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                    }}
                  />
                  <CardContent sx={{ flex: 1, p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      {(enrollment.progress || 0) >= 100 && (
                        <Chip
                          label="Completed"
                          color="success"
                          size="small"
                          icon={<CheckCircleIcon />}
                          sx={{ mb: 2, fontWeight: 500, borderRadius: 1 }}
                        />
                      )}
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                          fontWeight: 600, lineHeight: 1.3,
                          overflow: 'hidden', textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {enrollment.course_title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        By {enrollment.instructor_name}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: (enrollment.progress || 0) >= 100 ? 'success.main' : 'primary.main',
                          }}
                        >
                          {enrollment.progress || 0}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={enrollment.progress || 0}
                        sx={{
                          height: 6, borderRadius: 3, bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            background: (enrollment.progress || 0) >= 100
                              ? 'linear-gradient(90deg, #2e7d32 0%, #66bb6a 100%)'
                              : 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                          },
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleContinueCourse(enrollment.course_id)}
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        py: 1, borderRadius: 1.5, textTransform: 'none', fontWeight: 600,
                        background: (enrollment.progress || 0) >= 100
                          ? 'linear-gradient(45deg, #2e7d32 30%, #66bb6a 90%)'
                          : 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                        boxShadow: (enrollment.progress || 0) >= 100
                          ? '0 2px 8px rgba(46, 125, 50, 0.25)'
                          : '0 2px 8px rgba(25, 118, 210, 0.25)',
                        '&:hover': {
                          boxShadow: (enrollment.progress || 0) >= 100
                            ? '0 4px 16px rgba(46, 125, 50, 0.35)'
                            : '0 4px 16px rgba(25, 118, 210, 0.35)',
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      {(enrollment.progress || 0) >= 100 ? 'Review Course' : 'Continue Learning'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default StudentDashboard;
