import {ObjectId} from "mongodb";
import {useState, useEffect} from "react";
import {checkIfLiked, likePost} from "@/src/data/posts";
import { usePathname } from 'next/navigation';
import type { SessionPayload } from '@/src/lib/session';

interface Props {
	postId: ObjectId | string
}

export default function LikeButton(props: Props) {
	const [isLiked, setIsLiked] = useState(false);

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
	
	useEffect(() =>
	{
		if (userId) {
			const checkIfLikedFunc = async (): Promise<boolean> =>
				await checkIfLiked(userId, props.postId);
		
			checkIfLikedFunc().then((result: boolean) =>
			setIsLiked(result));
		}
		
	});

	return (
	<>
	{userId &&
	<button onClick={async () => {
		await likePost(userId, props.postId);
		setIsLiked(!isLiked);
	}}>
		{isLiked ? "♥ Unlike" : "♥ Like"}
	</button>
	}
	</>
	);
}
