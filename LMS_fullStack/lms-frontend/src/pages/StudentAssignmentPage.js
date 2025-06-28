import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Grid, Paper, Typography, Box, Button,
  TextField, Alert, CircularProgress, Divider, Chip
} from '@mui/material';
import { ArrowBack as BackIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import api from '../services/api';
import { toast } from 'react-toastify';

const StudentAssignmentPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/assignments/lesson/${lessonId}`);
        setAssignment(res.data.assignment);
        if (res.data.submission) {
          setSubmission(res.data.submission);
          setText(res.data.submission.submission_text || '');
        }
      } catch (err) {
        console.error(err);
        toast.error('Cannot load assignment');
        navigate(`/courses/${courseId}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [lessonId, courseId, navigate]);

  const handleSubmit = async () => {
    if (!text.trim() && !file) {
      return toast.error('Write text or select a file');
    }
    try {
      setSubmitting(true);
      const form = new FormData();
      form.append('submission_text', text);
      if (file) form.append('assignmentFile', file);
      const res = await api.post(
        `/files/assignment/${assignment.id}`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setSubmission(res.data.submission);
      toast.success('Submitted!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Server error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  if (!assignment) return <Alert severity="error">No assignment</Alert>;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button startIcon={<BackIcon />} onClick={() => navigate(`/courses/${courseId}`)}>
        Back to Course
      </Button>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5">{assignment.title}</Typography>
            <Typography sx={{ mt: 2 }}>{assignment.description}</Typography>

            {assignment.deadline && (
              <Chip
                label={`Due: ${new Date(assignment.deadline).toLocaleDateString()}`}
                color="warning"
                sx={{ mt: 2 }}
              />
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Your Submission</Typography>

            {/* حالة التقييم */}
            {submission?.grade != null && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Graded: {submission.grade}
              </Alert>
            )}

            {/* حالة التسليم */}
            {submission ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                {submission.submitted_at
                  ? `Submitted on ${new Date(submission.submitted_at).toLocaleString()}`
                  : 'Submitted'}
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Not submitted yet
              </Alert>
            )}

            <TextField
              fullWidth
              multiline
              rows={6}
              placeholder="Your answer..."
              value={text}
              onChange={e => setText(e.target.value)}
              disabled={submission}
              sx={{ mb: 2 }}
            />

            <Box sx={{ mb: 2 }}>
              <input
                type="file"
                onChange={e => setFile(e.target.files[0] || null)}
                disabled={submission}
              />
            </Box>

            {!submission && (
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
            )}

            {/* التغذية الراجعة */}
            {submission?.feedback && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography>Feedback:</Typography>
                <Typography>{submission.feedback}</Typography>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StudentAssignmentPage;
