'use server';
import { redirect } from 'next/navigation';
import { registerUser, loginUser } from '../data/users';
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
        return {
            message: [error.message || 'An error occurred during registration.'],
        };
    } finally {
        revalidatePath('/user');
        redirect(`/user/login`); // Navigate to new route
    }
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

    try {
        await loginUser(
            email as string,
            password as string
        );
    } catch (error: any) {
        return {
            message: [error.message || 'An error occurred during registration.'],
        };
    } finally {
        redirect(`/user/login`); // Navigate to new route
    }
}