// src/components/courses/edit/CourseInfoTab.js
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  FormHelperText,
} from '@mui/material';
import { Save as SaveIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import courseService from '../../../services/courseService';
import api from '../../../services/api';
import { toast } from 'react-toastify';

const CourseInfoTab = ({ course, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      title: course.title,
      description: course.description,
      category_id: course.category_id || '',
      thumbnail: course.thumbnail || course.thumbnail_url || '',
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');

      await courseService.updateCourse(course.id, {
        title: data.title,
        description: data.description,
        category_id: data.category_id || null,
        thumbnail: data.thumbnail || null,
      });

      toast.success('Course updated successfully!');
      if (onUpdate) onUpdate();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update course';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      await courseService.uploadCourseThumbnail(course.id, file);
      toast.success('Thumbnail uploaded successfully!');
      if (onUpdate) onUpdate();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to upload thumbnail';
      setError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
      // reset the file input
      e.target.value = null;
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Course Title"
        margin="normal"
        {...register('title', {
          required: 'Course title is required',
          minLength: {
            value: 3,
            message: 'Title must be at least 3 characters',
          },
        })}
        error={!!errors.title}
        helperText={errors.title?.message}
      />

      <TextField
        fullWidth
        label="Course Description"
        margin="normal"
        multiline
        rows={4}
        {...register('description', {
          required: 'Course description is required',
          minLength: {
            value: 10,
            message: 'Description must be at least 10 characters',
          },
        })}
        error={!!errors.description}
        helperText={errors.description?.message}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>Category</InputLabel>
        <Select
          label="Category"
          defaultValue={course.category_id || ''}
          {...register('category_id')}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Thumbnail URL"
        margin="normal"
        {...register('thumbnail')}
        helperText="Or upload a new image file below"
      />

      <Box sx={{ mt: 2, mb: 3 }}>
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadIcon />}
          disabled={uploading}
        >
          {uploading ? <CircularProgress size={20} /> : 'Upload Thumbnail'}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />
        </Button>
        <FormHelperText>
          Supported formats: JPEG, PNG, GIF. Max size: 5MB.
        </FormHelperText>
      </Box>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Save Changes'}
        </Button>
      </Box>
    </Box>
  );
};

export default CourseInfoTab;
