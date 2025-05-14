"use client";

import {useState} from "react";

interface Props {
	postId: string
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
				throw new Error(errorData.message);
			}

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
