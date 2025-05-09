'use client';
import styles from '@/src/app/form.module.css';
import { useState, useEffect, useActionState } from 'react';
export const dynamic = 'force-dynamic';
import { User } from '@/src/data/users';
import IndividualUser from './individualUser';
import { getUsers } from '@/src/app/user/actions';
import Link from 'next/link';
type PublicUser = Omit<User, 'password'>;
const initialState = {
  message: [],
  user: []
};
export default function searchUser() {
  const [sessionUser, setSessionUser] = useState<PublicUser | null>(null);
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState<boolean>(!users);


  async function fetchUserData() {
    let response = await fetch(`/api/user`);
    let data = await response.json();
    let { users } = data;
    console.log(users)
    setUsers(users)
  }

  useEffect(() => {

    async function fetchData() {
      setLoading(true);

      fetchUserData()

      let response = await fetch(`/api/session`);
      let data = await response.json();
      let { session } = data;
      if (session?.userId) {
        const response = await fetch(`/api/user/${session.userId}`);
        const data = await response.json();
        setSessionUser(data.user)
      }
      setLoading(false);


    }
    fetchData();
  }, []);
  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      {users && users.map((user, index) => (
        <Link key={index} href={`/user/${user._id.toString()}`}>
          <IndividualUser
            profileId={user._id.toString()}
            sessionUser={sessionUser}
          />
        </Link>
      ))}
    </div>
  );
}
