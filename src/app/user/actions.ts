'use server';
import { createSession, deleteSession, getSession } from "@/src/lib/session";
import { redirect } from 'next/navigation';
import { registerUser, loginUser, addFriend, acceptRequest } from '@/src/data/users';
import { revalidatePath } from 'next/cache';

interface FormState {
    message: string[] | null;
}

export async function createUser(
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const email = formData.get('email');
    const password = formData.get('password');

    const errors: string[] = [];

    if (typeof firstName !== 'string' || !firstName.trim()) {
        errors.push('First name is required.');
    }

    if (typeof lastName !== 'string' || !lastName.trim()) {
        errors.push('Last name is required.');
    }

    if (typeof email !== 'string' || !email.trim()) {
        errors.push('Email is required.');
    }

    if (typeof password !== 'string' || !password.trim()) {
        errors.push('Password is required.');
    }

    if (errors.length > 0) {
        return { message: errors };
    }

    try {
        await registerUser(
            firstName as string,
            lastName as string,
            email as string,
            password as string
        );
    } catch (error: any) {
        console.log(error)
        return {

            message: [error.message || 'An error occurred during registration.'],
        };
    }
    redirect(`/user/login`); // Navigate to new route

}



export async function login(
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const email = formData.get('email');
    const password = formData.get('password');

    const errors: string[] = [];

    if (typeof email !== 'string' || !email.trim()) {
        errors.push('Email is required.');
    }

    if (typeof password !== 'string' || !password.trim()) {
        errors.push('Password is required.');
    }

    if (errors.length > 0) {
        return { message: errors };
    }
    let user;
    try {
        user = await loginUser(
            email as string,
            password as string
        );
    } catch (error: any) {
        return {
            message: [error.message || 'An error occurred during login.'],
        };
    }
    await createSession(user._id);
    redirect(`/user/${user._id.toString()}`);

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

            message: [error.message || 'An error occurred during registration.'],
            status: null
        };
    }
}

export async function acceptFriend(userId: string, friendId: string) {
    try {
        await acceptRequest(userId, friendId)
    } catch (error: any) {
        return {

            message: [error.message || 'An error occurred during registration.'],
            status: null
        };
    }
}