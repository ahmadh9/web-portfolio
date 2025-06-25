import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VideoLibrary as VideoIcon,
  Description as TextIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
} from '@mui/icons-material';
import courseService from '../../../services/courseService';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import axios from 'axios';

const ModulesTab = ({ course, onUpdate }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleDialog, setModuleDialog] = useState(false);
  const [lessonDialog, setLessonDialog] = useState(false);
  const [currentModule, setCurrentModule] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [uploadMode, setUploadMode] = useState('link');
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: 'video',
    content_url: '',
    duration: 0,
  });

  useEffect(() => {
    fetchModules();
  }, [course.id]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourseModules(course.id);
      const mods = response.modules || [];
      for (const m of mods) {
        const lessonsRes = await courseService.getModuleLessons(m.id);
        m.lessons = lessonsRes.lessons || [];
      }
      setModules(mods);
    } catch (err) {
      console.error('Error fetching modules:', err);
      toast.error('Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = () => {
    setCurrentModule(null);
    setFormData({ title: '', description: '' });
    setModuleDialog(true);
  };

  const handleEditModule = (m) => {
    setCurrentModule(m);
    setFormData({ title: m.title, description: m.description || '' });
    setModuleDialog(true);
  };

  const handleSaveModule = async () => {
    try {
      if (currentModule) {
        await courseService.updateModule(currentModule.id, formData);
        toast.success('Module updated');
      } else {
        await courseService.createModule(course.id, formData);
        toast.success('Module created');
      }
      setModuleDialog(false);
      fetchModules();
      onUpdate?.();
    } catch {
      toast.error('Failed to save module');
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (window.confirm('Delete this module (all lessons will be removed)?')) {
      try {
        await courseService.deleteModule(moduleId);
        toast.success('Module deleted');
        fetchModules();
        onUpdate?.();
      } catch {
        toast.error('Failed to delete module');
      }
    }
  };

  const handleAddLesson = (m) => {
    setCurrentModule(m);
    setCurrentLesson(null);
    setUploadMode('link');
    setVideoFile(null);
    setFormData({ title: '', description: '', content_type: 'video', content_url: '', duration: 0 });
    setLessonDialog(true);
  };

  const handleEditLesson = (lesson, m) => {
    setCurrentModule(m);
    setCurrentLesson(lesson);
    setUploadMode('link');
    setVideoFile(null);
    setFormData({
      title: lesson.title,
      description: lesson.description || '',
      content_type: lesson.content_type,
      content_url: lesson.content_url || '',
      duration: lesson.duration || 0,
    });
    setLessonDialog(true);
  };

 
const handleSaveLesson = async () => {
  try {
    let finalContentUrl = formData.content_url;

    if (formData.content_type === 'video' && uploadMode === 'upload' && videoFile) {
      const videoForm = new FormData();
      videoForm.append('lessonVideo', videoFile);

      setUploading(true);

      const res = await axios.post('http://localhost:5000/api/files/lesson/video', videoForm, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      finalContentUrl = res.data.url;
      toast.success('Video uploaded');
      setUploading(false);
    }

    const lessonPayload = { ...formData, content_url: finalContentUrl };

    if (currentLesson) {
      await courseService.updateLesson(currentLesson.id, lessonPayload);
      toast.success('Lesson updated');
    } else {
      await courseService.createLesson(currentModule.id, lessonPayload);
      toast.success('Lesson created');
    }

    setLessonDialog(false);
    fetchModules();
  } catch (err) {
    console.error('Lesson save error:', err);
    toast.error('Failed to save lesson');
    setUploading(false);
  }
};

  const handleDeleteLesson = async (lessonId) => {
    if (window.confirm('Delete this lesson?')) {
      try {
        await courseService.deleteLesson(lessonId);
        toast.success('Lesson deleted');
        fetchModules();
      } catch {
        toast.error('Failed to delete lesson');
      }
    }
  };

  const getContentIcon = (type) => {
    switch (type) {
      case 'video': return <VideoIcon />;
      case 'text': return <TextIcon />;
      case 'assignment': return <AssignmentIcon />;
      case 'quiz': return <QuizIcon />;
      default: return <TextIcon />;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Course Modules</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddModule}>
          Add Module
        </Button>
      </Box>

      {modules.length === 0 ? (
        <Alert severity="info">No modules yet. Create one to add lessons.</Alert>
      ) : modules.map((m, idx) => (
        <Accordion key={m.id} defaultExpanded={idx === 0}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Typography sx={{ flexGrow: 1 }}>
                Module {idx + 1}: {m.title}
              </Typography>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEditModule(m); }}>
                <EditIcon />
              </IconButton>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteModule(m.id); }}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {m.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {m.description}
              </Typography>
            )}
            <Button size="small" startIcon={<AddIcon />} onClick={() => handleAddLesson(m)} sx={{ mb: 2 }}>
              Add Lesson
            </Button>
            <List>
              {m.lessons.map((lesson, li) => (
                <ListItem key={lesson.id}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getContentIcon(lesson.content_type)}
                        <Typography sx={{ ml: 1 }}>
                          {li + 1}. {lesson.title}
                        </Typography>
                      </Box>
                    }
                    secondary={lesson.duration ? `${lesson.duration} minutes` : lesson.content_type}
                  />
                  <ListItemSecondaryAction>
                    <IconButton size="small" onClick={() => handleEditLesson(lesson, m)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteLesson(lesson.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Module Dialog */}
      <Dialog open={moduleDialog} onClose={() => setModuleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{currentModule ? 'Edit Module' : 'Add Module'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Module Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Module Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModuleDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveModule}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={lessonDialog} onClose={() => setLessonDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{currentLesson ? 'Edit Lesson' : 'Add Lesson'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth label="Lesson Title" margin="normal"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Content Type</InputLabel>
            <Select
              value={formData.content_type}
              label="Content Type"
              onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
            >
              <MenuItem value="video">Video</MenuItem>
              <MenuItem value="text">Text</MenuItem>
            </Select>
          </FormControl>

          {formData.content_type === 'video' && (
            <>
              <FormControl component="fieldset" margin="normal">
                <RadioGroup
                  row
                  value={uploadMode}
                  onChange={(e) => setUploadMode(e.target.value)}
                >
                  <FormControlLabel value="link" control={<Radio />} label="External Link" />
                  <FormControlLabel value="upload" control={<Radio />} label="Upload Video" />
                </RadioGroup>
              </FormControl>

              {uploadMode === 'link' ? (
                <TextField
                  fullWidth label="Video URL" margin="normal"
                  value={formData.content_url}
                  onChange={(e) => setFormData({ ...formData, content_url: e.target.value })}
                />
              ) : (
                <>
                  <Button variant="outlined" component="label" sx={{ mt: 1 }}>
                    {videoFile ? videoFile.name : 'Choose Video File'}
                    <input
                      type="file"
                      hidden
                      accept="video/mp4,video/webm,video/ogg"
                      onChange={(e) => setVideoFile(e.target.files[0])}
                    />
                  </Button>
                  {uploading && <CircularProgress size={24} sx={{ mt: 2 }} />}
                </>
              )}

              <TextField
                fullWidth
                label="Duration (minutes)"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value, 10) || 0 })}
                margin="normal"
              />
            </>
          )}

          {formData.content_type === 'text' && (
            <TextField
              fullWidth label="Lesson Content" multiline rows={6} margin="normal"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter the lesson content here..."
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLessonDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveLesson} disabled={uploading}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModulesTab;
