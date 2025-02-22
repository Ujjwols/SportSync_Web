	import mongoose from "mongoose";

	const matchmakingPostSchema = mongoose.Schema(
		{
			postedBy: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				required: true,
			},
			text: {
				type: String,
				maxLength: 500,
			},
			img: {
				type: String,
			},
			teamName: {
				type: String,
				required: true,
			},
			location: {
				type: String,
				required: true,
			},
			date: {
				type: Date,
				required: true,
			},
			time: {
				type: String,
				required: true,
			},
			gameType: {
				type: String,
				required: true,
			},
			payment: {
				type: String,
				required: true,
			},
		},
		{
			timestamps: true,
		}
	);

	const MatchmakingPost = mongoose.model("MatchmakingPost", matchmakingPostSchema);

	export default MatchmakingPost;