'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import LikeButton from "@/src/components/likeButton";
import CommentButton from "@/src/components/commentButton";

interface Post {
  _id: string;
  userId: string;
  title: string;
  image: string; // base64-encoded string directly
  caption: string;
  likedUsers: any[];
  comments: any[];
}

export default function SingularPostPage() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/post/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch post');
        }
        const data = await response.json();
        setPost(data.post);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-600">Error: {error}</p>;
  if (!post) return <p className="p-4">Post not found.</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

      {/* Image Handling */}
      <div className="relative mb-4 w-full h-96">
        <Image
          src={`data:image/jpeg;base64,${post.image}`} // Base64-encoded string
          alt={post.title || 'Post image'}
          layout="fill"
          objectFit="cover"
          className="rounded-md"
          unoptimized // required for base64-encoded images
        />
      </div>

      {/* Caption */}
      <p className="text-gray-700 whitespace-pre-line mb-4">{post.caption}</p>

      {/* Liked Users */}
      {post.likedUsers && post.likedUsers.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Liked by:</h3>
          <ul className="list-disc pl-5">
            {post.likedUsers.map((user, index) => (
              <li key={index}>{user.name || 'Anonymous'}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Comments */}
      {post.comments && post.comments.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Comments:</h3>
          <ul className="list-disc pl-5">
            {post.comments.map((comment, index) => (
              <li key={index}>
                <strong>{comment.userId || 'Anonymous'}:</strong> {comment.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Fallback if no liked users or comments */}
      {post.likedUsers && post.likedUsers.length === 0 && post.comments && post.comments.length === 0 && (
        <p className="text-gray-500">No likes or comments yet.</p>
      )}

      {/* <div>
        <LikeButton postId={post._id} />
        <CommentButton postId={post._id} />
      </div> */}
    </div>
  );
}
