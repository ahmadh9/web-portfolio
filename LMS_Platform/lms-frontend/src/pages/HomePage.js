// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  Chip,
  useTheme,
  useMediaQuery,
  Skeleton,
} from '@mui/material';
import {
  School as SchoolIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
  AccessTime as AccessTimeIcon,
  MenuBook as MenuBookIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import courseService from '../services/courseService';

// Course Card Component - تصميم نظيف بدون صور
const MinimalCourseCard = ({ course, onClick }) => {
  return (
    <Card
      sx={{
        width: '100%',
        minWidth: 300,
        maxWidth: '100%',
        height: 320, // ارتفاع ثابت لجميع الكروت
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        border: '1px solid',
        borderColor: 'grey.200',
        boxShadow: 'none',
        borderRadius: 2,
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          borderColor: 'primary.main',
        },
        cursor: 'pointer',
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          height: 8,
          background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
        }}
      />
      <CardContent 
        sx={{ 
          flex: 1, 
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100% - 8px)', // احسب الارتفاع بدون الشريط العلوي
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Chip
            label={course.category || 'General'}
            size="small"
            sx={{
              bgcolor: 'primary.50',
              color: 'primary.main',
              fontWeight: 500,
              fontSize: '0.75rem',
            }}
          />
        </Box>
        
        <Typography
          variant="h6"
          component="h3"
          gutterBottom
          sx={{
            fontWeight: 600,
            lineHeight: 1.3,
            mb: 1,
            height: 56, // ارتفاع ثابت للعنوان
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {course.title}
        </Typography>
        
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            height: 72, // ارتفاع ثابت للوصف
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.6,
          }}
        >
          {course.description || 'No description available'}
        </Typography>
        
        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {course.duration || '4 weeks'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <MenuBookIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {course.lessons_count || 0} lessons
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            By {course.instructor_name || 'Expert Instructor'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated } = useAuth();
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedCourses();
  }, []);

  const fetchFeaturedCourses = async () => {
    try {
      const response = await courseService.getAllCourses();
      // Get the latest 3 published courses as featured
      const featured = response.courses
        .filter(course => 
          course.is_published === true || 
          course.is_published === 't' || 
          course.is_published === 1 ||
          course.is_published === '1'
        )
        .slice(0, 3);
      setFeaturedCourses(featured);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <SchoolIcon sx={{ fontSize: 32 }} />,
      title: 'Quality Courses',
      description: 'Access high-quality courses taught by expert instructors',
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 32 }} />,
      title: 'Expert Instructors',
      description: 'Learn from industry professionals and experienced educators',
    },
    {
      icon: <AssignmentIcon sx={{ fontSize: 32 }} />,
      title: 'Interactive Learning',
      description: 'Engage with assignments, quizzes, and practical exercises',
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
      title: 'Track Progress',
      description: 'Monitor your learning progress and achieve your goals',
    },
  ];

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh' }}>
      {/* Hero Section - تصميم نظيف */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          py: { xs: 8, md: 12 },
          position: 'relative',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8} mx="auto">
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant={isMobile ? 'h3' : 'h2'}
                  component="h1"
                  gutterBottom
                  sx={{ 
                    fontWeight: 700,
                    color: '#2c3e50',
                    mb: 2,
                  }}
                >
                  Welcome to LMS Platform
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 4, 
                    color: '#5a6c7d',
                    fontWeight: 400,
                    maxWidth: 600,
                    mx: 'auto',
                  }}
                >
                  Unlock your potential with our comprehensive online learning platform.
                  Learn at your own pace, anywhere, anytime.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {isAuthenticated ? (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/dashboard')}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                        boxShadow: '0 3px 10px rgba(25, 118, 210, 0.3)',
                        '&:hover': {
                          boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                        },
                      }}
                    >
                      Go to Dashboard
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/register')}
                        sx={{
                          px: 4,
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: '1rem',
                          fontWeight: 600,
                          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                          boxShadow: '0 3px 10px rgba(25, 118, 210, 0.3)',
                          '&:hover': {
                            boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                          },
                        }}
                      >
                        Get Started
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate('/login')}
                        sx={{
                          px: 4,
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: '1rem',
                          fontWeight: 600,
                          borderColor: '#5a6c7d',
                          color: '#2c3e50',
                          borderWidth: 2,
                          '&:hover': {
                            borderColor: '#2c3e50',
                            borderWidth: 2,
                            bgcolor: 'rgba(0, 0, 0, 0.04)',
                          },
                        }}
                      >
                        Sign In
                      </Button>
                    </>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section - تصميم بسيط */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h4" 
          component="h2" 
          align="center" 
          gutterBottom
          sx={{ fontWeight: 600, color: '#2c3e50' }}
        >
          Why Choose Our Platform?
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          Discover the benefits of learning with us
        </Typography>
        <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ width: '100%', maxWidth: 280 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: 220, // ارتفاع ثابت لكروت المميزات
                    width: '100%',
                    textAlign: 'center',
                    border: '1px solid',
                    borderColor: 'grey.200',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    },
                  }}
                >
                  <Box 
                    sx={{ 
                      color: 'primary.main', 
                      mb: 2,
                      p: 2,
                      borderRadius: '50%',
                      bgcolor: 'primary.50',
                      width: 64,
                      height: 64,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Courses Section - تصميم نظيف للكورسات */}
      <Box sx={{ bgcolor: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h4" 
            component="h2" 
            align="center" 
            gutterBottom
            sx={{ fontWeight: 600, color: '#2c3e50' }}
          >
            Featured Courses
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ mb: 6 }}
          >
            Start learning with our most popular courses
          </Typography>
          
          {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3].map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item}>
                  <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
          ) : featuredCourses.length > 0 ? (
            <>
              <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
                {featuredCourses.map((course) => (
                  <Grid item xs={12} sm={6} md={4} key={course.id} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ width: '100%', maxWidth: 380 }}>
                      <MinimalCourseCard 
                        course={course} 
                        onClick={() => navigate(`/courses/${course.id}`)}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ textAlign: 'center', mt: 6 }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/courses')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                    boxShadow: '0 3px 10px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                    },
                  }}
                >
                  View All Courses
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography color="text.secondary">
                No courses available at the moment
              </Typography>
            </Box>
          )}
        </Container>
      </Box>

      {/* CTA Section - تصميم بسيط */}
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Card
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: { xs: 4, md: 6 },
            textAlign: 'center',
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Ready to Start Learning?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of students who are already learning on our platform
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate(isAuthenticated ? '/courses' : '/register')}
            sx={{
              px: 5,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              bgcolor: 'white',
              color: '#667eea',
              '&:hover': {
                bgcolor: 'grey.100',
              },
            }}
          >
            {isAuthenticated ? 'Browse Courses' : 'Join Now'}
          </Button>
        </Card>
      </Container>
    </Box>
  );
};

export default HomePage;