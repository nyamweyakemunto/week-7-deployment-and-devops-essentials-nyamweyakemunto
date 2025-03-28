// client/src/components/PostForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Chip,
  Stack,
  IconButton,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  Save,
  Cancel,
  Image,
  Add,
  Delete,
  Error as ErrorIcon
} from '@mui/icons-material';
import { Editor } from '@tinymce/tinymce-react';
import * as Sentry from '@sentry/react';

const PostForm = ({ mode = 'create' }) => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(mode === 'edit');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: [],
    imageUrl: '',
    isPublished: false
  });

  const [tagInput, setTagInput] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [imagePreview, setImagePreview] = useState('');

  // Fetch post data for editing
  useEffect(() => {
    if (mode === 'edit') {
      const fetchPost = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/posts/${postId}`
          );
          setFormData({
            title: response.data.title,
            content: response.data.content,
            excerpt: response.data.excerpt || '',
            tags: response.data.tags || [],
            imageUrl: response.data.imageUrl || '',
            isPublished: response.data.isPublished || false
          });
          if (response.data.imageUrl) {
            setImagePreview(response.data.imageUrl);
          }
        } catch (err) {
          console.error('Error fetching post:', err);
          Sentry.captureException(err);
          setError(err.response?.data?.message || 'Failed to load post');
        } finally {
          setLoading(false);
        }
      };

      fetchPost();
    }
  }, [postId, mode]);

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );

      setFormData(prev => ({ ...prev, imageUrl: response.data.url }));
      setImagePreview(response.data.url);
    } catch (err) {
      console.error('Error uploading image:', err);
      Sentry.captureException(err);
      setError('Failed to upload image. Please try again.');
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle editor content change
  const handleEditorChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
    
    if (validationErrors.content) {
      setValidationErrors(prev => ({ ...prev, content: null }));
    }
  };

  // Handle tag operations
  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length > 120) {
      errors.title = 'Title must be less than 120 characters';
    }
    
    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    }
    
    if (formData.excerpt.length > 200) {
      errors.excerpt = 'Excerpt must be less than 200 characters';
    }
    
    if (formData.tags.length > 5) {
      errors.tags = 'Maximum 5 tags allowed';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const payload = {
        ...formData,
        // Auto-generate excerpt if not provided
        excerpt: formData.excerpt || formData.content.substring(0, 160) + '...'
      };

      let response;
      if (mode === 'create') {
        response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/posts`,
          payload,
          { withCredentials: true }
        );
      } else {
        response = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/posts/${postId}`,
          payload,
          { withCredentials: true }
        );
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate(`/post/${response.data._id}`);
      }, 1500);
    } catch (err) {
      console.error('Error saving post:', err);
      Sentry.captureException(err);
      setError(err.response?.data?.message || 'Failed to save post');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {mode === 'create' ? 'Create New Post' : 'Edit Post'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Post {mode === 'create' ? 'created' : 'updated'} successfully!
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Title Field */}
          <TextField
            fullWidth
            label="Post Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            error={!!validationErrors.title}
            helperText={validationErrors.title}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Typography variant="caption">
                    {formData.title.length}/120
                  </Typography>
                </InputAdornment>
              )
            }}
          />
          
          {/* Excerpt Field */}
          <TextField
            fullWidth
            label="Excerpt (optional)"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={2}
            error={!!validationErrors.excerpt}
            helperText={validationErrors.excerpt || 'A short preview of your post'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Typography variant="caption">
                    {formData.excerpt.length}/200
                  </Typography>
                </InputAdornment>
              )
            }}
          />
          
          {/* Image Upload */}
          <Box sx={{ my: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="post-image-upload"
              type="file"
              onChange={handleImageUpload}
            />
            <label htmlFor="post-image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<Image />}
                sx={{ mr: 2 }}
              >
                {imagePreview ? 'Change Image' : 'Upload Image'}
              </Button>
            </label>
            
            {imagePreview && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Image Preview:
                </Typography>
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Post preview"
                  sx={{
                    maxHeight: 200,
                    maxWidth: '100%',
                    borderRadius: 1
                  }}
                />
                <Button
                  size="small"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => {
                    setImagePreview('');
                    setFormData(prev => ({ ...prev, imageUrl: '' }));
                  }}
                  sx={{ mt: 1 }}
                >
                  Remove Image
                </Button>
              </Box>
            )}
          </Box>
          
          {/* Tags */}
          <Box sx={{ my: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Tags (max 5)
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
              {formData.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleTagRemove(tag)}
                />
              ))}
            </Stack>
            {validationErrors.tags && (
              <Typography color="error" variant="caption">
                {validationErrors.tags}
              </Typography>
            )}
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <TextField
                size="small"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag..."
                disabled={formData.tags.length >= 5}
              />
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleTagAdd}
                disabled={!tagInput.trim() || formData.tags.length >= 5}
              >
                Add
              </Button>
            </Stack>
          </Box>
          
          {/* Content Editor */}
          <Box sx={{ my: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Content *
            </Typography>
            {validationErrors.content && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ErrorIcon color="error" fontSize="small" sx={{ mr: 1 }} />
                <Typography color="error" variant="caption">
                  {validationErrors.content}
                </Typography>
              </Box>
            )}
            <Editor
              apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
              value={formData.content}
              onEditorChange={handleEditorChange}
              init={{
                height: 500,
                menubar: true,
                plugins: [
                  'advlist autolink lists link image charmap print preview anchor',
                  'searchreplace visualblocks code fullscreen',
                  'insertdatetime media table paste code help wordcount'
                ],
                toolbar:
                  'undo redo | formatselect | bold italic backcolor | \
                  alignleft aligncenter alignright alignjustify | \
                  bullist numlist outdent indent | removeformat | help',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
              }}
            />
          </Box>
          
          {/* Publish Toggle */}
          <Box sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
            <TextField
              select
              label="Status"
              value={formData.isPublished ? 'published' : 'draft'}
              onChange={(e) => 
                setFormData(prev => ({ 
                  ...prev, 
                  isPublished: e.target.value === 'published' 
                }))
              }
              SelectProps={{ native: true }}
              sx={{ minWidth: 120 }}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </TextField>
            <Tooltip title="Drafts are only visible to you">
              <Typography variant="caption" sx={{ ml: 2 }}>
                {formData.isPublished ? 'Post will be public' : 'Post will be private'}
              </Typography>
            </Tooltip>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          {/* Form Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
              disabled={isSubmitting}
            >
              {mode === 'create' ? 'Publish Post' : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Sentry.withProfiler(PostForm);