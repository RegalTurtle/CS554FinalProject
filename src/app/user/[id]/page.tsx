"use client";
import { use } from 'react';
import { useState, useEffect } from 'react';
import { logout } from '@/src/app/user/actions';
import { User } from '@/src/data/users';
import Friend from './friend';
type PublicUser = Omit<User, 'password'>;

export default function profile({ params }: { params: Promise<{ id: string }> }) {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [user, setuser] = useState<PublicUser | null>(null);
    const { id } = use(params);

    async function fetchUserData() {
        const response = await fetch(`/api/user/${id}`);
        const data = await response.json();
        setuser(data.user);
    }

    useEffect(() => {

        async function fetchData() {
            fetchUserData();

            let response = await fetch(`/api/session`);
            let data = await response.json();
            let { session } = data;
            if (session?.userId) {
                setSessionId(session.userId)
            }


        }
        fetchData();
    }, [id]);

    if (!user) {
        return <div>Loading...</div>;
    }
    return (
        <div className="flex items-center space-x-6 p-4 bg-white rounded-xl shadow-md">
            <img
                src={`/${user.image}`}
                alt="User"
                className="w-[120px] h-[120px] object-cover rounded-full"
            />

            <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
                <p className="text-gray-600">
                    Friends: {user.friends?.filter(item => item.status === "friend").length ?? 0}
                </p>
            </div>
            {(sessionId == id) && (
                <div>
                    <button
                        onClick={logout}
                        className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                    >
                        Logout
                    </button>
                </div>
            )}
            {(sessionId != null) && !(sessionId == id) && (
                <Friend profileId={id} sessionId={sessionId} onFriendChange={fetchUserData} />
            )}
        </div>
    );
}
