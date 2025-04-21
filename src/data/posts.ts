import { ObjectId } from 'mongodb';
import { posts, users } from '@/src/config/mongoCollections.js';
import { env } from '@/src/config/settings.js';
import { Buffer } from 'buffer';

interface Post {
  _id: ObjectId | string;
  userId: ObjectId | string;
  title: string;
  image: Buffer;
  caption: string;
  likedUsers: (ObjectId | string)[];
  comments: (ObjectId | string)[];
}

export const createPost = async (
  userId: ObjectId | string,
  title: string,
  image: Buffer,
  caption: string
): Promise<{ postCreated: boolean; post?: Post }> => {
  try {
    const postCollection = await posts();
    const userCollection = await users();

    // Check if User exists

    const user = await userCollection.findOne({ _id: userId });
    if (!user) throw new Error('User not found.');

    // Add to Posts Collection
    if (!postCollection)
      throw new Error('posts.ts: Database Collection Not Found.');
    const newPost: Omit<Post, '_id'> = {
      userId: userId,
      title: title,
      image: image,
      caption: caption,
      likedUsers: [],
      comments: [],
    };

    const insertPost = await postCollection.insertOne(newPost);
    if (!insertPost.acknowledged || !insertPost.insertedId) {
      throw new Error('Error: New post insertion was not successful.');
    }

    const createdPost = {
      ...newPost,
      _id: insertPost.insertedId, // Add the inserted post's ID
    };

    // Add to user.posts array

    const postId = insertPost.insertedId;
    const updateUser = await userCollection.updateOne(
      { _id: userId },
      {
        $push: { posts: postId }, // Append postId to the posts array
      }
    );

    if (updateUser.modifiedCount === 0) {
      throw new Error('Error: Failed to update user with the new post.');
    }

    return { postCreated: true, post: createdPost };
  } catch (e) {
    console.error(e);
    return { postCreated: false };
  }
};
