import { ObjectId } from 'mongodb';
import { posts, users } from '@/src/config/mongoCollections.js';
import { Buffer } from 'buffer';
import * as redis from 'redis';
import {getUser} from "./users";

// const client = redis.createClient({ url: `redis://173.3.80.96:6379` });
const client = redis.createClient();
await client.connect();

export interface Post {
  _id: ObjectId | string;
  userId: ObjectId | string;
  title: string;
  image: Buffer | string;
  caption: string;
  likedUsers: (ObjectId | string)[];
  comments: Comment[];

}

export interface Comment {
  userId: ObjectId | string;
  text: string;
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
      comments: []
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

    await client.del(`allPosts`);
    await client.del(`allPosts-${userId.toString()}`);
    // Set Cache with Post Id

    await client.set(`post${postId}`, JSON.stringify(createdPost));
    await client.expire(`post${postId}`, 3600);
    console.log('New Post is Cached.');

    return { postCreated: true, post: createdPost };
  } catch (e) {
    console.error(e);
    return { postCreated: false };
  }
};

export const getPostById = async (
  id: ObjectId | string
): Promise<{ postFound: boolean; post?: Post }> => {
  try {
    if (typeof id === 'string') id = id.trim();

    // Check if it is in Cache

    const cache = await client.get(`post${id}`);
    if (cache) {
      console.log('getPostById: Post is Cached.');
      return JSON.parse(cache);
    }

    // If not get from Database
    const postCollection = await posts();
    const post = await postCollection.findOne({ _id: new ObjectId(id) });

    if (!post) throw new Error('getPostByID: No Post Found.');

    // Cache

    await client.set(`post${id}`, JSON.stringify(post));
    await client.expire(`post${id}`, 3600);
    console.log('getPostById: Post Returned from Cache.');

    return { postFound: true, post };
  } catch (e) {
    console.error(e);
    return { postFound: false };
  }
};

export const getAllPosts = async (): Promise<{
  allPostsFound: boolean;
  allPosts?: Post[];
}> => {
  try {
    // Check if it is in Cache

    const cache = await client.get(`allPosts`);
    if (cache) {
      console.log('getAllPosts: All Posts is Cached');
      return JSON.parse(cache);
    }

    // If not get from Database
    const postCollection = await posts();
    const allPosts = await postCollection.find({}).toArray();
    if (!allPosts) throw new Error('getAllPosts: All Posts Not Found.');

    // Cache

    await client.set(`allPosts`, JSON.stringify(allPosts));
    await client.expire(`allPosts`, 3600);
    console.log(`getAllPosts: All Posts Returned from Cache.`);

    return { allPostsFound: true, allPosts };
  } catch (e) {
    console.error(e);
    return { allPostsFound: false };
  }
};

export const updatePost = async (
  id: ObjectId | string,
  title?: string,
  caption?: string
): Promise<{
  postUpdated: boolean;
  updatedPost?: Post;
}> => {
  try {
    if (title) title = title.trim();
    if (caption) caption = caption.trim();

    const updateData: { title?: string; caption?: string } = {};
    if (title) updateData.title = title;
    if (caption) updateData.caption = caption;

    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields provided for update.');
    }

    const postCollection = await posts();

    const result = await postCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      throw new Error(
        'No post updated. Either the post does not exist or the data is the same.'
      );
    }

    const updatedPost = await postCollection.findOne({ _id: new ObjectId(id) });
    if (!updatedPost) {
      throw new Error('updatePost: Could Not Update Post.');
    }

    // Since it is Mutation, we delete getAllPosts, postById (all queries)

    await client.del(`post${id}`);
    await client.del(`allPosts}`);
    await client.del(`allPosts-${updatedPost.userId.toString()}`);
    // Add the updated Post into cache.

    await client.set(`post${id}`, JSON.stringify(updatedPost));
    await client.expire(`post${id}`, 3600);
    console.log(`updatePost: Post Updated into Cache!`);

    return { postUpdated: true, updatedPost };
  } catch (e) {
    console.error(e);
    return { postUpdated: false };
  }
};

export const deletePost = async (
  id: ObjectId | string
): Promise<{ postDeleted: boolean; deletedPost?: Post }> => {
  try {
    const postCollection = await posts();
    const userCollection = await users();

    const deletedPost = await postCollection.findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (!deletedPost) throw new Error('deletePost: Could Not Delete Post.');

    const removePostFromUser = await userCollection.updateOne(
      { _id: deletedPost.userId },
      {
        $pull: { posts: new ObjectId(id) },
      }
    );

    if (removePostFromUser.modifiedCount === 0) {
      throw new Error(
        'deletePost: Failed to remove post from user.posts array.'
      );
    }

    // Since it is Mutation, we delete getAllPosts, postById (all queries)

    await client.del(`post${id}`);
    await client.del(`allPosts`);
    await client.del(`allPosts-${deletedPost.userId.toString()}`);

    return { postDeleted: true, deletedPost: deletedPost };
  } catch (e) {
    console.error(e);
    return { postDeleted: false };
  }
};

