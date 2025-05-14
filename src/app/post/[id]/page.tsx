'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import LikeButton from '@/src/components/likeButton';
import CommentButton from '@/src/components/commentButton';

interface Post {
  _id: string;
  userId: string;
  title: string;
  image: string;
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
        if (!response.ok) throw new Error('Failed to fetch post');
        const data = await response.json();
        setPost(data.post.post);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading)
    return <p className="p-6 text-center text-gray-600">Loading...</p>;
  if (error)
    return <p className="p-6 text-center text-red-600">Error: {error}</p>;
  if (!post)
    return <p className="p-6 text-center text-gray-600">Post not found.</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Title */}
      <h1 className="text-3xl font-extrabold text-gray-900">{post.title}</h1>

      {/* Image */}
      <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden shadow-md">
        <Image
          src={`data:image/jpeg;base64,${post.image}`}
          alt={post.title || 'Post image'}
          layout="fill"
          objectFit="cover"
          className="rounded-md"
          unoptimized
        />
      </div>

      {/* Caption */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Caption:</h2>
        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
          {post.caption}
        </p>
      </div>

      {/* Likes */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Liked by:</h3>
        {post.likedUsers?.length > 0 ? (
          <ul className="pl-5 list-disc space-y-1 text-gray-700">
            {post.likedUsers.map((user, i) => (
              <li key={i} className="hover:text-blue-600 transition-colors">
                {user.name || 'Anonymous'}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No likes yet.</p>
        )}
      </div>

      {/* Comments */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Comments:</h3>
        {post.comments?.length > 0 ? (
          <ul className="pl-5 list-disc space-y-1 text-gray-700">
            {post.comments.map((comment, i) => (
              <li key={i}>
                <strong>{comment.user.name || 'Anonymous'}:</strong> {comment.text}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No comments yet.</p>
        )}
      </div>

      <div>
        <LikeButton postId={post._id} setPost={setPost} />
        <CommentButton postId={post._id} setPost={setPost} />
      </div>
    </div>
  );
}
