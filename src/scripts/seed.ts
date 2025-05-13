import { dbConnection } from "../config/mongoConnection";
import { createComment, createPost, getAllPostsByUser, likePost } from "../data/posts";
import { acceptRequest, addFriend, getUserByemail, registerUser } from "../data/users";
import fs from 'fs/promises';

// Redis stuff
import * as redis from 'redis';
// const client = redis.createClient({ url: `redis://173.3.80.96:6379` });
const client = redis.createClient();
await client.connect();

export const seed = async (): Promise<void> => {
  const db = await dbConnection();
  await db.dropDatabase();
  await client.flushAll();
  console.log('Database dropped');

  await registerUser("Thys", "Vanderschoot", "thysvanderschoot@gmail.com", "GoodPassword123");
  await registerUser("Annika", "Vanderschoot", "annikavanderschoot@gmail.com", "AnotherPassword123");
  const thysObj = await getUserByemail("thysvanderschoot@gmail.com");
  const annikaObj = await getUserByemail("annikavanderschoot@gmail.com");

  await addFriend(annikaObj._id.toString(), thysObj._id.toString());
  await acceptRequest(thysObj._id.toString(), annikaObj._id.toString());
  await registerUser("Sam", "Schwartz", "samschwartz@gmail.com", "BestPassword123");

  const base64Image1 = (await fs.readFile("./src/scripts/image1.jpg")).toString('base64');
  const image1Buffer = Buffer.from(base64Image1);

  const { postCreated, post } = await createPost(thysObj._id, "HCI Figure 1", image1Buffer, "This is one of my charts from my HCI paper this semester.");
  if (!postCreated) throw new Error('Post not created');
  if (typeof post !== 'undefined') {
    await likePost(annikaObj._id, post?._id);
    console.log('post liked');
    await createComment(annikaObj._id, post?._id, 'This is a cool image')
    console.log('post commented');
  }

  console.log(await getAllPostsByUser(thysObj._id.toString()));
};