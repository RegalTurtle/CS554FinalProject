'use server';
import { createSession, deleteSession, getSession } from "@/src/lib/session";
import { redirect } from 'next/navigation';
import { registerUser, loginUser, addFriend, acceptRequest, getAllUsers, updateUser } from '@/src/data/users';
import { getAllPostsByUser } from "@/src/data/posts";
import { revalidatePath } from 'next/cache';

export async function editProfile(data: any) {
    let session = await getSession()
    let userId: string
    if (session?.userId) {
        userId = session.userId.toString()
    } else {
        return {

            error: 'User not signed in',
        };
    }
    try {
        await updateUser(userId, data)
    } catch (error: any) {
        return {

            error: error.message || 'Could not update profile',
        };
    }
}

export async function createUser(
    {
        firstName,
        lastName,
        email,
        password
    }: {
        firstName: string,
        lastName: string,
        email: string,
        password: string
    }
) {

    let error: string;

    if (typeof firstName !== 'string' || !firstName.trim()) {
        error = 'First name is required.';
        return { error: error };
    }

    if (typeof lastName !== 'string' || !lastName.trim()) {
        error = ('Last name is required.');
        return { error: error };
    }

    if (typeof email !== 'string' || !email.trim()) {
        error = ('Email is required.');
        return { error: error };
    }

    if (typeof password !== 'string' || !password.trim()) {
        error = ('Password is required.');
        return { error: error };
    }

    try {
        await registerUser(
            firstName as string,
            lastName as string,
            email as string,
            password as string
        );
    } catch (error: any) {
        return {

            error: error.message || 'An error occurred during registration.',
        };
    }

}



export async function login(
    {
        email,
        password
    }: {
        email: string,
        password: string
    }
) {

    let error: string;

    if (typeof email !== 'string' || !email.trim()) {
        error = ('Email is required.');
        return { error: error };
    }

    if (typeof password !== 'string' || !password.trim()) {
        error = ('Password is required.');
        return { error: error };

    }
    let user;
    try {
        user = await loginUser(
            email as string,
            password as string
        );
        await createSession(user._id);
    } catch (error: any) {
        return {
            error: error.message || 'An error occurred during login.',
        };
    }

}


export async function logout() {
    await deleteSession();
    redirect("/user/login");
}

export async function requestFriend(userId: string, friendId: string) {
    try {
        await addFriend(userId, friendId)
    } catch (error: any) {
        return {

            error: error.message || 'An error occurred during registration.',
        };
    }
}

export async function acceptFriend(userId: string, friendId: string) {
    try {
        await acceptRequest(userId, friendId)
    } catch (error: any) {
        return {

            error: error.message || 'An error occurred during registration.',
        };
    }
}