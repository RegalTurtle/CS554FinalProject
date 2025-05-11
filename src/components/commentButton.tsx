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
		<form>
			<input id="commentBox" type="text" name="commentBox" />

			<button type="submit" onClick={async () => {
				const text: string | null = (document.getElementById("commentBox") as HTMLInputElement).value;
				if (text !== null)
					createComment(props.userId, props.postId, text);
			}}>Submit</button>
		</form>}
	</div>
	);
}
