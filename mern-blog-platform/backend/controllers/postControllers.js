const Post = require('../models/Post');
const { logger } = require('../../middlewares/logger');

// @desc    Get all posts
// @route   GET /api/posts
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a post
// @route   POST /api/posts
const createPost = async (req, res) => {
  try {
    const post = await Post.create(req.body);
    res.status(201).json(post);
  } catch (err) {
    logger.error(err.message);
    res.status(400).json({ message: 'Invalid post data' });
  }
};

module.exports = {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost
};