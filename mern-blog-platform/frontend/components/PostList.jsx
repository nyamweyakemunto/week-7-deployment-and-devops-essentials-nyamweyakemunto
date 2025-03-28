// client/src/components/PostList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Pagination,
  Chip,
  Stack,
  Button,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Search,
  FilterList,
  Sort,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';
import { format } from 'date-fns';
import * as Sentry from '@sentry/react';

const PostList = ({
  posts: initialPosts = [],
  loading: initialLoading = false,
  error: initialError = null,
  showFilters = true,
  pagination = true,
  itemsPerPage = 6
}) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState(initialError);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);

  // Fetch posts if no initial posts provided
  useEffect(() => {
    if (initialPosts.length === 0) {
      fetchPosts();
      fetchCategories();
    }
  }, []);

  // Handle external posts update
  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/posts`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          sort: sortBy
        }
      });
      setPosts(response.data.posts);
      setTotalPosts(response.data.total);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      Sentry.captureException(err);
      setError(err.response?.data?.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/categories`);
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      Sentry.captureException(err);
    }
  };

  // Handle search, filter, or sort changes
  useEffect(() => {
    if (initialPosts.length === 0) {
      fetchPosts();
    }
  }, [currentPage, searchTerm, selectedCategory, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    if (initialPosts.length === 0) {
      fetchPosts();
    }
  };

  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = (sortValue) => {
    setSortAnchorEl(null);
    if (sortValue) {
      setSortBy(sortValue);
      setCurrentPage(1);
    }
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = (category) => {
    setFilterAnchorEl(null);
    if (category !== undefined) {
      setSelectedCategory(category);
      setCurrentPage(1);
    }
  };

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  const renderSortIcon = () => {
    switch (sortBy) {
      case 'newest':
        return <ArrowDownward fontSize="small" />;
      case 'oldest':
        return <ArrowUpward fontSize="small" />;
      case 'popular':
        return <Favorite fontSize="small" />;
      default:
        return <Sort fontSize="small" />;
    }
  };

  if (loading && posts.length === 0) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!loading && posts.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6">No posts found</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Try adjusting your search or filters
        </Typography>
        <Button
          variant="outlined"
          sx={{ mt: 2 }}
          onClick={() => {
            setSearchTerm('');
            setSelectedCategory('all');
            setSortBy('newest');
          }}
        >
          Reset Filters
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Search and Filter Bar */}
      {showFilters && (
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Box component="form" onSubmit={handleSearch} sx={{ flexGrow: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setSearchTerm('')}>
                        <Typography variant="caption">Clear</Typography>
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={handleFilterClick}
            >
              {selectedCategory === 'all' ? 'Category' : selectedCategory}
            </Button>

            <Button
              variant="outlined"
              startIcon={renderSortIcon()}
              onClick={handleSortClick}
            >
              {sortBy === 'newest' ? 'Newest' : 
               sortBy === 'oldest' ? 'Oldest' : 'Popular'}
            </Button>
          </Stack>

          {/* Active filters chips */}
          {(searchTerm || selectedCategory !== 'all') && (
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
              {searchTerm && (
                <Chip
                  label={`Search: "${searchTerm}"`}
                  onDelete={() => setSearchTerm('')}
                />
              )}
              {selectedCategory !== 'all' && (
                <Chip
                  label={`Category: ${selectedCategory}`}
                  onDelete={() => setSelectedCategory('all')}
                />
              )}
            </Stack>
          )}
        </Box>
      )}

      {/* Posts Grid */}
      <Grid container spacing={3}>
        {posts.map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post._id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                  cursor: 'pointer'
                }
              }}
              onClick={() => handlePostClick(post._id)}
            >
              {post.imageUrl && (
                <CardMedia
                  component="img"
                  height="200"
                  image={post.imageUrl}
                  alt={post.title}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h3">
                  {post.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {post.excerpt || post.content.substring(0, 100) + '...'}
                </Typography>
                <Box sx={{ mt: 'auto' }}>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    {post.tags.slice(0, 2).map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCategory(tag);
                        }}
                      />
                    ))}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(post.createdAt), 'MMM dd, yyyy')} • {post.readTime} min read
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
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

      {/* Sort Menu */}
      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={() => handleSortClose(null)}
      >
        <MenuItem
          selected={sortBy === 'newest'}
          onClick={() => handleSortClose('newest')}
        >
          <ArrowDownward fontSize="small" sx={{ mr: 1 }} />
          Newest First
        </MenuItem>
        <MenuItem
          selected={sortBy === 'oldest'}
          onClick={() => handleSortClose('oldest')}
        >
          <ArrowUpward fontSize="small" sx={{ mr: 1 }} />
          Oldest First
        </MenuItem>
        <MenuItem
          selected={sortBy === 'popular'}
          onClick={() => handleSortClose('popular')}
        >
          <Favorite fontSize="small" sx={{ mr: 1 }} />
          Most Popular
        </MenuItem>
      </Menu>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => handleFilterClose(null)}
      >
        <MenuItem
          selected={selectedCategory === 'all'}
          onClick={() => handleFilterClose('all')}
        >
          All Categories
        </MenuItem>
        {categories.map((category) => (
          <MenuItem
            key={category}
            selected={selectedCategory === category}
            onClick={() => handleFilterClose(category)}
          >
            {category}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default Sentry.withProfiler(PostList);