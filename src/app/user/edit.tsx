'use client';
import { use } from 'react';
import { useState, useEffect, useActionState } from 'react';
import styles from '@/src/app/form.module.css';
import { editProfile } from '@/src/app/user/actions';
import { User, Friend } from '@/src/data/users';
import UserPosts from '@/src/app/user/userPosts';
import IndividualUser from '@/src/app/user/individualUser';
import Link from 'next/link';
type PublicUser = Omit<User, 'password'>;
export const dynamic = 'force-dynamic';
const initialState = {
  message: [] as any[]
};
export default function UserEditForm({ sessionUser }: { sessionUser: PublicUser | null }) {
  const [state, formAction] = useActionState(editProfile, initialState);

  return (
    <div>
      {state && state.message && (
        <ul>
          {state.message.map((msg, index) => (
            <li className='error' key={index}>{msg}</li>
          ))}
        </ul>
      )}
      <form action={formAction} className={styles.myform}>

        <div className='form-group'>
          <label className={styles.myLabel}>
            Name:
            <input className={styles.myInput} name='firstName' type='text' />
          </label>
          <br />
          <label className={styles.myLabel}>
            Password:
            <input className={styles.myInput} name='password' type='password' />
          </label>
        </div>
        <button type='submit' className={styles.myButton}>Login</button>
      </form>
    </div>
  );
}