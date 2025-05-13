"use client"; 

import { useState, useEffect } from 'react';
import PostCard from '../../components/post'; 
import { Post, User as AuthorUser } from '../../components/post'; 
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
type PublicUser = Omit<User, 'password' | 'email' | 'verified' | 'friends' | 'private' | 'bio'> & { _id: string; name: string; image?: string };

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sessionUser, setSessionUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); 

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const sessionResponse = await fetch(`/api/session`);
        if (!sessionResponse.ok) throw new Error('Failed to fetch session');
        const sessionData = await sessionResponse.json();
        
        let currentUser: PublicUser | null = null;
        if (sessionData.session?.userId) {
          const userResponse = await fetch(`/api/user/${sessionData.session.userId}`);
          if (!userResponse.ok) throw new Error('Failed to fetch user data');
          const userData = await userResponse.json();
          currentUser = userData.user;
        }
        setSessionUser(currentUser);

       const postsResponse = await fetch(`/api/post`); 
       if (!postsResponse.ok) {
         let apiError = 'Failed to fetch posts';
         try {
           const errorData = await postsResponse.json();
           if (errorData.error) { 
               apiError = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
           } else if (errorData.message) { 
               apiError = errorData.message;
           }
         } catch (e) {
         throw new Error(apiError);
         }
       }
       const postsData = await postsResponse.json();
       if (postsData && Array.isArray(postsData.posts)) {
           const fetchedPosts: Post[] = postsData.posts.map((apiPost: any) => ({
               ...apiPost,
               timestamp: new Date(apiPost.timestamp), 
           }));
           setPosts(fetchedPosts);
       } else {
           console.error("API did not return posts in expected format:", postsData);
           setPosts([]);  
       }

      } catch (error) {
        console.error("Error fetching data:", error);
        setSessionUser(null); 
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []); 

  if (loading) {
    return <div className="text-center p-10">Loading feed...</div>;
  }
  if (!sessionUser) {
    return (
      <div className="text-center p-10">
        <p>Please log in to view the feed.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8"> 
      <main className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Friends Feed
        </h1>

        {posts.length === 0 && sessionUser ? ( 
          <p className="text-center text-gray-600">No posts to show right now.</p>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                initialPost={post}
                sessionUser={sessionUser} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}