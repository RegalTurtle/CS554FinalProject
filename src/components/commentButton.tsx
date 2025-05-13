"use client";

import {useState, useEffect} from "react";
import {SessionPayload} from "@/src/lib/session";
import {usePathname} from "next/navigation";

interface Props {
	postId: string
}

export default function CommentButton(props: Props) {
	const pathname = usePathname;
	const [session, setSession] = useState<SessionPayload | undefined | null>(null);
	const [error, setError] = useState("");
	const [box, setBox] = useState(false);

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
	<div>
		<button className="border border-gray-300 rounded-md"
		onClick={() => setBox(!box)}>Comment</button>

		{box &&
		<form>
			<input className="border border-gray-300 rounded-md"
			id="commentBox" type="text" name="commentBox" />

			<button className="border border-gray-300 rounded-md"
			type="submit" onClick={async () => {
				const text: string | null =
				(document.getElementById("commentBox") as HTMLInputElement).value;
				
				try {
					if (text === null || text === "")
						throw "comment cannot be empty";

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
						throw errorData.message;
					}

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
