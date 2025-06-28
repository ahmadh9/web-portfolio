// src/pages/LessonPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Button,
  Paper,
  Divider
} from '@mui/material';
import {
  VideoLibrary as VideoIcon,
  Description as DescriptionIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  PlayCircle as PlayCircleIcon,
} from '@mui/icons-material';
import api from '../services/api';
import progressService from '../services/progressService';

const LessonPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [moduleLessons, setModuleLessons] = useState([]);
  const [nextLessonId, setNextLessonId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/lessons/${lessonId}`);
        const { lesson, moduleLessons, nextLessonId } = res.data;
        setLesson(lesson);
        setModuleLessons(moduleLessons);
        setNextLessonId(nextLessonId);
        const current = moduleLessons.find(l => l.id === lesson.id);
        setCompleted(Boolean(current?.completed));
      } catch (err) {
        console.error(err);
        setError('Failed to load lesson');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [lessonId]);

  const handleMarkAsDone = async () => {
    try {
      await progressService.markLessonAsDone(lessonId);
      setCompleted(true);
      setModuleLessons(prev =>
        prev.map(l => l.id === lesson.id ? { ...l, completed: true } : l)
      );
    } catch {}
  };

  const handleNavigateTo = (id) => {
    if (lesson?.course_id) {
      navigate(`/courses/${lesson.course_id}/lessons/${id}`);
    }
  };

  const handleNext = () => {
    if (nextLessonId && lesson?.course_id) {
      navigate(`/courses/${lesson.course_id}/lessons/${nextLessonId}`);
    }
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

  if (error || !lesson) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error || 'Lesson not found'}
        </Alert>
      </Container>
    );
  }

  const { title, content_type, content_url, content_text } = lesson;
  const videoSrc = content_url
    ? (content_url.startsWith('http') ? content_url : `http://localhost:5000${content_url}`)
    : null;

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>

          {/* Sidebar */}
          <Paper
            elevation={0}
            sx={{
              width: { xs: '100%', md: 260 },
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200',
              bgcolor: 'white',
              height: 'fit-content',
              position: { md: 'sticky' },
              top: { md: 80 }
            }}
          >
            <Typography variant="h6" fontWeight={600} sx={{ px: 1, pb: 1 }}>
              Module Lessons
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            <Box display="flex" flexDirection="column" gap={0.5}>
              {moduleLessons.map(l => {
                const isActive = l.id === lesson.id;
                return (
                  <Button
                    key={l.id}
                    fullWidth
                    variant="text"
                    onClick={() => handleNavigateTo(l.id)}
                    startIcon={
                      isActive
                        ? <PlayCircleIcon color="primary" />
                        : l.completed
                          ? <CheckCircleIcon color="success" />
                          : <VideoIcon color="action" />
                    }
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      py: 1,
                      px: 1.5,
                      borderRadius: 1.5,
                      fontSize: '0.85rem',
                      color: isActive ? 'primary.main' : 'text.primary',
                      bgcolor: isActive ? 'primary.50' : 'transparent',
                      fontWeight: isActive ? 700 : 400,
                      '&:hover': {
                        bgcolor: isActive ? 'primary.50' : 'grey.100'
                      },
                    }}
                  >
                    <Box
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        width: '100%',
                        textAlign: 'left'
                      }}
                    >
                      {l.title}
                    </Box>
                  </Button>
                );
              })}
            </Box>
          </Paper>

          {/* Main Content */}
          <Box flex={1}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200',
                bgcolor: 'white'
              }}
            >
              <Box
                sx={{
                  height: 6,
                  background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)'
                }}
              />
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: content_type === 'video' ? 'primary.50' : 'grey.100',
                      color: content_type === 'video' ? 'primary.main' : 'text.secondary'
                    }}
                  >
                    {content_type === 'video'
                      ? <VideoIcon sx={{ fontSize: 28 }} />
                      : <DescriptionIcon sx={{ fontSize: 28 }} />
                    }
                  </Box>
                  <Box flex={1}>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: '#2c3e50', mb: 0.5 }}
                    >
                      {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {content_type === 'video' ? 'Video Lesson' : 'Text Lesson'}
                    </Typography>
                  </Box>
                  {completed && (
                    <Typography
                      variant="body2"
                      color="success.main"
                      fontWeight={500}
                      display="flex"
                      alignItems="center"
                      gap={1}
                    >
                      <CheckCircleIcon fontSize="small" /> Lesson completed
                    </Typography>
                  )}
                </Box>

                {content_type === 'video' && videoSrc && (
                  <Box
                    sx={{
                      my: 3,
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      bgcolor: '#000'
                    }}
                  >
                    <video
                      src={videoSrc}
                      controls
                      style={{ width: '100%', display: 'block', maxHeight: '500px' }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </Box>
                )}

                {content_type === 'text' && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      mt: 3,
                      bgcolor: 'grey.50',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'grey.200'
                    }}
                  >
                    <Typography
                      component="div"
                      dangerouslySetInnerHTML={{ __html: content_text }}
                      sx={{
                        fontSize: '1.1rem',
                        lineHeight: 1.8,
                        color: 'text.primary',
                        '& p': { mb: 2 },
                        '& h1, & h2, & h3': { fontWeight: 600, color: '#2c3e50', mt: 3, mb: 2 },
                        '& ul, & ol': { pl: 3, mb: 2 },
                        '& li': { mb: 1 }
                      }}
                    />
                  </Paper>
                )}

                <Divider sx={{ my: 4 }} />

                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  flexWrap="wrap"
                  gap={2}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    {!completed ? (
                      <Button
                        variant="contained"
                        size="large"
                        onClick={handleMarkAsDone}
                        startIcon={<CheckCircleIcon />}
                        sx={{
                          px: 4,
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          background: 'linear-gradient(45deg, #2e7d32 30%, #66bb6a 90%)',
                          boxShadow: '0 3px 10px rgba(46, 125, 50, 0.3)',
                          '&:hover': { boxShadow: '0 6px 20px rgba(46, 125, 50, 0.4)' }
                        }}
                      >
                        Mark as Complete
                      </Button>
                    ) : (
                      <Typography
                        variant="body1"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          color: 'success.main',
                          fontWeight: 500
                        }}
                      >
                        <CheckCircleIcon /> Lesson Completed
                      </Typography>
                    )}
                  </Box>

                  {nextLessonId && (
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={handleNext}
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        borderWidth: 2,
                        borderColor: 'primary.main',
                        '&:hover': { borderWidth: 2, bgcolor: 'primary.50' }
                      }}
                    >
                      Next Lesson
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LessonPage;
