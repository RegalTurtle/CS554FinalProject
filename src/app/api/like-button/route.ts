import { NextResponse } from "next/server";
import { likePost } from "@/src/data/posts";
import { getSession } from "@/src/lib/session";
import { ObjectId } from "mongodb";

export async function PATCH(request: Request) {
  let session: any;
  let userId: ObjectId | string | undefined = undefined;

  try {
    session = await getSession();
    if (session?.userId) {
      userId = session.userId;
    }

    const data = await request.json();
    const result = await likePost(data.postId, userId);
    if (!result.postUpdated) {
      return NextResponse.json(
        { message: "Failed to (un)like post" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Post (un)liked successfully", post: result.updatedPost },
      { status: 200 }
    );

  } catch (e) {
    console.error("Error (un)liking post: ", e);

    return NextResponse.json(
      { message: e instanceof Error ? e.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}
