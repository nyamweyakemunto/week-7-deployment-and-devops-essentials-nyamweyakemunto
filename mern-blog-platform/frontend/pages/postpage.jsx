// client/src/pages/PostPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import * as Sentry from '@sentry/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Container,
  Typography,
  Box,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  ArrowBack,
  Favorite,
  Bookmark,
  Share,
  Send
} from '@mui/icons-material';

// Custom hook for fetching post data
const usePostData = (postId) => {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [postRes, commentsRes, relatedRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/posts/${postId}`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/posts/${postId}/comments`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/posts/${postId}/related`)
        ]);
        
        setPost(postRes.data);
        setComments(commentsRes.data);
        setRelatedPosts(relatedRes.data);
      } catch (err) {
        console.error('Error fetching post data:', err);
        Sentry.captureException(err);
        setError(err.response?.data?.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId]);

  return { post, comments, relatedPosts, loading, error };
};

// Comment form component
const CommentForm = ({ onSubmit }) => {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onSubmit(commentText);
      setCommentText('');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
      <TextField
        fullWidth
        multiline
        rows={3}
        variant="outlined"
        placeholder="Add a comment..."
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        InputProps={{
          endAdornment: (
            <IconButton type="submit" color="primary">
              <Send />
            </IconButton>
          )
        }}
      />
    </Box>
  );
};

// Related posts component
const RelatedPosts = ({ posts, onPostClick }) => {
  if (posts.length === 0) return null;

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h5" gutterBottom>
        You might also like
      </Typography>
      <Grid container spacing={3}>
        {posts.map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post._id}>
            <Card sx={{ cursor: 'pointer' }} onClick={() => onPostClick(post._id)}>
              {post.imageUrl && (
                <Box
                  component="img"
                  src={post.imageUrl}
                  alt={post.title}
                  sx={{ width: '100%', height: 200, objectFit: 'cover' }}
                />
              )}
              <CardContent>
                <Typography gutterBottom variant="h6">
                  {post.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(post.createdAt), 'MMM dd, yyyy')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Main component
const PostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { post, comments, relatedPosts, loading, error } = usePostData(postId);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleCommentSubmit = async (commentText) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/posts/${postId}/comments`,
        { text: commentText },
        { withCredentials: true }
      );
      return response.data;
    } catch (err) {
      console.error('Error submitting comment:', err);
      Sentry.captureException(err);
      throw err;
    }
  };

  const handleLike = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/posts/${postId}/like`,
        {},
        { withCredentials: true }
      );
      setIsLiked(!isLiked);
    } catch (err) {
      console.error('Error liking post:', err);
      Sentry.captureException(err);
    }
  };

  const handleBookmark = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/posts/${postId}/bookmark`,
        {},
        { withCredentials: true }
      );
      setIsBookmarked(!isBookmarked);
    } catch (err) {
      console.error('Error bookmarking post:', err);
      Sentry.captureException(err);
    }
  };

  const handleRelatedPostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onBack={() => navigate('/')} />;
  if (!post) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <BackButton onClick={() => navigate(-1)} />
      
      <PostHeader 
        post={post} 
        isLiked={isLiked} 
        isBookmarked={isBookmarked}
        onLike={handleLike}
        onBookmark={handleBookmark}
        onTagClick={(tag) => navigate(`/tag/${tag}`)}
      />

      {post.imageUrl && <PostImage imageUrl={post.imageUrl} title={post.title} />}

      <PostContent content={post.content} />

      <Divider sx={{ my: 4 }} />

      <CommentsSection 
        comments={comments} 
        onSubmit={handleCommentSubmit} 
      />

      <RelatedPosts 
        posts={relatedPosts} 
        onPostClick={handleRelatedPostClick} 
      />
    </Container>
  );
};

// Sub-components for better organization
const LoadingState = () => (
  <Box display="flex" justifyContent="center" my={4}>
    <CircularProgress />
  </Box>
);

