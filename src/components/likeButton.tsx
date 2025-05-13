"use client";

import {useState, useEffect} from "react";
import {SessionPayload} from "@/src/lib/session";
import {usePathname} from "next/navigation";

interface Props {
	postId: string
}

export default function LikeButton(props: Props) {
	const pathname = usePathname;
	const [session, setSession] = useState<SessionPayload | undefined | null>(null);
	const [error, setError] = useState("");

	useEffect(() => {
		async function fetchData() {
			const response = await fetch(`/api/session`);
			const data = await response.json();
			let { session } = data;
			setSession(session);
		}
		fetchData();
    	}, [pathname]);

	return (
	<>
	{session?.userId &&
	<button onClick={async (e: React.FormEvent) => {
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

		} catch (e) {
			console.error("Error (un)liking post: ", e);
			setError(e instanceof Error ? e.message : "An unknown error occurred");
		}
	}}>
		♥ Like/Unlike
	</button>}

	{error &&
	<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
		{error}
	</div>}
	</>
	);
}
