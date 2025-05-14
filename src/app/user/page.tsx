'use client';
import styles from '@/src/app/form.module.css';
import { useState, useEffect, useMemo } from 'react';
export const dynamic = 'force-dynamic';
import { User } from '@/src/data/users';
import IndividualUser from './individualUser';
import Link from 'next/link';
type PublicUser = Omit<User, 'password'>;
export default function searchUser() {
  const [sessionUser, setSessionUser] = useState<PublicUser | null>(null);
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState<boolean>(!users);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRegexValid, setIsRegexValid] = useState(true);

  async function fetchUserData() {
    let response = await fetch(`/api/user`);
    let data = await response.json();
    let { users } = data;
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

  const regex = useMemo(() => {
    try {
      setIsRegexValid(true);
      return new RegExp(searchQuery, 'i');
    } catch {
      setIsRegexValid(false);
      return null;
    }
  }, [searchQuery]);

  const filteredUsers = useMemo(() => {
    if (!regex) return users;
    return users.filter(user => regex.test(user.name ?? ''));
  }, [regex, users]);


  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <input
        type="text"
        placeholder="Search Users"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className="mb-4 w-full p-2 border border-gray-300 rounded"
      />

      {!isRegexValid && (
        <p className="text-red-500 text-sm mb-2">Invalid regular expression</p>
      )}

      {filteredUsers.length === 0 && (
        <p className="text-gray-500">No users match your search.</p>
      )}

      {filteredUsers.map(user => (
        <Link key={user._id.toString()} href={`/user/${user._id.toString()}`}>
          <IndividualUser
            profileId={user._id.toString()}
            sessionUser={sessionUser}
          />
        </Link>
      ))}
    </div>
  );
}
