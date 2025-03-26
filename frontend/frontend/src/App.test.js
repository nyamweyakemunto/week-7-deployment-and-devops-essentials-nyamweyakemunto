/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App'; // Adjust path as necessary
import axios from 'axios';

// Mock the axios module
jest.mock('axios');

describe('App Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the header', () => {
        render(<App />);
        const headerElement = screen.getByText(/my blog/i);
        expect(headerElement).toBeInTheDocument();
    });

    it('fetches and displays posts', async () => {
        const posts = [
            { _id: '1', title: 'First Post', content: 'This is the content of the first post.' },
            { _id: '2', title: 'Second Post', content: 'This is the content of the second post.' },
        ];

        axios.get.mockResolvedValueOnce({ data: posts });

        render(<App />);

        // Wait until the posts are rendered
        await waitFor(() => {
            const firstPost = screen.getByText(/first post/i);
            const secondPost = screen.getByText(/second post/i);
            expect(firstPost).toBeInTheDocument();
            expect(secondPost).toBeInTheDocument();
        });
    });

    it('creates a new post', async () => {
        // Mock the API response for fetching posts
        const posts = [
            { _id: '1', title: 'First Post', content: 'This is the content of the first post.' },
        ];
        axios.get.mockResolvedValueOnce({ data: posts });

        render(<App />);

        // Mock the API response for creating a new post
        axios.post.mockResolvedValueOnce({ data: { _id: '2', title: 'New Post', content: 'This is a new post.' } });

        // Simulate user interaction to create a new post
        fireEvent.click(screen.getByText(/create post/i));

        // Fill out the form
        fireEvent.change(screen.getByPlaceholderText(/post title/i), { target: { value: 'New Post' } });
        fireEvent.change(screen.getByPlaceholderText(/post content/i), { target: { value: 'This is a new post.' } });
        fireEvent.click(screen.getByText(/create post/i));

        // Wait for the new post to be added to the DOM
        await waitFor(() => {
            const newPost = screen.getByText(/new post/i);
            expect(newPost).toBeInTheDocument();
        });
    });
});