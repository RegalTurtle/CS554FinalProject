import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { users } from '@/src/config/mongoCollections.js';
import { env } from '@/src/config/settings.js';
import redis from 'redis';
const client = redis.createClient();
await client.connect();

interface User {
  _id: ObjectId | string;
  name: string;
  email: string;
  password: string;
  verified: boolean;
  posts: (ObjectId | string)[];
}

// Register a user
export const registerUser = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<{ signupCompleted: boolean }> => {
  const saltRounds = 3;
  const hash = await bcrypt.hash(password, saltRounds);

  const collectionUser = await users();
  const userCheck = await collectionUser.findOne({
    email: email.toLowerCase(),
  });

  if (userCheck) {
    throw new Error('This email has already been taken.');
  }

  let verified = true;
  if (env.EMAIL_AZURE_SECRET && env.SENDER_AZURE_EMAIL) {
    verified = false;
  }

  const newUser: Omit<User, '_id'> = {
    name: `${firstName} ${lastName}`,
    email: email.toLowerCase(),
    password: hash,
    verified,
    posts: [],
  };

  const insertInfo = await collectionUser.insertOne(newUser);

  const userId = insertInfo.insertedId;
  if (!userId) {
    throw new Error('Error: New user insertion was not successful.');
  }

  await client.set(`user${userId}`, JSON.stringify(insertInfo));
  await client.set(`user${newUser.email}`, JSON.stringify(insertInfo));
  console.log('New Post is Cached.');

  return { signupCompleted: true };
};

// Login a user
export const loginUser = async (
  email: string,
  password: string
): Promise<any> => {
  const collectionUser = await users();
  const userCheck = await collectionUser.findOne({
    email: email.toLowerCase(),
  });

  if (!userCheck) {
    throw new Error('Either the email or password is invalid');
  }

  const passwordCrypt = await bcrypt.compare(password, userCheck.password);

  if (!passwordCrypt) {
    throw new Error('Either the email or password is invalid');
  }

  userCheck._id = userCheck._id.toString();
  delete userCheck.password;
  return userCheck;
};

// Compare password
export const comparePass = async (
  email: string,
  password: string
): Promise<boolean> => {
  const collectionUser = await users();
  const userCheck = await collectionUser.findOne({
    email: email.toLowerCase(),
  });

  if (!userCheck) {
    throw new Error('Either the email or password is invalid');
  }

  const passwordCrypt = await bcrypt.compare(password, userCheck.password);

  if (!passwordCrypt) {
    throw new Error('Either the email or password is invalid');
  }

  return true;
};

// Get user by email
export const getUserByemail = async (
  email: string
): Promise<Omit<User, 'password'>> => {
  const cache = await client.get(`user${email}`);
  if (cache) {
    console.log('getUserByEmail: Post is Cached.');
    return JSON.parse(cache);
  }

  const collectionUser = await users();
  const user = await collectionUser.findOne({ email: email.toLowerCase() });

  if (!user) throw new Error('Error: User not found');

  delete user.password;
  user._id = user._id.toString();

  await client.set(`user${email}`, JSON.stringify(user));
  return user;
};

// Get user by ID
export const getUser = async (id: string): Promise<Omit<User, 'password'>> => {
  const cache = await client.get(`user${id}`);
  if (cache) {
    console.log('getUser: Post is Cached.');
    return JSON.parse(cache);
  }

  id = id.trim();
  if (!ObjectId.isValid(id)) throw new Error('Invalid object ID');

  const userCollection = await users();
  const user = await userCollection.findOne({ _id: new ObjectId(id) });

  if (!user) {
    throw new Error('No user with that id');
  }

  delete user.password;
  user._id = user._id.toString();

  await client.set(`user${id}`, JSON.stringify(user));
  return user;
};

export const getAllUsers = async (): Promise<{
  allUsersFound: boolean;
  allUsers?: Omit<User, 'password'>[];
}> => {
  try {
    const cache = await client.get(`allUsers`);
    if (cache) {
      console.log('getAllUsers: All Users is Cached');
      return JSON.parse(cache);
    }

    const userCollection = await users();
    const allUsers = await userCollection.find({}).toArray();
    if (!allUsers) throw new Error('getAllUSers: All Users Not Found.');
    const allUsersWithoutPassword = allUsers.map((user: User) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    await client.set(`allUsers`, JSON.stringify(allUsers));
    console.log(`getAllUsers: All Users Returned from Cache.`);
    return { allUsersFound: true, allUsers: allUsersWithoutPassword };
  } catch (e) {
    return { allUsersFound: false };
  }
};
