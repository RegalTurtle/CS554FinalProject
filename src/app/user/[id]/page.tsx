"use client";
import { use } from 'react';
import { useState, useEffect } from 'react';
import { getPosts } from '@/src/app/user/actions';
import { User } from '@/src/data/users';
import UserPosts from '../userPosts';
import IndividualUser from '../individualUser';
import Link from 'next/link';
type PublicUser = Omit<User, 'password'>;
export const dynamic = 'force-dynamic';
export default function profile({ params }: { params: Promise<{ id: string }> }) {
    const [sessionUser, setSessionUser] = useState<PublicUser | null>(null);
    const [user, setUser] = useState<PublicUser | null>(null);
    const [loading, setLoading] = useState<boolean>(!user);
    const { id } = use(params);
    async function fetchUserData() {
        const response = await fetch(`/api/user/${id}`);
        const data = await response.json();
        setUser(data.user);
    }

    useEffect(() => {

        async function fetchData() {
            setLoading(true);
            fetchUserData();

            let response = await fetch(`/api/session`);
            let data = await response.json();
            let { session } = data;
            if (session?.userId) {
                const response = await fetch(`/api/user/${session.userId}`);
                const data = await response.json();
                setSessionUser(data.user)
            }
            else {
                setSessionUser(null)
            }
            setLoading(false);


        }
        fetchData();
    }, [id]);

    const handleTabClick = (tabId: string) => {
        const tabs = document.querySelectorAll("[data-tab]");
        const contents = document.querySelectorAll("[data-content]");

        tabs.forEach(tab => {
            if ((tab as HTMLElement).dataset.tab === tabId) {
                tab.classList.add("border-b-2", "border-blue-600", "text-blue-600");
                tab.classList.remove("text-gray-600");
            } else {
                tab.classList.remove("border-b-2", "border-blue-600", "text-blue-600");
                tab.classList.add("text-gray-600");
            }
        });

        contents.forEach(content => {
            if ((content as HTMLElement).dataset.content === tabId) {
                (content as HTMLElement).classList.remove("hidden");
            } else {
                (content as HTMLElement).classList.add("hidden");
            }
        });
    };

    let mapFriends = (<div>No Friends available</div>);

    if (user?.friends) {
        const friendsList = user.friends.filter((item: { status: string }) => item.status === "friend");
        if (friendsList.length > 0) {
            mapFriends = (
                <div className="grid gap-4 mt-4">
                    {friendsList.map((friend, index) => (
                        <Link key={index} href={`/user/${friend.userId.toString()}`}>
                            <IndividualUser
                                profileId={friend.userId.toString()}
                                sessionUser={sessionUser}
                            />
                        </Link>
                    ))}
                </div>
            );
        }
    }

    let mapPending = (<div>No Pending Friends</div>);

    if (user?.friends) {
        const friendsList = user.friends.filter((item: { status: string }) => item.status === "pending");
        if (friendsList.length > 0) {
            mapPending = (
                <div className="grid gap-4 mt-4">
                    {friendsList.map((friend, index) => (
                        <Link key={index} href={`/user/${friend.userId.toString()}`}>
                            <IndividualUser
                                profileId={friend.userId.toString()}
                                sessionUser={sessionUser}
                            />
                        </Link>
                    ))}
                </div>
            );
        }
    }

    let mapRequest = (<div>No Requests to Accept</div>);

    if (user?.friends) {
        const friendsList = user.friends.filter((item: { status: string }) => item.status === "acceptRequest");
        if (friendsList.length > 0) {
            mapRequest = (
                <div className="grid gap-4 mt-4">
                    {friendsList.map((friend, index) => (
                        <Link key={index} href={`/user/${friend.userId.toString()}`}>
                            <IndividualUser
                                profileId={friend.userId.toString()}
                                sessionUser={sessionUser}
                            />
                        </Link>
                    ))}
                </div>
            );
        }
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-6">
            <IndividualUser profileId={id} sessionUser={sessionUser} />


            <div className="w-full mt-6">
                <div className="flex border-b border-gray-200">
                    <button
                        data-tab="posts"
                        onClick={() => handleTabClick("posts")}
                        className="py-2 px-4 text-sm font-semibold text-blue-600 border-b-2 border-blue-600"
                    >
                        Posts
                    </button>
                    <button
                        data-tab="friends"
                        onClick={() => handleTabClick("friends")}
                        className="py-2 px-4 text-sm font-semibold text-gray-600"
                    >
                        Friends
                    </button>
                    {sessionUser && (sessionUser._id == id) && (<button
                        data-tab="pending"
                        onClick={() => handleTabClick("pending")}
                        className="py-2 px-4 text-sm font-semibold text-gray-600"
                    >
                        Pending Friends
                    </button>)}
                    {sessionUser && (sessionUser._id == id) && (<button
                        data-tab="acceptRequest"
                        onClick={() => handleTabClick("acceptRequest")}
                        className="py-2 px-4 text-sm font-semibold text-gray-600"
                    >
                        Accept Requests
                    </button>)}
                </div>

                <div className="mt-4">
                    <div data-content="posts">
                        {user && (
                            <UserPosts profileUser={user} />
                        )}
                    </div>
                    <div data-content="friends" className="hidden">
                        {mapFriends}
                    </div>
                    {sessionUser && (sessionUser._id == id) && (
                        <div data-content="pending" className="hidden">
                            {mapPending}
                        </div>
                    )}
                    {sessionUser && (sessionUser._id == id) && (
                        <div data-content="acceptRequest" className="hidden">
                            {mapRequest}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
