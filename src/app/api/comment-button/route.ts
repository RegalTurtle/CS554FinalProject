import {NextResponse} from "next/server";
import {createComment} from "@/src/data/posts";
import {getSession} from "@/src/lib/session";
import {ObjectId} from "mongodb";

export async function PATCH(request: Request) {
	let session: any;
	let userId: ObjectId | string;

	try {
		session = await getSession();
		if (session?.userId) {
			userId = session.userId;
		} else return NextResponse.json(
			{message: "No session found"},
			{status: 400}
		);

		const data = await request.json();
		const result = await createComment(userId, data.postId, data.text);
		if (!result.postUpdated) {
			return NextResponse.json(
				{message: "Failed to create comment"},
				{status: 400}
			);
		}

		return NextResponse.json(
			{message: "Comment created successfully"},
			{status: 204}
		);

	} catch (e) {
		console.error("Error creating comment: ", e);

		return NextResponse.json(
			{message: e instanceof Error ? e.message : "An unknown error occurred"},
			{status: 500}
		);
	}
}
