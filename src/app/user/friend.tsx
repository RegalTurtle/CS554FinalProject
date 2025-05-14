"use client";
import { useState, useEffect } from 'react';
import { requestFriend, acceptFriend } from '@/src/app/user/actions';
import type { Friend as FriendType } from '@/src/data/users';
import { useActionState } from 'react';
export const dynamic = 'force-dynamic';
import { User } from '@/src/data/users';
type PublicUser = Omit<User, 'password'>;


export default function Friend({ profileId, sessionUser, onFriendChange }: { profileId: string, sessionUser: PublicUser, onFriendChange: () => void }) {
    const [status, setStatus] = useState<string | null>(null)
    const [message, setMessage] = useState<string[] | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {

        async function fetchData() {
            let friend = sessionUser.friends?.filter((item: any) => item.userId === profileId)
            if (friend.length === 1) {
                setStatus(friend[0].status)
            }
            setLoading(false)

        }
        fetchData();
    }, []);

    const handleRequestFriend = async () => {
        try {
            const result = await requestFriend(sessionUser._id.toString(), profileId);
            if (result) {
                setMessage(result.error);
            }
            else {
                setStatus("pending")
            }
        } catch (err: any) {
            setMessage(err.message || 'Something went wrong');
        }

    };
    const handleAcceptFriend = async () => {
        try {
            const result = await acceptFriend(sessionUser._id.toString(), profileId);
            if (result) {
                setMessage(result.error);
            }
            else {
                setStatus("friend")
                onFriendChange()
            }
        } catch (err: any) {
            setMessage(err.message || 'Something went wrong');
        }

    };

    let statusElem = (<></>)
    if (loading) {
        return (<></>);
    }
    else {
        if (status != null) {
            if (status == "acceptRequest") {
                statusElem = (
                    <div>
                        <button
                            onClick={(e) => { e.preventDefault(); handleAcceptFriend() }}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                        >
                            Accept Request
                        </button>
                    </div>)
            }
            else if (status === "friend") {
                statusElem = (
                    <div className="flex items-center space-x-4 p-3 bg-green-100 text-green-800 rounded-xl shadow-sm border border-green-300">
                        Friend
                    </div>
                );
            } else if (status === "pending") {
                statusElem = (
                    <div className="flex items-center space-x-4 p-3 bg-yellow-100 text-yellow-800 rounded-xl shadow-sm border border-yellow-300">
                        Pending
                    </div>
                );
            }

        }
        else {
            statusElem = (<div>
                <button
                    onClick={(e) => { e.preventDefault(); handleRequestFriend() }}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                >
                    Add Friend
                </button>
            </div>)
        }

        return (
            <div>
                {message && (
                    <ul>
                        {message.map((msg, index) => (
                            <li className='error' key={index}>{msg}</li>
                        ))}
                    </ul>
                )}

                {statusElem}
            </div>
        );
    }
}
