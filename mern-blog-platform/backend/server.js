const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const morgan = require("morgan")
const winston = require("winston")
const dotenv = require("dotenv")
const Sentry = require("@sentry/node")
const { Integrations } = require("@sentry/tracing")

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 5000

// Initialize Sentry for error tracking
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [new Sentry.Integrations.Http({ tracing: true }), new Integrations.Express({ app })],
  tracesSampleRate: 1.0,
})

// Setup Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  defaultMeta: { service: "blog-api" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
})

// If we're not in production, also log to the console
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  )
}

// Middleware
app.use(Sentry.Handlers.requestHandler())
app.use(express.json())
app.use(cors())
app.use(morgan("combined")) // HTTP request logger

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info("MongoDB connected successfully")
  })
  .catch((err) => {
    logger.error("MongoDB connection error:", err)
  })

// Define blog post schema
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    default: "Anonymous",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Post = mongoose.model("Post", postSchema)

// API Routes
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 })
    res.json(posts)
  } catch (error) {
    logger.error("Error fetching posts:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.get("/api/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }
    res.json(post)
  } catch (error) {
    logger.error(`Error fetching post ${req.params.id}:`, error)
    res.status(500).json({ message: "Server error" })
  }
})

app.post("/api/posts", async (req, res) => {
  try {
    const { title, content, author } = req.body
    const newPost = new Post({
      title,
      content,
      author: author || "Anonymous",
    })
    const savedPost = await newPost.save()
    res.status(201).json(savedPost)
  } catch (error) {
    logger.error("Error creating post:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.put("/api/posts/:id", async (req, res) => {
  try {
    const { title, content, author } = req.body
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, { title, content, author }, { new: true })
    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" })
    }
    res.json(updatedPost)
  } catch (error) {
    logger.error(`Error updating post ${req.params.id}:`, error)
    res.status(500).json({ message: "Server error" })
  }
})

app.delete("/api/posts/:id", async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id)
    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" })
    }
    res.json({ message: "Post deleted successfully" })
  } catch (error) {
    logger.error(`Error deleting post ${req.params.id}:`, error)
    res.status(500).json({ message: "Server error" })
  }
})

// Error handler middleware
app.use(Sentry.Handlers.errorHandler())
app.use((err, req, res, next) => {
  logger.error("Unhandled error:", err)
  res.status(500).json({ message: "Something went wrong!" })
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" })
})

// Start the server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})

module.exports = app

