"use client";

import React, { useState } from 'react';

export interface User {
    id: string;
    name: string;
    image?: string; 
  }

export interface Comment {
    id: string;
    author: User;
    text: string;
    timestamp: Date;
  }

interface AddCommentFormProps {
  postId: string;
  onAddComment: (postId: string, commentText: string) => void;
}

const AddCommentForm: React.FC<AddCommentFormProps> = ({ postId, onAddComment }) => {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onAddComment(postId, commentText.trim());
      setCommentText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-auto pt-4 border-t"> {/* mt-auto pushes it to bottom if CommentSection is flex-col */}
      <textarea
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder="Write a comment..."
        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        rows={2}
      />
      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        disabled={!commentText.trim()}
      >
        Post Comment
      </button>
    </form>
  );
};

export default AddCommentForm; 