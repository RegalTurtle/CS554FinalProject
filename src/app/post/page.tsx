'use client';
import { useEffect, useState } from 'react';
import { User } from '@/src/data/users';
import { Post } from '@/src/data/posts';
import Image from 'next/image';
import Link from 'next/link';
import LikeButton from '@/src/components/likeButton';

type PublicUser = Omit<User, 'password'>;
export const dynamic = 'force-dynamic';

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [message, setMessage] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch(`/api/post`);
        const data = await response.json();
        console.log(data.posts)
        if (data.posts) {
          setPosts(data.posts.reverse());
          setMessage(null);
        } else {
          setPosts([]);
          setMessage([data.error]);
        }
      } catch (err: any) {
        setMessage(err.message || 'Something went wrong');
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="p-4">
      {loading ? (
        <p>Loading...</p>
      ) : message ? (
        <p>Loading...</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-500 text-center">No posts found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {posts.map((post, idx) => (
            <Link
              key={idx}
              href={`/post/${post._id}`}
              className="block border rounded shadow hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-2">
                <div className="relative w-full h-48 rounded overflow-hidden">
                  <Image
                    src={`data:image/jpeg;base64,${post.image}`}
                    alt={post.title}
                    layout="fill"
                    objectFit="cover"
                    className="rounded"
                  />
                </div>
                <h3 className="mt-2 text-lg font-semibold text-center text-gray-800">
                  {post.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
