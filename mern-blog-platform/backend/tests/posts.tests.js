const request = require("supertest")
const mongoose = require("mongoose")
const app = require("../server")

// Mock MongoDB connection
jest.mock("mongoose", () => {
  const actualMongoose = jest.requireActual("mongoose")
  return {
    ...actualMongoose,
    connect: jest.fn().mockResolvedValue(),
  }
})

// Mock Post model
jest.mock("../models/Post", () => {
  return {
    find: jest.fn().mockResolvedValue([
      {
        _id: "1",
        title: "Test Post",
        content: "Test Content",
        author: "Test Author",
        createdAt: new Date(),
      },
    ]),
    findById: jest.fn().mockImplementation((id) => {
      if (id === "1") {
        return Promise.resolve({
          _id: "1",
          title: "Test Post",
          content: "Test Content",
          author: "Test Author",
          createdAt: new Date(),
        })
      }
      return Promise.resolve(null)
    }),
    prototype: {
      save: jest.fn().mockResolvedValue({
        _id: "2",
        title: "New Post",
        content: "New Content",
        author: "New Author",
        createdAt: new Date(),
      }),
    },
  }
})

describe("Post API endpoints", () => {
  afterAll(() => {
    app.close()
  })

  describe("GET /api/posts", () => {
    it("should return all posts", async () => {
      const res = await request(app).get("/api/posts")
      expect(res.statusCode).toEqual(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0].title).toEqual("Test Post")
    })
  })

  describe("GET /api/posts/:id", () => {
    it("should return a single post", async () => {
      const res = await request(app).get("/api/posts/1")
      expect(res.statusCode).toEqual(200)
      expect(res.body.title).toEqual("Test Post")
    })

    it("should return 404 if post not found", async () => {
      const res = await request(app).get("/api/posts/999")
      expect(res.statusCode).toEqual(404)
    })
  })

  describe("POST /api/posts", () => {
    it("should create a new post", async () => {
      const res = await request(app).post("/api/posts").send({
        title: "New Post",
        content: "New Content",
        author: "New Author",
      })
      expect(res.statusCode).toEqual(201)
      expect(res.body.title).toEqual("New Post")
    })
  })
})

