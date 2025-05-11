import {ObjectId} from "mongodb";
import {useState, useEffect} from "react";
import {checkIfLiked, likePost} from "@/src/data/posts";

interface Props {
	userId: ObjectId | string,
	postId: ObjectId | string
}

export default function LikeButton(props: Props) {
	const [isLiked, setIsLiked] = useState(false);

	useEffect(() =>
	{
		const checkIfLikedFunc = async (): Promise<boolean> =>
			await checkIfLiked(props.userId, props.postId);
		
		checkIfLikedFunc().then((result: boolean) =>
		setIsLiked(result));
	});

	return (
	<button onClick={async () => {
		await likePost(props.userId, props.postId);
		setIsLiked(!isLiked);
	}}>
		{isLiked ? "♥ Unlike" : "♥ Like"}
	</button>
	);
}