export const getAllPostsByUser = async (userId: ObjectId | string): Promise<{
  allPostsFound: boolean;
  allPosts?: Post[];
}> => {
  try {
    if (typeof userId === 'string') userId = userId.trim();
    // Check if it is in Cache

    const cache = await client.get(`allPosts-${userId.toString()}`);
    if (cache) {
      console.log('getAllPosts: All Posts is Cached');
      return JSON.parse(cache);
    }
    console.log(userId)
    // If not get from Database
    const postCollection = await posts();
    const allPosts = await postCollection.find({ userId: new ObjectId(userId) }).toArray();
    if (!allPosts) throw new Error('getAllPosts: All Posts Not Found.');
    allPosts.map((post: Post) => {
      post.image = post.image.toString()
    });
    // Cache

    await client.set(`allPosts-${userId.toString()}`, JSON.stringify(allPosts));
    await client.expire(`allPosts-${userId.toString()}`, 3600);
    console.log(`getAllPosts: All Posts Returned from Cache.`);

    return allPosts;
  } catch (e) {
    throw new Error('Unable to get posts');
  }
};

export const likePost = async (
  userId: ObjectId | string,
  postId: ObjectId | string
): Promise<{
  postUpdated: boolean;
  updatedPost?: Post;
}> => {
  try {
    if (typeof userId === 'string')
      userId = userId.trim();
    
    const postObj = await getPostById(postId);
    const post: Post | undefined = postObj.post;
    if (post === undefined)
      throw `no post with ID ${postId}`;

    const userObjId: ObjectId = new ObjectId(userId);
    let newLikedUsers: (ObjectId | string)[] = post.likedUsers;

    if (newLikedUsers.includes(userObjId)) {
      newLikedUsers = newLikedUsers.filter((elem) => elem !== userObjId);
    } else {
      newLikedUsers.push(userObjId);
    }

    const postCollection = await posts();
    const updatedPost: Post | undefined = await postCollection.updateOne({
        _id: new ObjectId(postId)
      }, {
        $set: {
          likedUsers: newLikedUsers
        }
      }
    );
    if (!updatedPost)
      throw "failed to update post";

    const newPost: Post = await postCollection.findOne({_id: new ObjectId(postId)});
    await client.del(`post${postId}`);
    await client.del(`allPosts}`);
    await client.del(`allPosts-${updatedPost.userId.toString()}`);
    await client.set(`post${postId}`, JSON.stringify(updatedPost));
    await client.expire(`post${postId}`, 3600);
    console.log(`updatePost: Post Updated into Cache!`);

    return {
      postUpdated: true,
      updatedPost: newPost
    }

  } catch (e) {
    console.error(e);
    return {postUpdated: false};
  }
};

export const createComment = async (
  userId: ObjectId | string,
  postId: ObjectId | string,
  text: string
): Promise<{
  postUpdated: boolean;
  updatedPost?: Post;
}> => {
  try {
    if (text.length === 0)
      throw "comment cannot be empty";

    if (typeof userId === 'string')
      userId = userId.trim();
    
    const postObj = await getPostById(postId);
    const post: Post | undefined = postObj.post;
    if (post === undefined)
      throw `no post with ID ${postId}`;

    const comment: Comment = {
      userId: new ObjectId(userId),
      text: text
    };
    let newComments = post.comments;
    newComments.push(comment);

    const postCollection = await posts();
    const updatedPost: Post | undefined = await postCollection.updateOne({
        _id: new ObjectId(postId)
      }, {
        $set: {
          comments: newComments
        }
      }
    );
    if (!updatedPost)
      throw "failed to update post";

    const newPost: Post = await postCollection.findOne({_id: new ObjectId(postId)});
    await client.del(`post${postId}`);
    await client.del(`allPosts}`);
    await client.del(`allPosts-${updatedPost.userId.toString()}`);
    await client.set(`post${postId}`, JSON.stringify(updatedPost));
    await client.expire(`post${postId}`, 3600);
    console.log(`updatePost: Post Updated into Cache!`);

    return {
      postUpdated: true,
      updatedPost: newPost
    }

  } catch (e) {
    console.error(e);
    return {postUpdated: false};
  }
}