const ErrorState = ({ error, onBack }) => (
  <Container maxWidth="md" sx={{ py: 4 }}>
    <Alert severity="error" sx={{ mb: 3 }}>
      {error}
    </Alert>
    <Button startIcon={<ArrowBack />} variant="outlined" onClick={onBack}>
      Back to Home
    </Button>
  </Container>
);

const BackButton = ({ onClick }) => (
  <Button startIcon={<ArrowBack />} variant="outlined" onClick={onClick} sx={{ mb: 3 }}>
    Back
  </Button>
);

const PostHeader = ({ post, isLiked, isBookmarked, onLike, onBookmark, onTagClick }) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="h2" component="h1" gutterBottom>
      {post.title}
    </Typography>
    
    <AuthorInfo author={post.author} createdAt={post.createdAt} readTime={post.readTime} />
    
    <TagsList tags={post.tags} onTagClick={onTagClick} />
    
    <PostActions 
      likes={post.likes} 
      isLiked={isLiked} 
      isBookmarked={isBookmarked}
      onLike={onLike}
      onBookmark={onBookmark}
    />
  </Box>
);

const AuthorInfo = ({ author, createdAt, readTime }) => (
  <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
    <Avatar alt={author?.name} src={author?.avatar} sx={{ width: 56, height: 56, mr: 2 }} />
    <Box>
      <Typography variant="subtitle1">
        {author?.name || 'Anonymous'}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {format(new Date(createdAt), 'MMMM dd, yyyy')} • {readTime} min read
      </Typography>
    </Box>
  </Box>
);

const TagsList = ({ tags, onTagClick }) => (
  <Box sx={{ mb: 3 }}>
    {tags.map((tag) => (
      <Chip
        key={tag}
        label={tag}
        size="small"
        sx={{ mr: 1, mb: 1 }}
        onClick={() => onTagClick(tag)}
      />
    ))}
  </Box>
);

const PostActions = ({ likes, isLiked, isBookmarked, onLike, onBookmark }) => (
  <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
    <IconButton aria-label="like" onClick={onLike}>
      <Favorite color={isLiked ? 'error' : 'inherit'} />
    </IconButton>
    <Typography variant="body2" sx={{ mr: 2 }}>
      {likes} likes
    </Typography>

    <IconButton aria-label="bookmark" onClick={onBookmark}>
      <Bookmark color={isBookmarked ? 'primary' : 'inherit'} />
    </IconButton>

    <IconButton aria-label="share">
      <Share />
    </IconButton>
  </Box>
);

const PostImage = ({ imageUrl, title }) => (
  <Box
    component="img"
    src={imageUrl}
    alt={title}
    sx={{
      width: '100%',
      maxHeight: '500px',
      objectFit: 'cover',
      borderRadius: 2,
      mb: 4
    }}
  />
);

const PostContent = ({ content }) => (
  <Box sx={{ mb: 6 }}>
    <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
  </Box>
);

const CommentsSection = ({ comments, onSubmit }) => (
  <Box sx={{ mb: 6 }}>
    <Typography variant="h5" gutterBottom>
      Comments ({comments.length})
    </Typography>

    <CommentForm onSubmit={onSubmit} />

    <CommentsList comments={comments} />
  </Box>
);

const CommentsList = ({ comments }) => (
  <List>
    {comments.map((comment) => (
      <CommentItem key={comment._id} comment={comment} />
    ))}
  </List>
);

const CommentItem = ({ comment }) => (
  <ListItem alignItems="flex-start">
    <ListItemAvatar>
      <Avatar alt={comment.user?.name} src={comment.user?.avatar} />
    </ListItemAvatar>
    <ListItemText
      primary={comment.user?.name || 'Anonymous'}
      secondary={
        <>
          <Typography component="span" variant="body2" color="text.primary">
            {comment.text}
          </Typography>
          <Typography variant="caption" display="block">
            {format(new Date(comment.createdAt), 'MMM dd, yyyy • h:mm a')}
          </Typography>
        </>
      }
    />
  </ListItem>
);

export default Sentry.withProfiler(PostPage);