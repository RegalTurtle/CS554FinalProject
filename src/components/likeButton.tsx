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
	postId: string
  setPost: Dispatch<SetStateAction<Post | null>>
}

export default function LikeButton(props: Props) {
	const [error, setError] = useState("");

	return (
	<>
	<button className="border border-gray-300 rounded-md" onClick={async (e: React.FormEvent) => {
		e.preventDefault();

		const data = {postId: props.postId};
		
		try {
			const response = await fetch("/api/like-button", {
				method: "PATCH",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify(data)
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw errorData.message;
			}

      props.setPost((await response.json()).post);
		} catch (e) {
			console.error("Error (un)liking post: ", e);
			setError(e instanceof Error ? e.message : "An unknown error occurred");
		}
	}}>
		♥ Like/Unlike
	</button>

	{error &&
	<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
		{error}
	</div>}
	</>
	);
}
