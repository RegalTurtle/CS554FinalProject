'use client';
import styles from '@/src/app/form.module.css';
import { useActionState } from 'react';
import { createUser } from '@/src/app/user/actions';
export const dynamic = 'force-dynamic';
const initialState = {
  message: null
};

export function AddUserForm() {
  const [state, formAction] = useActionState(createUser, initialState);

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
            First Name:
            <input className={styles.myInput} name='firstName' type='text' />
          </label>
          <br />
          <label className={styles.myLabel}>
            Last Name:
            <input className={styles.myInput} name='lastName' type='text' />
          </label>
          <br />
          <label className={styles.myLabel}>
            Email:
            <input className={styles.myInput} name='email' type='email' />
          </label>
          <br />
          <label className={styles.myLabel}>
            Password:
            <input className={styles.myInput} name='password' type='password' />
          </label>
        </div>
        <button type='submit' className={styles.myButton}>Sign Up</button>
      </form>
    </div>
  );
}
