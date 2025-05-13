"use client";

import {ObjectId} from "mongodb";
import {useState, useEffect} from "react";
import {createComment} from "@/src/data/posts";
import { usePathname } from 'next/navigation';
import type { SessionPayload } from '@/src/lib/session';

interface Props {
	postId: ObjectId | string
}

export default function CommentButton(props: Props) {
	const [box, setBox] = useState(false);

	const pathname = usePathname();
	const [session, setSession] = useState<SessionPayload | undefined | null>(null);

	let userId = undefined;
	if (session?.userId)
		userId = session.userId;

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
	{userId &&
	<div>
		<button onClick={() => setBox(!box)}>Comment</button>

		{box &&
		<form>
			<input id="commentBox" type="text" name="commentBox" />

			<button type="submit" onClick={async () => {
				const text: string | null = 
				(document.getElementById("commentBox") as HTMLInputElement).value;
				if (text !== null) {
					await createComment(userId, props.postId, text);
					setBox(false);
				}
			}}>Submit</button>
		</form>}
	</div>}
	</>
	);
}
