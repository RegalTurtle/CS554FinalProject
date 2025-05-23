"use client";

import {Dispatch, SetStateAction, useState} from "react";

interface Post {
	_id: string;
	userId: string;
	title: string;
	image: string;
	caption: string;
	likedUsers: any[];
	comments: any[];
}

interface Props {
	postId: string,
	setPost: Dispatch<SetStateAction<Post | null>>
}

export default function CommentButton(props: Props) {
	const [error, setError] = useState("");
	const [box, setBox] = useState(false);

	return (
	<>
	<div>
		<button className="border border-gray-300 rounded-md"
		onClick={() => setBox(!box)}>Comment</button>

		{box &&
		<form>
			<input className="border border-gray-300 rounded-md"
			id="commentBox" type="text" name="commentBox" />

			<button className="border border-gray-300 rounded-md"
			type="submit" onClick={async (e: React.FormEvent) => {
				e.preventDefault();
				
				const text: string | null =
				(document.getElementById("commentBox") as HTMLInputElement).value;
				
				try {
					if (!text || text.trim().length === 0)
						throw new Error("comment cannot be empty");

					const data = {
						postId: props.postId,
						text: text
					};
					const response = await fetch("/api/comment-button", {
						method: "PATCH",
						headers: {"Content-Type": "application/json"},
						body: JSON.stringify(data)
					});
					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(errorData.message);
					}

					props.setPost((await response.json()).post);

				} catch (e) {
					console.error("Error creating comment: ", e);
					setError(e instanceof Error ? e.message : "An unknown error occurred");
				} finally {
					setBox(false);
				}
			}}>
				Submit
			</button>
		</form>}
	</div>

	{error &&
	<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
		{error}
	</div>}
	</>
	);
}
