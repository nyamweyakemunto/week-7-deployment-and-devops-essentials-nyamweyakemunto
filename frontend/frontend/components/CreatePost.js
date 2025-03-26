import React, { useState } from 'react';
import axios from 'axios';

const CreatePost = ({ onPostCreated }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://your-deployed-backend-url/api/posts', { title, content }); // Replace with your backend API URL
            setTitle('');
            setContent('');
            onPostCreated(); // Fetch posts after creating a new one
        } catch (error) {
            console.error("Error creating post:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Post Title" 
                required 
            />
            <textarea 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                placeholder="Post Content" 
                required 
            ></textarea>
            <button type="submit">Create Post</button>
        </form>
    );
};

export default CreatePost;