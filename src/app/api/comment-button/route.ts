import { NextResponse } from "next/server";
import { createComment } from "@/src/data/posts";
import { getSession } from "@/src/lib/session";
import { ObjectId } from "mongodb";

export async function PATCH(request: Request) {
  let session: any;
  let userId: ObjectId | string;

  try {
    session = await getSession();
    if (!session.userId) {
      return NextResponse.json(
        { message: "Must be signed in" },
        { status: 400 }
      );
    } else {
	userId = session.userId;
    }

    const data = await request.json();
    const result = await createComment(data.postId, data.text, userId);
    if (!result.postUpdated) {
      return NextResponse.json(
        { message: "Failed to create comment" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Comment created successfully", post: result.updatedPost },
      { status: 200 }
    );

  } catch (e) {
    console.error("Error creating comment: ", e);

    return NextResponse.json(
      { message: e instanceof Error ? e.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}
