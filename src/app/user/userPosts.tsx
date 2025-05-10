"use client";
import { use } from 'react';
import { useState, useEffect } from 'react';
import { getPosts } from '@/src/app/user/actions';
import { User } from '@/src/data/users';
import { Post } from '@/src/data/posts';
import Image from 'next/image';
type PublicUser = Omit<User, 'password'>;
export const dynamic = 'force-dynamic';
export default function UserPosts({ profileUser }: { profileUser: PublicUser }) {
    const [posts, setPosts] = useState<Post[]>([])
    const [message, setMessage] = useState<string[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        async function fetchData() {
            setLoading(true)
            try {
                const response = await fetch(`/api/user/posts/${profileUser._id}`);
                const data = await response.json();
                if (data.posts) {
                    setPosts(data.posts)
                    setMessage(null)
                }
                else {
                    setPosts([])
                    setMessage([data.error])
                }
            } catch (err: any) {
                setMessage(err.message || 'Something went wrong');
            }
            setLoading(false)

        }
        fetchData();
    }, []);


    return (
        <div className="p-4">
            {loading ? (
                <p>Loading...</p>
            ) : message ? (
                <p className="text-red-500">{message}</p>
            ) : posts.length === 0 ? (
                <p className="text-gray-500 text-center">No posts found</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {posts.map((post, idx) => (
                        <div key={idx} className="border rounded shadow p-2">
                            <div className="relative w-full h-48">
                                <Image
                                    src={`data:image/jpeg;base64,${post.image}`}
                                    alt={post.title}
                                    layout="fill"
                                    objectFit="cover"
                                    className="rounded"
                                    unoptimized // required for base64
                                />
                            </div>
                            <h3 className="mt-2 text-lg font-semibold text-center">{post.title}</h3>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

}
