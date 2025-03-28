import { rest } from 'msw';

export const handlers = [
  rest.get(`${process.env.REACT_APP_API_URL}/posts`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ posts: [] })
    );
  }),
  // Add more API mocks as needed
];