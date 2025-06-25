import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography,
  Accordion, AccordionSummary, AccordionDetails,
  List, ListItem, ListItemText, ListItemSecondaryAction,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Radio, RadioGroup, FormControlLabel,
  Alert, Chip, Card, CardContent,
  FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Quiz as QuizIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import api from '../../../services/api';
import { toast } from 'react-toastify';

const QuizzesTab = ({ course }) => {
  const [modules, setModules] = useState([]);
  const [quizzes, setQuizzes] = useState({});
  const [loading, setLoading] = useState(true);

  // إضافات عرض النتائج
  const [attemptsDialogOpen, setAttemptsDialogOpen] = useState(false);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [selectedQuizLesson, setSelectedQuizLesson] = useState(null);

  const [quizDialog, setQuizDialog] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // كل عنصر من questions قد يحتوي على id (قادم من الـ DB) أو لا (جديد)
  const [questions, setQuestions] = useState([{
    question: '',
    type: 'multiple_choice',
    options: ['', '', '', ''],
    correct_answer: 0,
    answer: ''          // للمقابل على short_answer
  }]);

  useEffect(() => {
    fetchModulesAndQuizzes();
    // eslint-disable-next-line
  }, [course.id]);

  async function fetchModulesAndQuizzes() {
    try {
      setLoading(true);
      const { data } = await api.get(`/modules/course/${course.id}`);
      const mods = data.modules || [];

      for (const m of mods) {
        const lessonsRes = await api.get(`/lessons/module/${m.id}`);
        m.lessons = lessonsRes.data.lessons || [];

        for (const l of m.lessons) {
          try {
            const quizRes = await api.get(`/quizzes/lesson/${l.id}`);
            if (quizRes.data.quiz?.length) {
              setQuizzes(prev => ({ ...prev, [l.id]: quizRes.data.quiz }));
            }
          } catch {}
        }
      }
      setModules(mods);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  }

  function handleCreateQuiz(lesson) {
    setSelectedLesson(lesson);
    setIsEditing(false);
    setQuestions([{
      question: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: 0,
      answer: ''
    }]);
    setQuizDialog(true);
  }

  function handleViewQuiz(lesson) {
    const existing = quizzes[lesson.id] || [];
    setSelectedLesson(lesson);
    setIsEditing(true);
    setQuestions(existing.map(q => ({
      id: q.id,
      question: q.question,
      type: q.type || 'multiple_choice',
      options: q.options,
      correct_answer: q.correct_answer,
      answer: q.answer || ''
    })));
    setQuizDialog(true);
  }

  function handleAddQuestion() {
    setQuestions(prev => [
      ...prev,
      {
        question: '',
        type: 'multiple_choice',
        options: ['', '', '', ''],
        correct_answer: 0,
        answer: ''
      }
    ]);
  }

  function handleRemoveQuestion(idx) {
    if (questions.length > 1) {
      setQuestions(prev => prev.filter((_, i) => i !== idx));
    }
  }

  function handleUpdateQuestion(idx, field, val) {
    setQuestions(prev => {
      const copy = [...prev];
      copy[idx][field] = val;
      // إذا غيرنا النوع، نعيد تهيئة الحقول الافتراضية
      if (field === 'type') {
        if (val === 'multiple_choice') {
          copy[idx].options = ['', '', '', ''];
          copy[idx].correct_answer = 0;
          delete copy[idx].answer;
        }
        if (val === 'true_false') {
          delete copy[idx].options;
          copy[idx].correct_answer = 'true';
          delete copy[idx].answer;
        }
        if (val === 'short_answer') {
          delete copy[idx].options;
          delete copy[idx].correct_answer;
          copy[idx].answer = '';
        }
      }
      return copy;
    });
  }

  function handleUpdateOption(qIdx, oIdx, val) {
    setQuestions(prev => {
      const copy = [...prev];
      copy[qIdx].options[oIdx] = val;
      return copy;
    });
  }

  async function handleSaveQuiz() {
    // validation عام
    for (const q of questions) {
      if (!q.question.trim()) {
        return toast.error('Question text is required');
      }
      if (q.type === 'multiple_choice' && q.options.some(o => !o.trim())) {
        return toast.error('All options must be filled');
      }
      if (q.type === 'short_answer' && !q.answer.trim()) {
        return toast.error('Answer is required');
      }
    }

    try {
      if (isEditing) {
        // 1. حدّث الأسئلة الحالية
        for (const q of questions.filter(x => x.id)) {
          await api.put(`/quizzes/question/${q.id}`, {
            question: q.question,
            options: q.options,
            correct_answer: q.correct_answer,
            answer: q.answer
          });
        }
        // 2. أنشئ الأسئلة الجديدة (بدون id)
        const newQs = questions.filter(x => !x.id);
        for (const q of newQs) {
          await api.post(`/quizzes/lesson/${selectedLesson.id}`, {
            questions: [ {
              question: q.question,
              type: q.type,
              options: q.options,
              correct_answer: q.correct_answer,
              answer: q.answer
            } ]
          });
        }
        toast.success('Quiz updated');
      } else {
        // إنشاء أولي: كل الأسئلة دفعة وحدة
        await api.post(`/quizzes/lesson/${selectedLesson.id}`, { questions });
        toast.success('Quiz created');
      }

      setQuizDialog(false);
      fetchModulesAndQuizzes();

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to save quiz');
    }
  }

  // ---- View Attempts logic ----
  const handleViewAttempts = async (lesson) => {
    try {
      setSelectedQuizLesson(lesson);
      const res = await api.get(`/quizzes/lesson/${lesson.id}/attempts`);
      setQuizAttempts(res.data.attempts || []);
      setAttemptsDialogOpen(true);
    } catch (err) {
      toast.error('Failed to load quiz attempts');
    }
  };

  if (loading) return <Typography>Loading quizzes…</Typography>;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">Course Quizzes</Typography>
        <Typography color="text.secondary">
          Manage quizzes per lesson
        </Typography>
      </Box>

      {modules.length === 0 ? (
        <Alert severity="info">No modules found. Add modules & lessons first.</Alert>
      ) : modules.map((mod, mi) => (
        <Accordion key={mod.id} defaultExpanded={mi === 0}>
          <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
            <Typography>Module {mi+1}: {mod.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {mod.lessons.length === 0 ? (
              <Typography color="text.secondary">No lessons</Typography>
            ) : (
              <List>
                {mod.lessons.map((lesson, li) => (
                  <ListItem key={lesson.id} divider>
                    <ListItemText
                      primary={`${li+1}. ${lesson.title}`}
                      secondary={
                        quizzes[lesson.id]
                          ? <Chip icon={<QuizIcon/>} label={`${quizzes[lesson.id].length} Qs`} size="small" color="primary"/>
                          : 'No quiz'
                      }
                    />
                    <ListItemSecondaryAction>
                      {quizzes[lesson.id] ? (
                        <>
                          <Button
                            size="small"
                            startIcon={<EditIcon/>}
                            onClick={() => handleViewQuiz(lesson)}
                          >
                            Edit Quiz
                          </Button>
                          <Button
                            size="small"
                            sx={{ ml: 1 }}
                            onClick={() => handleViewAttempts(lesson)}
                          >
                            View Results
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="small"
                          startIcon={<AddIcon/>}
                          onClick={() => handleCreateQuiz(lesson)}
                        >
                          Add Quiz
                        </Button>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </AccordionDetails>
        </Accordion>
      ))}

      <Dialog open={quizDialog} onClose={() => setQuizDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>
          {isEditing ? 'Edit Quiz for' : 'Create Quiz for'} “{selectedLesson?.title}”
        </DialogTitle>
        <DialogContent>
          {questions.map((q, i) => (
            <Card key={i} sx={{ mb:2 }}>
              <CardContent>
                <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2 }}>
                  <Typography>Question {i+1}</Typography>
                  {questions.length > 1 && (
                    <IconButton onClick={()=>handleRemoveQuestion(i)} color="error">
                      <DeleteIcon/>
                    </IconButton>
                  )}
                </Box>

                {/* نص السؤال */}
                <TextField
                  fullWidth
                  label="Question"
                  value={q.question}
                  onChange={e=>handleUpdateQuestion(i,'question',e.target.value)}
                  margin="normal"
                />

                {/* اختيار النوع */}
                <FormControl fullWidth margin="normal">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={q.type}
                    label="Type"
                    onChange={e=>handleUpdateQuestion(i,'type',e.target.value)}
                  >
                    <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
                    <MenuItem value="true_false">True / False</MenuItem>
                    <MenuItem value="short_answer">Short Answer</MenuItem>
                  </Select>
                </FormControl>

                {/* المحتوى حسب النوع */}
                {q.type === 'multiple_choice' && (
                  <>
                    <Typography variant="subtitle2" sx={{mt:2,mb:1}}>
                      Options & select correct:
                    </Typography>
                    <RadioGroup
                      value={q.correct_answer}
                      onChange={e=>handleUpdateQuestion(i,'correct_answer',parseInt(e.target.value))}
                    >
                      {q.options.map((opt,oi)=>(
                        <Box key={oi} sx={{display:'flex',alignItems:'center',mb:1}}>
                          <FormControlLabel
                            value={oi}
                            control={<Radio/>}
                            label=""
                          />
                          <TextField
                            fullWidth
                            placeholder={`Option ${oi+1}`}
                            size="small"
                            value={opt}
                            onChange={e=>handleUpdateOption(i,oi,e.target.value)}
                          />
                        </Box>
                      ))}
                    </RadioGroup>
                  </>
                )}

                {q.type === 'true_false' && (
                  <RadioGroup
                    row
                    value={q.correct_answer}
                    onChange={e=>handleUpdateQuestion(i,'correct_answer',e.target.value)}
                  >
                    <FormControlLabel value="true" control={<Radio/>} label="True"/>
                    <FormControlLabel value="false" control={<Radio/>} label="False"/>
                  </RadioGroup>
                )}

                {q.type === 'short_answer' && (
                  <TextField
                    fullWidth
                    label="Correct Answer"
                    value={q.answer}
                    onChange={e=>handleUpdateQuestion(i,'answer',e.target.value)}
                    margin="normal"
                  />
                )}

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AddIcon/>}
                  onClick={handleAddQuestion}
                  sx={{mt:2}}
                >
                  Add Question
                </Button>
              </CardContent>
            </Card>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setQuizDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveQuiz} variant="contained">
            {isEditing ? 'Update Quiz' : 'Create Quiz'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---- Quiz Results Dialog ---- */}
      <Dialog open={attemptsDialogOpen} onClose={() => setAttemptsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Quiz Results for: {selectedQuizLesson?.title}
        </DialogTitle>
        <DialogContent>
          {quizAttempts.length === 0 ? (
            <Alert severity="info">No attempts yet</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Submitted At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quizAttempts.map(a => (
                    <TableRow key={a.id}>
                      <TableCell>{a.name}</TableCell>
                      <TableCell>{a.score}%</TableCell>
                      <TableCell>{new Date(a.submitted_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttemptsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuizzesTab;
