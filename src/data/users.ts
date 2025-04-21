import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { users } from '@/src/config/mongoCollections.js';
import { env } from '@/src/config/settings.js';
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

  if (!insertInfo.insertedId) {
    throw new Error('Error: New user insertion was not successful.');
  }

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
  const collectionUser = await users();
  const user = await collectionUser.findOne({ email: email.toLowerCase() });

  if (!user) throw new Error('Error: User not found');

  delete user.password;
  user._id = user._id.toString();
  return user;
};

// Get user by ID
export const getUser = async (id: string): Promise<Omit<User, 'password'>> => {
  id = id.trim();
  if (!ObjectId.isValid(id)) throw new Error('Invalid object ID');

  const userCollection = await users();
  const user = await userCollection.findOne({ _id: new ObjectId(id) });

  if (!user) {
    throw new Error('No user with that id');
  }

  delete user.password;
  user._id = user._id.toString();
  return user;
};

export const getAllUsers = async (): Promise<{
  allUsersFound: boolean;
  allUsers?: Omit<User, 'password'>[];
}> => {
  try {
    const userCollection = await users();
    const allUsers = await userCollection.find({}).toArray();
    if (!allUsers) throw new Error('getAllUSers: All Users Not Found.');
    const allUsersWithoutPassword = allUsers.map((user: User) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    return { allUsersFound: true, allUsers: allUsersWithoutPassword };
  } catch (e) {
    return { allUsersFound: false };
  }
};
