// client/src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Box,
  TextField,
  Pagination
} from '@mui/material';
import { format } from 'date-fns';
import * as Sentry from '@sentry/react';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/posts?page=${currentPage}&search=${searchTerm}`
        );
        setPosts(response.data.posts);
        setTotalPages(response.data.totalPages);
        setError(null);
      } catch (err) {
        console.error('Error fetching posts:', err);
        Sentry.captureException(err);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage, searchTerm]);

  // Handle post click
  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to My Blog
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Discover the latest articles and stories
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            endAdornment: (
              <Button type="submit" variant="contained" color="primary">
                Search
              </Button>
            )
          }}
        />
      </Box>

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Posts Grid */}
      <Grid container spacing={4}>
        {!loading && !error && posts.length === 0 && (
          <Grid item xs={12}>
            <Typography variant="h6" textAlign="center">
              No posts found. Try a different search term.
            </Typography>
          </Grid>
        )}

        {posts.map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post._id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: 3
                }
              }}
              onClick={() => handlePostClick(post._id)}
            >
              {post.imageUrl && (
                <Box
                  component="img"
                  src={post.imageUrl}
                  alt={post.title}
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover'
                  }}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {post.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {post.excerpt || post.content.substring(0, 100) + '...'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(post.createdAt), 'MMM dd, yyyy')} • {post.author?.name || 'Anonymous'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(event, page) => setCurrentPage(page)}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Container>
  );
};

export default Sentry.withProfiler(Home);