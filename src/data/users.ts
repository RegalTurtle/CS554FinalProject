import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { users, posts } from '@/src/config/mongoCollections.js';
import { env } from '@/src/config/settings.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The public folder is at the project root in Next.js
const imagePath = path.join(__dirname, '..', '..', 'public', 'profile-pic.svg');

const imageBuffer = fs.readFileSync(imagePath);
const base64Image = imageBuffer.toString('base64');

import * as redis from 'redis';
// const client = redis.createClient({ url: `redis://173.3.80.96:6379` });
const client = redis.createClient();
await client.connect();

export interface Friend {
  userId: ObjectId;
  status: "acceptRequest" | "pending" | "friend";
}

export interface User {
  _id: ObjectId | string;
  name: string;
  email: string;
  image: string;
  password: string;
  verified: boolean;
  friends: Friend[];
  private: boolean;
  bio: String;
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
  // Read image file into a Buffer


  const newUser: Omit<User, '_id'> = {
    name: `${firstName} ${lastName}`,
    email: email.toLowerCase(),
    password: hash,
    verified,
    friends: [],
    image: `data:image/svg+xml;base64,${base64Image}`,
    private: true,
    bio: ""
  };

  const insertInfo = await collectionUser.insertOne(newUser);

  const userId = insertInfo.insertedId;
  if (!userId) {
    throw new Error('Error: New user insertion was not successful.');
  }
  const { password: _pass, ...userWithoutPassword } = newUser;
  const completedUserWithoutPassword: Omit<User, 'password'> = {
    ...userWithoutPassword,
    _id: userId
  }
  //commented out because it was causing a weird error
  await client.set(`user${userId}`, JSON.stringify(completedUserWithoutPassword));
  await client.set(`user${newUser.email}`, JSON.stringify(completedUserWithoutPassword));
  await client.expire(`user${userId}`, 3600);
  await client.expire(`user${newUser.email}`, 3600);

  // console.log('New User is Cached.');
  await client.del(`allUsers`);
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
    console.log('getUserByEmail: User is Cached.');
    return JSON.parse(cache);
  }

  email = email.trim();

  const collectionUser = await users();
  const user = await collectionUser.findOne({ email: email.toLowerCase() });

  if (!user) throw new Error('Error: User not found');

  delete user.password;
  user._id = user._id.toString();

  await client.set(`user${email}`, JSON.stringify(user));
  await client.expire(`user${email}`, 3600);
  return user;
};

// Get user by ID
export const getUser = async (id: string): Promise<Omit<User, 'password'>> => {
  const cache = await client.get(`user${id}`);
  if (cache) {
    console.log('getUser: User is Cached.');
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
  await client.expire(`user${id}`, 3600);
  return user;
};

export const getAllUsers = async (): Promise<{
  allUsersFound: boolean;
  allUsers?: Omit<User, 'password'>[];
}> => {
  try {
    let fields: { name?: RegExp } = {}

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
    await client.expire(`allUsers`, 3600);
    console.log(`getAllUsers: All Users Returned from Cache.`);
    return allUsersWithoutPassword;
  } catch (e) {
    throw new Error('Unable to get users');
  }
};

export const addFriend = async (userId: string, friendId: string) => {

  userId = userId.trim();
  if (!ObjectId.isValid(userId)) throw new Error('Invalid object ID');
  friendId = friendId.trim();
  if (!ObjectId.isValid(userId)) throw new Error('Invalid object ID');
  const userCollection = await users();

  const user = await userCollection.findOne({
    _id: new ObjectId(userId),
    "friends.userId": new ObjectId(friendId)
  });
  if (!user) {
    await userCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        $push: {
          friends: {
            userId: new ObjectId(friendId),
            status: "pending"
          }
        }
      },
      { returnDocument: "after" }
    );
    await client.del(`user${userId}`);
    await client.del(`allUsers`);
  } else {
    throw new Error('User is already a friend, waiting to be accepted as a friend or a pending friend.');
  }

  const friend = await userCollection.findOne({
    _id: new ObjectId(friendId),
    "friends.userId": new ObjectId(userId)
  });
  if (!friend) {
    await userCollection.findOneAndUpdate(
      { _id: new ObjectId(friendId) },
      {
        $push: {
          friends: {
            userId: new ObjectId(userId),
            status: "acceptRequest"
          }
        }
      },
      { returnDocument: "after" }
    );
    await client.del(`user${friendId}`);
  } else {
    throw new Error('User is already a friend, waiting to be accepted as a friend or a pending friend.');
  }

};


export const acceptRequest = async (userId: string, friendId: string) => {


  userId = userId.trim();
  if (!ObjectId.isValid(userId)) throw new Error('Invalid object ID');
  friendId = friendId.trim();
  if (!ObjectId.isValid(userId)) throw new Error('Invalid object ID');
  const userCollection = await users();

  await userCollection.findOneAndUpdate({
    _id: new ObjectId(userId),
    "friends.userId": new ObjectId(friendId)
  },
    {
      $set: {
        "friends.$.status": "friend"
      }
    });
  await client.del(`user${userId}`);
  await client.del(`allUsers`);
  await userCollection.findOneAndUpdate({
    _id: new ObjectId(friendId),
    "friends.userId": new ObjectId(userId)
  },
    {
      $set: {
        "friends.$.status": "friend"
      }
    });
  await client.del(`user${friendId}`);


};

export const updateUser = async (
  id: ObjectId | string, data:
    {
      name: string,
      bio: string,
      image?: string
    }
) => {
  try {
    console.log(data)
    console.log(id)
    let name = data.name
    let bio = data.bio
    if (name) name = name.trim();
    if (bio) bio = bio.trim();

    const updateData: { name?: string; bio?: string, image?: string } = { bio: "" };
    if (name) updateData.name = name;
    if (bio) updateData.bio = bio;

    if (data.image) {
      updateData.image = data.image
    }

    const userCollection = await users();

    const result = await userCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    console.log(result)
    if (!result.acknowledged) {
      throw new Error(
        'Unable to Update'
      );
    }

    await client.del(`user${id}`);
    await client.del(`allUsers`);
  } catch (e) {
    throw new Error(
      'Unable to Update'
    );
  }
};