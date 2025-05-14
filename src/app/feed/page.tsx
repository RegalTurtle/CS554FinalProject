'use client';
import { useEffect, useState } from 'react';
import { User } from '@/src/data/users';
import { Post } from '@/src/data/posts';
import Image from 'next/image';
import Link from 'next/link';
import LikeButton from '@/src/components/likeButton';
import CommentButton from '@/src/components/commentButton';

type PublicUser = Omit<User, 'password'>;
export const dynamic = 'force-dynamic';

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [post, setPost] = useState<Post | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleCommentsPostId, setVisibleCommentsPostId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [postRes, userRes] = await Promise.all([
          fetch(`/api/post/`),
          fetch(`/api/user/`),
        ]);
        if (!postRes.ok) throw new Error('Failed to fetch post');
        if (!userRes.ok) throw new Error('Failed to fetch users');
        const postData = await postRes.json();
        const userData = await userRes.json();
        console.log(userData);

        if (postData) {
          setPosts(postData.posts.reverse());
          setMessage(null);
        } else {
          setPosts([]);
          setMessage([userData.error]);
        }
        if (userData) {
          setUsers(userData.users.reverse());
          console.log(userData);
          setMessage(null);
        } else {
          setUsers([]);
          setMessage([userData.error]);
        }
      } catch (err: any) {
        setMessage(err.message || 'Something went wrong');
        setPosts([]); // Clear posts on error
        setUsers([]); // Clear users on error
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const toggleComments = (postId: string) => {
    setVisibleCommentsPostId(prevId => (prevId === postId ? null : postId));
  };

  if (loading) return <div className="p-4 text-center">Loading posts...</div>;
  if (message && message.length > 0) return <div className="p-4 text-center text-red-500">Error: {message[0]}</div>;
  if (posts.length === 0) return <p className="p-4 text-gray-500 text-center">No posts found</p>;

  return (
    <div className="container mx-auto p-4 space-y-8 max-w-5xl"> {/* Wider max-width for 3 columns */}
      {posts.map(post => {
        const author = users.find(user => user._id === post.userId);
        const areCommentsVisible = visibleCommentsPostId === post._id;

        return (
          <article key={post._id.toString()} className="flex flex-col md:flex-row bg-white border rounded-lg shadow-md overflow-hidden">
            
            <div className="p-4 md:w-1/5 lg:w-1/6 border-b md:border-b-0 md:border-r flex flex-col items-center md:items-start text-center md:text-left">
              {author ? (
                <Link href={`/user/${author._id}`} className="flex flex-col items-center group mb-2">
                  {author.image && (
                    <Image
                      src={author.image}
                      alt={author.name || 'Author avatar'}
                      width={64} 
                      height={64}
                      className="rounded-full object-cover mb-2"
                    />
                  )}
                  {!author.image && (
                    <div className="w-16 h-16 bg-gray-300 rounded-full mb-2 flex items-center justify-center text-gray-600 text-2xl">
                      {author.name ? author.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                  <span className="font-semibold text-gray-800 group-hover:underline break-all">{author.name}</span>
                </Link>
              ) : (
                <div className="flex flex-col items-center mb-2">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mb-2"></div>
                  <span className="text-sm text-gray-500">Unknown Author</span>
                </div>
              )}
              {/* <p className="text-xs text-gray-500 mt-auto self-center md:self-start">{new Date(post.timestamp).toLocaleString()}</p> */}
            </div>

            <div className="p-4 flex-grow md:w-3/5 lg:w-3/6"> 
              <Link href={`/post/${post._id}`} className="block mb-2">
                <h2 className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
              </Link>

              {post.image && (
                <Link href={`/post/${post._id}`} className="block my-4">
                  <div
                    className="relative w-full aspect-[16/10] rounded-md overflow-hidden bg-gray-100" // Lighter bg for letterbox
                  >
                    <Image
                      src={`data:image/jpeg;base64,${post.image}`}
                      alt={post.title || 'Post image'}
                      layout="fill"
                      objectFit="contain" 
                    />
                  </div>
                </Link>
              )}
              
              {post.caption && (
                <p className="text-gray-700 mt-2 mb-4 whitespace-pre-line">{post.caption}</p>
              )}

              <div className="mt-4 flex items-center space-x-4">
                <button className="text-sm text-blue-600 hover:underline">Like (WIP)</button>
                <button 
                  onClick={() => toggleComments(post._id.toString())}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {areCommentsVisible ? 'Hide' : 'View'} Comments (click to view) ({post.comments?.length || 0})
                </button>
              </div>
            </div>
            {areCommentsVisible && (
              <div className="p-4 md:w-1/5 lg:w-2/6 border-t md:border-t-0 md:border-l bg-gray-50 overflow-y-auto max-h-[400px] md:max-h-none"> {/* Added max-h for mobile scroll */}
                <h3 className="text-md font-semibold text-gray-700 mb-3">Comments</h3>
                {post.comments && post.comments.length > 0 ? (
                  <ul className="space-y-3">
                    {post.comments.map((comment, i) => {
                      const commentAuthor = users.find(u => u._id === comment.user?._id) || comment.user; // Find full user or use partial from comment
                      return (
                        <li key={comment.user.toString() || i} className="text-sm">
                          <div className="flex items-start space-x-2">
                            {commentAuthor?.image && (
                                <Image src={commentAuthor.image} alt={commentAuthor.name || ''} width={24} height={24} className="rounded-full object-cover"/>
                            )}
                            {!commentAuthor?.image && (
                                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs">
                                    {commentAuthor?.name ? commentAuthor.name.charAt(0).toUpperCase() : '?'}
                                </div>
                            )}
                            <div>
                                <span className="font-semibold text-gray-800">{commentAuthor?.name || 'User'}</span>
                                <p className="text-gray-600">{comment.text}</p>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No comments to display.</p>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
