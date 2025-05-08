'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { SessionPayload } from '@/src/lib/session';

export default function Header() {
    const pathname = usePathname();
    const [session, setSession] = useState<SessionPayload | undefined | null>(null);


    useEffect(() => {

        async function fetchData() {
            const response = await fetch(`/api/session`);
            const data = await response.json();
            let { session } = data;
            setSession(session);

        }

        fetchData();
    }, [pathname]);


    return (
        <header className="bg-gray-800 text-white p-4 shadow-md">
            <h1 className="text-2xl font-bold">The Web</h1>
            <nav className="mt-2">
                <ul className="flex gap-4">
                    <li><Link href={'/'}>Home</Link></li>

                    {session?.userId && (
                        <>
                            <li><Link href={`/user/${session.userId}`}>Profile</Link></li>
                            <li><Link href={`/user`}>Search</Link></li>
                        </>
                    )}
                    {!!!session?.userId && (
                        <>
                            <li><Link href={'/user/login'}>Login</Link></li>
                            <li><Link href={'/user/register'}>Sign Up</Link></li>
                        </>
                    )}

                </ul>
            </nav>
        </header>
    );
}
