// src/components/courses/CourseCard.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const handleViewCourse = () => navigate(`/courses/${course.id}`);

  const thumbnailUrl = course.thumbnail
    ? `${process.env.REACT_APP_API_URL.replace('/api','')}${course.thumbnail}`
    : 'https://via.placeholder.com/640x360?text=Course';

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* 
        اجعل الخلفية تحافظ على النسبة 16:9، 
        تظهر كامل الصورة (contain) رأسياً من الأعلى،
        مع تكرار ممنوع وخلفية رمادية للفراغات 
      */}
      <Box
        sx={{
          width: '100%',
          aspectRatio: '16/9',
          backgroundImage: `url(${thumbnailUrl})`,
          backgroundSize: 'contain',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#f5f5f5',
        }}
      />

      <CardContent
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Typography variant="h6" noWrap gutterBottom>
          {course.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 2,
          }}
        >
          {course.description}
        </Typography>

        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <PersonIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary" noWrap>
              {course.instructor_name}
            </Typography>
          </Box>

          {course.category_name && (
            <Chip
              label={course.category_name}
              size="small"
              variant="outlined"
              icon={<SchoolIcon />}
              sx={{ mb: 1 }}
            />
          )}

          {typeof course.students_count === 'number' && (
            <Typography variant="body2" color="text.secondary">
              {course.students_count} students
            </Typography>
          )}
        </Box>
      </CardContent>

      <CardActions>
        <Button fullWidth variant="contained" onClick={handleViewCourse}>
          View Course
        </Button>
      </CardActions>
    </Card>
  );
};

export default CourseCard;
