'use client';
import { use } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image'; 
import { useEffect, useState } from 'react';
import type { SessionPayload } from '@/src/lib/session';
import CommentSection from './comment-section';
type PublicUser = Omit<User, 'password' | 'email' | 'verified' | 'friends' | 'private' | 'bio'> & { _id: string; name: string; image?: string };

export interface User {
  _id: string;
  name: string;
  email: string;
  image: string;
  verified: boolean;
  friends: User[];
  private: boolean;
  bio: String;
}
  
  export interface Comment {
    id: string;
    author: User;
    text: string;
    timestamp: Date;
  }
  
  export interface Post {
    _id: string;
    userId: string;
    title: string;
    image: Buffer | string;
    caption: string;
    likedUsers: User[];
    comments: Comment[];
  }

  interface PostCardProps {
    initialPost: Post; // Use initialPost to avoid prop mutation issues with state
    sessionUser: PublicUser | null;
  }

  const PostCard: React.FC<PostCardProps> = ({ initialPost, sessionUser }) => {
    console.log("PostCard received initialPost:", initialPost);
    const [post, setPost] = useState<Post>(initialPost);
    const isAuthor = sessionUser && post.userId && sessionUser._id === post.userId;
    const [user, setUser] = useState<PublicUser | null>(null);
    const [loading, setLoading] = useState<boolean>(!user);
    async function fetchUserData() {
        const response = await fetch(`/api/user/${sessionUser?._id}`);
        const data = await response.json();
        setUser(data.user);
    }

    useEffect(() => {

      async function fetchData() {
          setLoading(true);
          fetchUserData();

          let response = await fetch(`/api/session`);
          let data = await response.json();
          let { session } = data;
          if (session?.userId) {
              const response = await fetch(`/api/posts/${session.userId}`);
              const data = await response.json();
          }
          setLoading(false);


      }
      fetchData();
  },);

    const handleAddComment = (postId: string, commentText: string) => {
        if (postId !== post._id) return;

        if (!sessionUser) {
          console.warn("Attempted to comment without being logged in.");
          return;
        }
    
        const newComment: Comment = {
          id: `comment_${Date.now()}_${Math.random()}`,
          author: {
            _id: sessionUser._id,
            name: sessionUser.name,
            image: sessionUser.image || '', 

            email: '',
            verified: false,
            friends: [],
            private: false,
            bio: '',
          },
          text: commentText,
          timestamp: new Date(),
        };

    setPost(prevPost => ({
        ...prevPost,
        comments: [...prevPost.comments, newComment],
      }));
    };
    const postImageUrl = `/api/post/${post._id || post._id}/image`;
    console.log("PostCard: Constructing image URL with post ID:", post._id, "Type:", typeof post._id);
  console.log("Full post object in PostCard:", post);
    return (
      <article className="bg-white shadow-lg rounded-xl overflow-hidden mb-8 border border-gray-200"> {/* Changed bg */}
      <div className="flex flex-col md:flex-row">
        {/* Left Side: Image, Title, Description */}
        <div className="w-full md:w-2/3 lg:w-3/5 p-6">
          <div className="flex items-center mb-4">
            {/* {sessionUser && ( 
              <Image
                src={post.author.image}
                alt={post.author.name}
                width={40}
                height={40}
                className="rounded-full mr-3 object-cover" 
              />
            )} */}
            <div>
              <p className="font-semibold text-gray-800">{post.userId}</p>
              <p className="text-xs text-gray-500">
                {/* {new Date(post.timestamp).toLocaleDateString()} at {new Date(post.timestamp).toLocaleTimeString()} */}
              </p>
            </div>
          </div>

          {isAuthor && (
            <div className="mb-2 text-right">
              <button className="text-xs text-blue-600 hover:underline mr-2">Edit</button>
              <button className="text-xs text-red-600 hover:underline">Delete</button>
            </div>
          )}

          {post.image && (
            <div className="relative w-full aspect-video mb-4 rounded-lg overflow-hidden">
              <Image
                src={postImageUrl}
                alt={post.title || 'Post image'}
                objectFit="cover"
                priority={initialPost._id === 'post1'} 
                width={1600}
                height={900} 
              />
            </div>
          )}

          {post.title && (
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h2>
          )}

          {post.caption && (
            <p className="text-gray-700 text-sm leading-relaxed">{post.caption}</p>
          )}
        </div>

        <CommentSection
          postId={post._id}
          comments={post.comments}
          onAddComment={handleAddComment}
          sessionUser={sessionUser} 
        />
      </div>
    </article>
  );
};

export default PostCard;