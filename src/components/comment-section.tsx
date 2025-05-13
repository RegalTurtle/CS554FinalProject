'use client';
import React from 'react';
import AddCommentForm from './add-comment';
import {User} from './post'
type PublicUser = Omit<User, 'password' | 'email' | 'verified' | 'friends' | 'private' | 'bio'> & { _id: string; name: string; image?: string };

  export interface Comment {
    id: string;
    author: User;
    text: string;
    timestamp: Date;
  }

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  onAddComment: (postId: string, commentText: string) => void;
  sessionUser: PublicUser | null;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, comments, onAddComment }) => {
  return (
    <div className="w-full md:w-1/3 lg:w-2/5 p-4 border-l border-gray-200 flex flex-col h-full"> {/* h-full to enable scrolling content */}
      <h3 className="text-lg font-semibold mb-3">Comments ({comments.length})</h3>
      
      {/* Comments List - make it scrollable */}
      <div className="flex-grow overflow-y-auto mb-4 pr-2 space-y-3 max-h-[300px] md:max-h-none"> {/* max-h for fixed height scrolling */}
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500">No comments yet.</p>
        ) : (
          comments.slice().sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime()).map((comment) => ( // Sort by oldest first
            <div key={comment.id} className="text-sm bg-gray-50 p-2 rounded-md">
              <div className="flex items-center mb-1">
                {comment.author.image && (
                  <img 
                    src={comment.author.image} 
                    alt={comment.author.name} 
                    className="w-6 h-6 rounded-full mr-2"
                  />
                )}
                <span className="font-semibold">{comment.author.name}</span>
              </div>
              <p className="text-gray-700 ml-8">{comment.text}</p>
              <p className="text-xs text-gray-400 mt-1 ml-8">{comment.timestamp.toLocaleTimeString()} - {comment.timestamp.toLocaleDateString()}</p>
            </div>
          ))
        )}
      </div>

      <AddCommentForm postId={postId} onAddComment={onAddComment} />
    </div>
  );
};

export default CommentSection;