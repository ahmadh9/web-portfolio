import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container, Typography, Paper, Box, CircularProgress, Alert,
  Tabs, Tab, Card, CardContent, Chip, Stack, Button, Grid,
  LinearProgress, IconButton
} from '@mui/material';
import {
  VideoLibrary as VideoIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import courseService from '../services/courseService';
import enrollmentService from '../services/enrollmentService';
import api from '../services/api';
import quizService from '../services/quizService';

const CourseDetailsPage = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    if (location.state?.updatedQuiz) {
      const { lessonId, score } = location.state.updatedQuiz;
      setQuizzes(prev =>
        prev.map(q =>
          q.lesson_id === lessonId ? { ...q, score } : q
        )
      );
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, location.pathname]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { course: c } = await courseService.getCourseById(courseId);
      setCourse(c);

      if (user?.role === 'student') {
        const enrolled = await enrollmentService.checkEnrollment(courseId);
        setIsEnrolled(enrolled);

        if (enrolled) {
          setLessons((c.modules || []).flatMap(m => m.lessons || []));

          // Load assignments + submissions
          const aRes = await api.get(`/assignments/course/${courseId}`);
          const assignmentsWithSubmissions = await Promise.all(
            (aRes.data.assignments || []).map(async a => {
              try {
                const subRes = await api.get(`/assignments/lesson/${a.lesson_id}`);
                return {
                  ...a,
                  submission: subRes.data.submission || null,
                };
              } catch (err) {
                return { ...a, submission: null };
              }
            })
          );
          setAssignments(assignmentsWithSubmissions);

          const qRes = await quizService.getCourseQuizzes(courseId);
          setQuizzes(qRes || []);
        }
      }

      setLoading(false);
    };
    load();
  }, [courseId, user]);

  if (loading) return (
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
  
  if (!course) return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Alert 
        severity="error"
        sx={{ 
          borderRadius: 2,
          bgcolor: 'error.50',
          border: '1px solid',
          borderColor: 'error.200',
        }}
      >
        Course not found
      </Alert>
    </Container>
  );

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Course Header */}
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
          <Typography 
            variant="h4" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              color: '#2c3e50',
              mb: 2,
            }}
          >
            {course.title}
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ mb: 3, lineHeight: 1.6 }}
          >
            {course.description}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Instructor: {course.instructor_name || 'Not specified'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Duration: {course.duration || '4 weeks'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {lessons.length} Lessons
              </Typography>
            </Box>
          </Box>
        </Paper>

        {isEnrolled ? (
          <>
            <Paper
              elevation={0}
              sx={{
                mb: 3,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200',
                bgcolor: 'white',
                overflow: 'hidden',
              }}
            >
              <Tabs
                value={tabIndex}
                onChange={(_, i) => setTabIndex(i)}
                variant="fullWidth"
                sx={{
                  '& .MuiTab-root': {
                    py: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 500,
                    '&.Mui-selected': {
                      fontWeight: 600,
                    },
                  },
                  '& .MuiTabs-indicator': {
                    height: 3,
                  },
                }}
              >
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VideoIcon />
                      Lessons ({lessons.length})
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AssignmentIcon />
                      Assignments ({assignments.length})
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <QuizIcon />
                      Quizzes ({quizzes.length})
                    </Box>
                  } 
                />
              </Tabs>
            </Paper>

            {/* LESSONS */}
            {tabIndex === 0 && (
              <Grid container spacing={3}>
                {lessons.map(les => (
                  <Grid item xs={12} sm={6} md={4} key={les.id}>
                    <Card
                      elevation={0}
                      sx={{
                        height: '100%',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.200',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        '&:hover': { 
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                          borderColor: 'primary.main',
                        }
                      }}
                      onClick={() => navigate(`/courses/${courseId}/lessons/${les.id}`)}
                    >
                      <Box
                        sx={{
                          height: 6,
                          background: les.completed 
                            ? 'linear-gradient(90deg, #2e7d32 0%, #66bb6a 100%)'
                            : 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                        }}
                      />
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                          <Box 
                            sx={{ 
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: {
                                video: 'primary.50',
                                quiz: 'secondary.50',
                                text: 'grey.100'
                              }[les.content_type] || 'grey.100',
                              color: {
                                video: 'primary.main',
                                quiz: 'secondary.main',
                                text: 'text.secondary'
                              }[les.content_type] || 'text.secondary',
                            }}
                          >
                            {{
                              video: <VideoIcon />,
                              quiz: <QuizIcon />,
                              text: <DescriptionIcon />
                            }[les.content_type] || <DescriptionIcon />}
                          </Box>
                          {les.completed && (
                            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                          )}
                        </Stack>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            mb: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {les.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {les.content_type === 'video' ? 'Video Lesson'
                            : les.content_type === 'text' ? 'Text Lesson'
                            : 'Lesson'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                {lessons.length === 0 && (
                  <Grid item xs={12}>
                    <Paper 
                      sx={{ 
                        p: 4, 
                        textAlign: 'center',
                        border: '2px dashed',
                        borderColor: 'grey.300',
                        borderRadius: 2,
                        bgcolor: 'white',
                      }}
                    >
                      <Typography color="text.secondary">No lessons available yet.</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            )}

            {/* ASSIGNMENTS */}
            {tabIndex === 1 && (
              <Grid container spacing={3}>
                {assignments.length > 0 ? assignments.map(a => (
                  <Grid item xs={12} sm={6} md={4} key={a.assignment_id}>
                    <Card
                      elevation={0}
                      sx={{
                        height: '100%',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.200',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        '&:hover': { 
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                          borderColor: 'warning.main',
                        }
                      }}
                      onClick={() => navigate(`/courses/${courseId}/lesson/${a.lesson_id}/assignment`)}
                    >
                      <Box
                        sx={{
                          height: 6,
                          background: a.submission?.grade != null
                            ? 'linear-gradient(90deg, #2e7d32 0%, #66bb6a 100%)'
                            : a.submission
                              ? 'linear-gradient(90deg, #ed6c02 0%, #ff9800 100%)'
                              : 'linear-gradient(90deg, #757575 0%, #9e9e9e 100%)',
                        }}
                      />
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                          <Box 
                            sx={{ 
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: 'warning.50',
                              color: 'warning.main',
                            }}
                          >
                            <AssignmentIcon />
                          </Box>
                        </Stack>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            mb: 2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {a.assignment_title}
                        </Typography>

                        {a.submission ? (
                          a.submission.grade != null ? (
                            <Chip
                              icon={<CheckCircleIcon />}
                              label={`Graded: ${a.submission.grade}/100`}
                              color="success"
                              size="small"
                              sx={{ 
                                fontWeight: 500,
                                borderRadius: 1,
                              }}
                            />
                          ) : (
                            <Chip
                              icon={<ScheduleIcon />}
                              label="Submitted - Pending review"
                              color="warning"
                              size="small"
                              sx={{ 
                                fontWeight: 500,
                                borderRadius: 1,
                              }}
                            />
                          )
                        ) : (
                          <Chip
                            label="Not submitted"
                            color="default"
                            size="small"
                            sx={{ 
                              fontWeight: 500,
                              borderRadius: 1,
                            }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                )) : (
                  <Grid item xs={12}>
                    <Paper 
                      sx={{ 
                        p: 4, 
                        textAlign: 'center',
                        border: '2px dashed',
                        borderColor: 'grey.300',
                        borderRadius: 2,
                        bgcolor: 'white',
                      }}
                    >
                      <Typography color="text.secondary">No assignments available yet.</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            )}

            {/* QUIZZES */}
            {tabIndex === 2 && (
              <Grid container spacing={3}>
                {quizzes.length > 0 ? quizzes.map(q => (
                  <Grid item xs={12} sm={6} md={4} key={q.lesson_id}>
                    <Card
                      elevation={0}
                      sx={{
                        height: '100%',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.200',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        '&:hover': { 
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                          borderColor: 'success.main',
                        }
                      }}
                      onClick={() => navigate(`/courses/${courseId}/lesson/${q.lesson_id}/quiz`)}
                    >
                      <Box
                        sx={{
                          height: 6,
                          background: q.score != null 
                            ? 'linear-gradient(90deg, #2e7d32 0%, #66bb6a 100%)'
                            : 'linear-gradient(90deg, #9c27b0 0%, #ba68c8 100%)',
                        }}
                      />
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                          <Box 
                            sx={{ 
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: 'secondary.50',
                              color: 'secondary.main',
                            }}
                          >
                            <QuizIcon />
                          </Box>
                          {q.score != null && (
                            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                          )}
                        </Stack>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            mb: 2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {q.lesson_title}
                        </Typography>
                        
                        {q.score != null ? (
                          <Box>
                            <Chip
                              icon={<CheckCircleIcon />}
                              label={`Completed: ${q.score}%`}
                              color="success"
                              size="small"
                              sx={{ 
                                fontWeight: 500,
                                borderRadius: 1,
                                mb: 1,
                              }}
                            />
                            <LinearProgress
                              variant="determinate"
                              value={q.score}
                              sx={{ 
                                height: 6, 
                                borderRadius: 3,
                                bgcolor: 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 3,
                                  background: q.score >= 80
                                    ? 'linear-gradient(90deg, #2e7d32 0%, #66bb6a 100%)'
                                    : q.score >= 60
                                      ? 'linear-gradient(90deg, #ed6c02 0%, #ff9800 100%)'
                                      : 'linear-gradient(90deg, #d32f2f 0%, #f44336 100%)',
                                },
                              }}
                            />
                          </Box>
                        ) : (
                          <Chip
                            label="Not taken yet"
                            color="default"
                            size="small"
                            sx={{ 
                              fontWeight: 500,
                              borderRadius: 1,
                            }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                )) : (
                  <Grid item xs={12}>
                    <Paper 
                      sx={{ 
                        p: 4, 
                        textAlign: 'center',
                        border: '2px dashed',
                        borderColor: 'grey.300',
                        borderRadius: 2,
                        bgcolor: 'white',
                      }}
                    >
                      <Typography color="text.secondary">No quizzes available yet.</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            )}
          </>
        ) : (
          <Paper 
            elevation={0}
            sx={{ 
              py: 8, 
              textAlign: 'center',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200',
              bgcolor: 'white',
            }}
          >
            <Box 
              sx={{ 
                width: 100,
                height: 100,
                borderRadius: '50%',
                bgcolor: 'primary.50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <SchoolIcon sx={{ fontSize: 50, color: 'primary.main' }} />
            </Box>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 2,
                fontWeight: 600,
                color: '#2c3e50',
              }}
            >
              Ready to Start Learning?
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ mb: 4 }}
            >
              Enroll now to access all lessons, assignments, and quizzes!
            </Typography>
            <Button 
              variant="contained" 
              size="large" 
              onClick={async () => {
                try {
                  await enrollmentService.enrollInCourse(courseId);
                  setIsEnrolled(true);
                  // Reload course data after enrollment
                  window.location.reload();
                } catch (error) {
                  console.error('Enrollment failed:', error);
                }
              }}
              startIcon={<SchoolIcon />}
              sx={{
                px: 5,
                py: 1.75,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                boxShadow: '0 3px 10px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                },
              }}
            >
              Enroll Now
            </Button>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default CourseDetailsPage;