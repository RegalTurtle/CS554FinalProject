import {ObjectId} from "mongodb";
import {useState} from "react";
import {createComment} from "@/src/data/posts";

interface Props {
	userId: ObjectId | string,
	postId: ObjectId | string
}

export default function CommentButton(props: Props) {
	const [box, setBox] = useState(false);

	return (
	<div>
		<button onClick={() => setBox(!box)}>Comment</button>

		{box &&
		<div>

		</div>
		}
	</div>
	);
}
