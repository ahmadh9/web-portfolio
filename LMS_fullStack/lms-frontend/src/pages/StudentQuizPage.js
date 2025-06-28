// src/pages/StudentQuizPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, CircularProgress, Alert,
  Card, CardContent, RadioGroup, FormControlLabel,
  Radio, TextField, Button
} from '@mui/material';
import { Quiz as QuizIcon } from '@mui/icons-material';
import api from '../services/api';
import { toast } from 'react-toastify';

const StudentQuizPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/quizzes/lesson/${lessonId}`);
        setQuestions(res.data.quiz);
        setAnswers(res.data.quiz.map(() => ''));
        if (res.data.attempt?.score != null) {
          setResult({ score: res.data.attempt.score, already: true });
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    })();
  }, [lessonId]);

  const handleAnswerChange = (idx, value) => {
    const updated = [...answers];
    updated[idx] = value;
    setAnswers(updated);
  };

  const handleSubmit = async () => {
    if (answers.some(a => a === '')) return toast.error('Please answer all questions');
    try {
      setSubmitting(true);
      const res = await api.post(`/quizzes/lesson/${lessonId}/submit`, { answers });
      setResult({ score: res.data.score, already: true });
      toast.success(`You scored ${res.data.score}% on the quiz`);
      setTimeout(() => {
        navigate(`/courses/${courseId}`, {
          state: { updatedQuiz: { lessonId: parseInt(lessonId), score: res.data.score } }
        });
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress/></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  if (result?.already) {
    return (
      <Container maxWidth="sm" sx={{ mt:8, textAlign:'center' }}>
        <QuizIcon sx={{ fontSize:72, color:'text.secondary', mb:1 }}/>
        <Typography variant="h5" gutterBottom>
          You already submitted this quiz
        </Typography>
        <Typography variant="h6" gutterBottom>
          Your Score: {result.score}%
        </Typography>
        <Button variant="contained" onClick={() => navigate(`/courses/${courseId}`)}>
          Back to Course
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt:4, mb:4 }}>
      <Typography variant="h4" gutterBottom>Quiz</Typography>
      {questions.map((q, i) => (
        <Card key={q.id} sx={{ mb:2 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              {i+1}. {q.question}
            </Typography>
            {q.type === 'multiple_choice' && (
              <RadioGroup
                value={answers[i]}
                onChange={e => handleAnswerChange(i, e.target.value)}
              >
                {q.options.map((opt, oi) => (
                  <FormControlLabel
                    key={oi}
                    value={String(oi)}
                    control={<Radio />}
                    label={opt}
                  />
                ))}
              </RadioGroup>
            )}
            {q.type === 'true_false' && (
              <RadioGroup
                row
                value={answers[i]}
                onChange={e => handleAnswerChange(i, e.target.value)}
              >
                <FormControlLabel value="true" control={<Radio />} label="True" />
                <FormControlLabel value="false" control={<Radio />} label="False" />
              </RadioGroup>
            )}
            {q.type === 'short_answer' && (
              <TextField
                fullWidth
                placeholder="Your answer..."
                value={answers[i]}
                onChange={e => handleAnswerChange(i, e.target.value)}
                sx={{ mt:1 }}
              />
            )}
          </CardContent>
        </Card>
      ))}
      <Box textAlign="center" mt={3}>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit Quiz'}
        </Button>
      </Box>
    </Container>
  );
};

export default StudentQuizPage;
