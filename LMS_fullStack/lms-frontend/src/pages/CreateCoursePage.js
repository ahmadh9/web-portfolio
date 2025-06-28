import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Container, Paper, Typography, TextField, Button, Box,
  Alert, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, FormHelperText,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import courseService from '../services/courseService';
import api from '../services/api';
import { toast } from 'react-toastify';

const CreateCoursePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState:{ errors } } = useForm();

  useEffect(() => { fetchCategories(); }, []);
  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.categories||[]);
    } catch(err) {
      console.error('Error fetching categories:', err);
    }
  };

  const onSubmit = async data => {
    try {
      setLoading(true);
      setError('');
      const payload = {
        title: data.title,
        description: data.description,
        category_id: data.category_id || null,
        thumbnail: data.thumbnail || null,
        status: 'pending',
        is_published: false
      };
      const res = await courseService.createCourse(payload);
      toast.success('Course created successfully!');
      navigate(`/courses/${res.course.id}/edit`);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to create course';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt:4, mb:4 }}>
      <Paper sx={{ p:4 }}>
        <Typography variant="h4" gutterBottom>Create New Course</Typography>
        {error && <Alert severity="error" sx={{ mb:3 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            fullWidth label="Course Title" margin="normal"
            {...register('title',{ required: 'Required', minLength:{value:3,message:'Min 3 chars'}, maxLength:{value:100,message:'Max 100 chars'} })}
            error={!!errors.title} helperText={errors.title?.message}
          />
          <TextField
            fullWidth label="Course Description" margin="normal" multiline rows={4}
            {...register('description',{ required:'Required', minLength:{value:10,message:'Min 10 chars'}, maxLength:{value:1000,message:'Max 1000 chars'} })}
            error={!!errors.description} helperText={errors.description?.message}
          />
          <FormControl fullWidth margin="normal" error={!!errors.category_id}>
            <InputLabel>Category</InputLabel>
            <Select label="Category" defaultValue="" {...register('category_id')}>
              <MenuItem value=""><em>None</em></MenuItem>
              {categories.map(cat=>(
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
            {errors.category_id && <FormHelperText>{errors.category_id.message}</FormHelperText>}
          </FormControl>
          <TextField
            fullWidth label="Thumbnail URL (Optional)" margin="normal"
            placeholder="https://example.com/img.jpg"
            {...register('thumbnail',{ pattern:{ value:/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i, message:'Invalid image URL' } })}
            error={!!errors.thumbnail}
            helperText={errors.thumbnail?.message || 'Direct image URL (jpg/jpeg/png/gif/webp)'}
          />
          <Box sx={{ mt:4, display:'flex', gap:2, justifyContent:'flex-end' }}>
            <Button variant="outlined" startIcon={<CancelIcon />} onClick={()=>navigate('/dashboard')} disabled={loading}>Cancel</Button>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={loading}>
              {loading? <CircularProgress size={24}/> : 'Create Course'}
            </Button>
          </Box>
        </Box>
        <Alert severity="info" sx={{ mt:3 }}>
          بعد الإنشاء ستتمكن من إضافة الوحدات والدروس والاختبارات.
        </Alert>
      </Paper>
    </Container>
  );
};

export default CreateCoursePage;
