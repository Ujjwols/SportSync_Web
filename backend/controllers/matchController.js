import MatchmakingPost from "../models/matchModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import { saveCloudinaryImage } from "../utils/downloadImage.js";


const createMatchmakingPost = async (req, res) => {
	try {
		const { postedBy, text, teamName, location, date, time, gameType, payment } = req.body;
		let { img } = req.body;

		if (!postedBy || !text || !teamName || !location || !date || !time || !gameType || !payment) {
			return res.status(400).json({ error: "All fields are required" });
		}

		const user = await User.findById(postedBy);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		if (user._id.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "Unauthorized to create post" });
		}

		const maxLength = 500;
		if (text.length > maxLength) {
			return res.status(400).json({ error: `Text must be less than ${maxLength} characters` });
		}

		if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img);
			img = uploadedResponse.secure_url;

			await saveCloudinaryImage(img, `matchpost_${Date.now()}.jpg`);
		}

		const newMatchmakingPost = new MatchmakingPost({
			postedBy,
			text,
			img,
			teamName,
			location,
			date,
			time,
			gameType,
			payment,
		});

		await newMatchmakingPost.save();

		res.status(201).json(newMatchmakingPost);
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log(err);
	}
};

const getMatchmakingPost = async (req, res) => {
	try {
		const post = await MatchmakingPost.findById(req.params.id);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		res.status(200).json(post);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const deleteMatchmakingPost = async (req, res) => {
	try {
		const post = await MatchmakingPost.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		if (post.postedBy.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "Unauthorized to delete post" });
		}

		if (post.img) {
			const imgId = post.img.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imgId);
		}

		await MatchmakingPost.findByIdAndDelete(req.params.id);

		res.status(200).json({ message: "Post deleted successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
const getUserMatchPosts = async (req, res) => {
	const { username } = req.params;
	try {
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const posts = await MatchmakingPost.find({ postedBy: user._id }).sort({ createdAt: -1 });

		res.status(200).json(posts);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
const getMatchFeedPosts = async (req, res) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const following = user.following;
		console.log("Following:", following); // Log to check the following array

		if (following.length === 0) {
			return res.status(200).json([]); // No posts if the user follows no one
		}

		const MatchfeedPosts = await MatchmakingPost.find({ postedBy: { $in: following } }).sort({ createdAt: -1 });

		if (!MatchfeedPosts) {
			return res.status(404).json({ error: "No match posts found" });
		}

		res.status(200).json(MatchfeedPosts);
	} catch (err) {
		console.error("Error fetching match posts:", err); // Log the error for debugging
		res.status(500).json({ error: err.message });
	}
};


export { createMatchmakingPost, getMatchmakingPost, deleteMatchmakingPost,getUserMatchPosts,getMatchFeedPosts };