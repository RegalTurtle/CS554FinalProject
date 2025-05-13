'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { SessionPayload } from '@/src/lib/session';
import Image from "next/image";
export default function Home() {
  const [session, setSession] = useState<SessionPayload | undefined | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function fetchData() {
      const response = await fetch(`/api/session`);
      const data = await response.json();
      let { session } = data;
      setSession(session);
      setLoading(false)
    }

    fetchData();
  }, []);
  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <main className="min-h-screen bg-white text-gray-800 flex flex-col items-center justify-center px-6 py-16">
      <section className="max-w-4xl text-center">
        {/* <h1 className="text-5xl font-extrabold mb-6">
          Welcome to
        </h1> */}
        <div className="flex justify-center items-center w-full">
          <Image alt="A spider web divided horizontally in the middle with the words THE WEB in blue filling the gap"
          src="/the_web.png" />
        </div>
        
        <p className="text-lg mb-8 leading-relaxed">
          <strong>The Web</strong> is a social media platform designed to help
          you share life’s moments and connect with others. Create a
          personalized profile with your name, description, and profile picture
          to showcase who you are.
        </p>
        <p className="text-lg mb-8 leading-relaxed">
          Upload posts with titles, images, and captions to express your ideas,
          creativity, or daily thoughts. Engage with others by adding friends,
          viewing their profiles, and commenting on posts — all in one vibrant,
          growing community.
        </p>
        <div className="flex justify-center gap-4 mt-6">

          {session?.userId && (
            <Link
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
              href={`/user/${session.userId}`}
            >
              Profile
            </Link>
          )}
          {!session?.userId && (
            <>
              <Link
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
                href={'/user/login'}
              >
                Login
              </Link>
              <Link
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-300 transition"
                href={'/user/register'}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </section>
    </main >
  );
}
