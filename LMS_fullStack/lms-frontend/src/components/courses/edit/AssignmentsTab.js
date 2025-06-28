import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import api from '../../../services/api';
import { toast } from 'react-toastify';

const AssignmentsTab = ({ course }) => {
  const [modules, setModules] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);

  // Grade Dialog states
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeValue, setGradeValue] = useState('');
  const [feedbackValue, setFeedbackValue] = useState('');

  const [assignmentDialog, setAssignmentDialog] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    deadlineDate: '',
    deadlineTime: '',
  });

  const [submissionsDialog, setSubmissionsDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const fetchModulesAndAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const modulesRes = await api.get(`/modules/course/${course.id}`);
      const modulesData = modulesRes.data.modules || [];
      const newAssignments = {};

      for (const module of modulesData) {
        const lessonsRes = await api.get(`/lessons/module/${module.id}`);
        module.lessons = lessonsRes.data.lessons || [];

        for (const lesson of module.lessons) {
          const res = await api.get(
            `/assignments/lesson/${lesson.id}`,
            { validateStatus: status => status < 500 }
          );
          if (res.status === 200 && res.data.assignment) {
            newAssignments[lesson.id] = res.data.assignment;
          }
        }
      }

      setModules(modulesData);
      setAssignments(newAssignments);
    } catch (err) {
      console.error('Error loading assignments tab:', err);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, [course.id]);

  useEffect(() => {
    fetchModulesAndAssignments();
  }, [fetchModulesAndAssignments]);

  const handleCreateAssignment = lesson => {
    setSelectedLesson(lesson);
    setFormData({
      title: '',
      description: '',
      deadline: '',
      deadlineDate: '',
      deadlineTime: '',
    });
    setAssignmentDialog(true);
  };

  const handleSaveAssignment = async () => {
    if (!formData.title || !formData.description) {
      toast.error('Title and description are required');
      return;
    }

    let deadline = null;
    if (formData.deadlineDate) {
      if (formData.deadlineTime) {
        deadline = `${formData.deadlineDate}T${formData.deadlineTime}:00`;
      } else {
        deadline = `${formData.deadlineDate}T23:59:00`;
      }
    }

    try {
      await api.post(
        `/assignments/lesson/${selectedLesson.id}`,
        {
          title: formData.title,
          description: formData.description,
          deadline: deadline,
        },
        { withCredentials: true }
      );
      toast.success('Assignment created');
      setAssignmentDialog(false);
      fetchModulesAndAssignments();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create assignment');
    }
  };

  const handleDeleteAssignment = async lessonId => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      const assignment = assignments[lessonId];
      await api.delete(
        `/assignments/${assignment.id}`,
        { withCredentials: true }
      );
      toast.success('Assignment deleted');
      fetchModulesAndAssignments();
    } catch (err) {
      toast.error('Failed to delete assignment');
      console.error(err);
    }
  };

  const handleViewSubmissions = async assignment => {
    try {
      setSelectedAssignment(assignment);
      const res = await api.get(
        `/assignments/${assignment.id}/submissions`,
        { withCredentials: true }
      );
      setSubmissions(res.data.submissions || []);
      setSubmissionsDialog(true);
    } catch (err) {
      toast.error('Failed to load submissions');
    }
  };

  const handleGradeSubmission = async (submissionId, grade, feedback) => {
    try {
      await api.put(
        `/assignments/submission/${submissionId}/grade`,
        { grade, feedback },
        { withCredentials: true }
      );
      toast.success('✅ Submission graded');
      handleViewSubmissions(selectedAssignment);
    } catch {
      toast.error('Failed to grade submission');
    }
  };

  if (loading) {
    return <Typography>Loading assignments…</Typography>;
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">Course Assignments</Typography>
        <Typography color="text.secondary">
          Create and manage assignments for each lesson
        </Typography>
      </Box>

      {modules.length === 0 ? (
        <Alert severity="info">
          No modules found. Please create modules and lessons first.
        </Alert>
      ) : (
        modules.map((module, mi) => (
          <Accordion key={module.id} defaultExpanded={mi === 0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>
                Module {mi + 1}: {module.title}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {module.lessons.length === 0 ? (
                <Typography color="text.secondary">
                  No lessons in this module
                </Typography>
              ) : (
                <List>
                  {module.lessons.map((lesson, li) => (
                    <ListItem key={lesson.id} divider>
                      <ListItemText
                        primary={`${li + 1}. ${lesson.title}`}
                        secondary={
                          assignments[lesson.id] ? (
                            <Box sx={{ mt: 1 }}>
                              <Chip
                                icon={<AssignmentIcon />}
                                label={assignments[lesson.id].title}
                                size="small"
                                color="primary"
                                sx={{ mr: 1 }}
                              />
                              {assignments[lesson.id].deadline && (
                                <Chip
                                  icon={<CalendarIcon />}
                                  label={new Date(
                                    assignments[lesson.id].deadline
                                  ).toLocaleString()}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          ) : (
                            'No assignment'
                          )
                        }
                      />
                      <ListItemSecondaryAction>
                        {assignments[lesson.id] ? (
                          <>
                            <IconButton
                              color="primary"
                              onClick={() =>
                                handleViewSubmissions(assignments[lesson.id])
                              }
                            >
                              <PeopleIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteAssignment(lesson.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </>
                        ) : (
                          <Button
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => handleCreateAssignment(lesson)}
                          >
                            Add Assignment
                          </Button>
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </AccordionDetails>
          </Accordion>
        ))
      )}

      {/* — Create Assignment Dialog — */}
      <Dialog
        open={assignmentDialog}
        onClose={() => setAssignmentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Create Assignment for {selectedLesson?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Assignment Title"
              value={formData.title}
              onChange={e =>
                setFormData({ ...formData, title: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Assignment Description"
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              margin="normal"
              multiline
              rows={4}
            />
            <TextField
              fullWidth
              label="Deadline Date (Optional)"
              type="date"
              value={formData.deadlineDate}
              onChange={e =>
                setFormData({ ...formData, deadlineDate: e.target.value })
              }
              margin="normal"
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: new Date().toISOString().split('T')[0],
              }}
            />
            <TextField
              fullWidth
              label="Deadline Time (Optional)"
              type="time"
              value={formData.deadlineTime}
              onChange={e =>
                setFormData({ ...formData, deadlineTime: e.target.value })
              }
              margin="normal"
              InputLabelProps={{ shrink: true }}
              helperText="If no time is selected, deadline will be set to 11:59 PM"
              disabled={!formData.deadlineDate}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignmentDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveAssignment} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* — View Submissions Dialog — */}
      <Dialog
        open={submissionsDialog}
        onClose={() => setSubmissionsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Submissions for: {selectedAssignment?.title}
        </DialogTitle>
        <DialogContent>
          {submissions.length === 0 ? (
            <Alert severity="info">No submissions yet</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Submitted At</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissions.map(sub => (
                    <TableRow key={sub.id}>
                      <TableCell>{sub.student_name}</TableCell>
                      <TableCell>
                        {new Date(sub.submitted_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {sub.grade != null ? `${sub.grade}/100` : 'Not graded'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {sub.submission_url && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={async () => {
                                try {
                                  const token = localStorage.getItem('token');
                                  const fileName = sub.submission_url.split('/').pop();
                                  const url = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/files/download/${fileName}?type=assignments`;
                                  const response = await fetch(url, {
                                    method: 'GET',
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                    credentials: 'include',
                                  });
                                  if (!response.ok) throw new Error('Download failed');
                                  const blob = await response.blob();
                                  const downloadUrl = window.URL.createObjectURL(blob);
                                  const link = document.createElement('a');
                                  link.href = downloadUrl;
                                  link.download = fileName;
                                  document.body.appendChild(link);
                                  link.click();
                                  link.remove();
                                  window.URL.revokeObjectURL(downloadUrl);
                                } catch (err) {
                                  toast.error('Download failed!');
                                }
                              }}
                            >
                              Download
                            </Button>
                          )}
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                              setGradingSubmission(sub);
                              setGradeValue(sub.grade ?? '');
                              setFeedbackValue(sub.feedback ?? '');
                              setGradeDialogOpen(true);
                            }}
                          >
                            Grade
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmissionsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog خاص بالتصحيح (grade) */}
      <Dialog open={gradeDialogOpen} onClose={() => setGradeDialogOpen(false)}>
        <DialogTitle>Grade Submission</DialogTitle>
        <DialogContent>
          <TextField
            label="Grade (0–100)"
            type="number"
            fullWidth
            value={gradeValue}
            onChange={e => setGradeValue(e.target.value)}
            margin="normal"
            inputProps={{ min: 0, max: 100 }}
          />
          <TextField
            label="Feedback"
            fullWidth
            value={feedbackValue}
            onChange={e => setFeedbackValue(e.target.value)}
            margin="normal"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGradeDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              await handleGradeSubmission(
                gradingSubmission.id,
                parseInt(gradeValue, 10),
                feedbackValue
              );
              setGradeDialogOpen(false);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssignmentsTab;
