'use client';
import { use } from 'react';
import { useState, useEffect } from 'react';
import { logout } from '@/src/app/user/actions';
import { useRouter } from 'next/navigation';
import { User } from '@/src/data/users';
import Friend from '@/src/app/user/friend';
import Image from 'next/image';
type PublicUser = Omit<User, 'password'>;
export const dynamic = 'force-dynamic';
export default function IndividualUser({
    profileId,
    sessionUser,
    updateFriends,
}: {
    profileId: string;
    sessionUser: PublicUser | null;
    updateFriends?: () => void;
}) {
    const router = useRouter();
    const [userData, setUserData] = useState<PublicUser | null>(null);
    const [loading, setLoading] = useState<boolean>(!userData);
    const [error, setError] = useState<string | null>(null);

    async function updateUserData() {
        if (updateFriends) {
            updateFriends();
        } else {
            const response = await fetch(`/api/user/${profileId}`);
            const data = await response.json();
            setUserData(data.user);
        }
    }

    function editRouter() {
        router.push(`/user/edit`);
    }

    useEffect(() => {
        if (!userData) {
            async function fetchData() {
                try {
                    setLoading(true);
                    const response = await fetch(`/api/user/${profileId}`);
                    const data = await response.json();
                    setUserData(data.user);
                    setError(null);
                } catch (err) {
                    setError('Failed to fetch user data.');
                } finally {
                    setLoading(false);
                }
            }
            fetchData();
        }
    }, [profileId]);

    if (loading || !userData) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error ?? 'User not found.'}</div>;
    }

    return (
        <div className="flex items-center space-x-6 p-4 bg-white rounded-xl shadow-md">
            {userData.image && (
                <Image src={userData.image} alt="User" width={120} height={120} className="object-cover rounded-full w-[120px] h-[120px]" />
            )}

            <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800">{userData.name}</h2>
                {userData.bio && <p className="text-gray-500 italic">{userData.bio}</p>}
                <p className="text-gray-600">
                    Friends:{' '}
                    {userData.friends?.filter((item) => item.status === 'friend')
                        .length ?? 0}
                </p>
            </div>
            {sessionUser && sessionUser._id == profileId && (
                <>
                    <div>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                editRouter();
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                        >
                            Edit Profile
                        </button>
                    </div>
                    <div>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                logout();
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                        >
                            Logout
                        </button>
                    </div>
                </>
            )}
            {sessionUser &&
                sessionUser._id != null &&
                !(sessionUser._id == profileId) && (
                    <Friend
                        profileId={profileId}
                        sessionUser={sessionUser}
                        onFriendChange={updateUserData}
                    />
                )}
        </div>
    );
}
