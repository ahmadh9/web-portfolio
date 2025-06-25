import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Paper, Typography, Box, Tabs, Tab,
  Button, CircularProgress, Alert
} from '@mui/material';
import {
  Info as InfoIcon,
  LibraryBooks as ModulesIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  People as PeopleIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import courseService from '../services/courseService';
import CourseInfoTab from '../components/courses/edit/CourseInfoTab';
import ModulesTab     from '../components/courses/edit/ModulesTab';
import AssignmentsTab from '../components/courses/edit/AssignmentsTab';
import QuizzesTab     from '../components/courses/edit/QuizzesTab';
import StudentsTab    from '../components/courses/edit/StudentsTab';

const EditCoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState('');

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourseById(id);
      setCourse(response.course);
    } catch (err) {
      console.error(err);
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchCourse(); }, [fetchCourse]);

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress/></Box>;
  }
  if (error || !course) {
    return <Container sx={{ mt:4 }}><Alert severity="error">{error||'Course not found'}</Alert></Container>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt:4, mb:4 }}>
      <Box sx={{ display:'flex', alignItems:'center', mb:3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')} sx={{ mr:2 }}>
          Back to Dashboard
        </Button>
        <Typography variant="h4" sx={{ flexGrow:1 }}>Edit Course: {course.title}</Typography>
      </Box>
      <Paper sx={{ width:'100%' }}>
        <Tabs
          value={activeTab}
          onChange={(e,v) => setActiveTab(v)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<InfoIcon/>}       label="Course Info" />
          <Tab icon={<ModulesIcon/>}    label="Modules & Lessons" />
          <Tab icon={<AssignmentIcon/>} label="Assignments" />
          <Tab icon={<QuizIcon/>}       label="Quizzes" />
          <Tab icon={<PeopleIcon/>}     label="Students" />
        </Tabs>
        <Box sx={{ p:3 }}>
          {activeTab===0 && <CourseInfoTab course={course} onUpdate={fetchCourse}/>}
          {activeTab===1 && <ModulesTab   course={course} onUpdate={fetchCourse}/>}
          {activeTab===2 && <AssignmentsTab course={course}/>}
          {activeTab===3 && <QuizzesTab  course={course}/>}
          {activeTab===4 && <StudentsTab courseId={course.id}/>}
        </Box>
      </Paper>
    </Container>
  );
};

export default EditCoursePage;
