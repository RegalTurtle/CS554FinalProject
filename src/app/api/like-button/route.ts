import {NextResponse} from "next/server";
import {likePost} from "@/src/data/posts";
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
		const result = await likePost(userId, data.postId);
		if (!result.postUpdated) {
			return NextResponse.json(
				{message: "Failed to (un)like post"},
				{status: 400}
			);
		}

		return NextResponse.json(
			{message: "Post (un)liked successfully"},
			{status: 204}
		);

	} catch (e) {
		console.error("Error (un)liking post: ", e);

		return NextResponse.json(
			{message: e instanceof Error ? e.message : "An unknown error occurred"},
			{status: 500}
		);
	}
}
