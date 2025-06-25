// src/components/courses/edit/StudentsTab.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import enrollmentService from '../../../services/enrollmentService';

const StudentsTab = ({ courseId }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [page, setPage]         = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!courseId) return;
    const fetchStudents = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await enrollmentService.getCourseStudents(courseId);
        // الـ service يرجّع { message, students }
        setStudents(res.students || []);
      } catch (err) {
        setError('Unable to load students. Please try again.');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [courseId]);

  const filtered = students.filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      (s.student_name || '').toLowerCase().includes(q) ||
      (s.student_email|| '').toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Students ({filtered.length})
          </Typography>
          <TextField
            placeholder="Search students..."
            value={searchQuery}
            size="small"
            onChange={e => setSearchQuery(e.target.value)}
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        {!error && filtered.length === 0 && (
          <Alert severity="info">No students enrolled in this course yet.</Alert>
        )}

        {!error && filtered.length > 0 && (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell align="center">Progress</TableCell>
                    <TableCell>Enrolled Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((s, idx) => (
                      <TableRow key={s.student_id || idx} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {s.student_name?.charAt(0).toUpperCase() || '?'}
                            </Avatar>
                            <Typography>{s.student_name || 'Unknown'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{s.student_email || 'No email'}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              {s.progress ?? 0}%
                            </Typography>
                            <Box sx={{ width: 100, height: 8, bgcolor: 'grey.200', borderRadius: 4 }}>
                              <Box
                                sx={{
                                  width: `${s.progress ?? 0}%`,
                                  height: '100%',
                                  bgcolor: 'primary.main',
                                  borderRadius: 4,
                                }}
                              />
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {s.enrolled_at
                            ? new Date(s.enrolled_at).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              count={filtered.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={e => {
                setRowsPerPage(+e.target.value);
                setPage(0);
              }}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default StudentsTab;
