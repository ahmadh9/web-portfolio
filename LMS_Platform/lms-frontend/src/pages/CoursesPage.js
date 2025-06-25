import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import courseService from '../services/courseService';
import CourseCard from '../components/courses/CourseCard';

const CoursesPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    (async () => {
      try {
        const response = await courseService.getAllCourses();
        let data = response.courses || [];
        data = data.filter(c => c.is_approved);
        if (sortBy === 'newest') {
          data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else {
          data.sort((a, b) => a.title.localeCompare(b.title));
        }
        setCourses(data);
      } catch {
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    })();
  }, [sortBy]);

  const handleSearch = e => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handlePageChange = (_, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.instructor_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        All Courses
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* بحث وترتيب */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search courses..."
          variant="outlined"
          value={searchQuery}
          onChange={handleSearch}
          sx={{ flexGrow: 1, minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy} onChange={e => setSortBy(e.target.value)} label="Sort By">
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="title">Title</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* شبكة الدورات */}
      {paginated.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No courses found
          </Typography>
        </Box>
      ) : (
        <>
          <Grid
            container
            spacing={3}
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 3,
              gridAutoRows: '1fr',
            }}
          >
            {paginated.map(course => (
              <Box key={course.id} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ width: '100%', maxWidth: 380 }}>
                  <CourseCard
                    course={course}
                    onClick={() => navigate(`/courses/${course.id}`)}
                  />
                </Box>
              </Box>
            ))}
          </Grid>

          {/* ترقيم الصفحات */}
          {totalPages > 1 && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                size="large"
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default CoursesPage;
