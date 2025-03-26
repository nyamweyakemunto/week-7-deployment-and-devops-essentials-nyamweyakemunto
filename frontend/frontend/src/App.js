import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import axios from 'axios';
import PostList from './components/PostList';
import CreatePost from './components/CreatePost';
import Header from './components/Header';

const App = () => {
    const [posts, setPosts] = useState([]);

    // Fetch blog posts from the backend API
    const fetchPosts = async () => {
        try {
            const response = await axios.get('https://your-deployed-backend-url/api/posts'); // Replace with your backend API URL
            setPosts(response.data);
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    };

    // Use useEffect to fetch posts on component mount
    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <Router>
            <div>
                <Header />
                <Switch>
                    <Route path="/" exact>
                        <PostList posts={posts} />
                    </Route>
                    <Route path="/create">
                        <CreatePost onPostCreated={fetchPosts} />
                    </Route>
                </Switch>
            </div>
        </Router>
    );
};

export default App;