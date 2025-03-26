import React from 'react';

const PostList = ({ posts }) => {
    return (
        <div>
            {posts.map(post => (
                <div key={post._id}>
                    <h2>{post.title}</h2>
                    <p>{post.content}</p>
                </div>
            ))}
        </div>
    );
};

export default PostList;