"use client";
import { use } from 'react';
import { useState, useEffect } from 'react';
import { logout } from '@/src/app/user/actions';
import User from '@/src/data/users';
import styles from '@/src/app/form.module.css';
type PublicUser = Omit<User, 'password'>;
export default function profile({ params }: { params: Promise<{ id: string }> }) {
    const [user, setuser] = useState<PublicUser | null>(null);
    const { id } = use(params);
    useEffect(() => {

        async function fetchData() {
            const response = await fetch(`/api/user/${id}`);
            const data = await response.json();
            let { user } = data;
            console.log(user)
            setuser(user);
        }
        fetchData();
    }, []);
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
                    Friends: {user.friends?.length ?? 0}
                </p>
            </div>
            <div>
                <button
                    onClick={logout}
                    className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
