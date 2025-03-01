import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js"; 
import { v2 as cloudinary } from "cloudinary";
import { saveCloudinaryImage } from "../utils/downloadImage.js";

const createPost = async (req, res) => {
	try {
		const { postedBy, text } = req.body;
		let { img } = req.body;

		if (!postedBy || !text) {
			return res.status(400).json({ error: "Postedby and text fields are required" });
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

			await saveCloudinaryImage(img, `post_${Date.now()}.jpg`);
		}

		const newPost = new Post({ postedBy, text, img });
		await newPost.save();

		res.status(201).json(newPost);
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log(err);
	}
};

const getPost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		res.status(200).json(post);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
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

		await Post.findByIdAndDelete(req.params.id);

		res.status(200).json({ message: "Post deleted successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const likeUnlikePost = async (req, res) => {
	try {
	  const { id: postId } = req.params;
	  const userId = req.user._id;
  
	  const post = await Post.findById(postId);
  
	  if (!post) {
		return res.status(404).json({ error: "Post not found" });
	  }
  
	  const userLikedPost = post.likes.includes(userId);
  
	  if (userLikedPost) {
		// Unlike post
		await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
		res.status(200).json({ message: "Post unliked successfully" });
	  } else {
		// Like post
		post.likes.push(userId);
		await post.save();
  
		// Create a notification for the post owner (if the liker is not the post owner)
		if (post.postedBy.toString() !== userId.toString()) {
		  const notification = new Notification({
			from: userId, // The user who liked the post
			to: post.postedBy, // The post owner
			type: "likes", // Notification type
		  });
		  await notification.save();
		}
  
		res.status(200).json({ message: "Post liked successfully" });
	  }
	} catch (err) {
	  console.error("Error in likeUnlikePost:", err); // Log the full error
	  res.status(500).json({ error: err.message });
	}
  };

  const replyToPost = async (req, res) => {
	try {
	  const { text } = req.body; // Reply text
	  const postId = req.params.id; // ID of the post being replied to
	  const userId = req.user._id; // ID of the authenticated user
	  const userProfilePic = req.user.profilePic; // Profile picture of the user
	  const username = req.user.username; // Username of the user
  
	  if (!text) {
		return res.status(400).json({ error: "Text field is required" });
	  }
  
	  const post = await Post.findById(postId);
	  if (!post) {
		return res.status(404).json({ error: "Post not found" });
	  }
  
	  // Create the reply object
	  const reply = { userId, text, userProfilePic, username };
  
	  // Add the reply to the post
	  post.replies.push(reply);
	  await post.save();
  
	  // Create a notification for the post owner (if the replier is not the post owner)
	  if (post.postedBy.toString() !== userId.toString()) {
		const notification = new Notification({
		  from: userId, // The user who replied
		  to: post.postedBy, // The post owner
		  type: "reply", // Notification type
		});
		await notification.save();
	  }
  
	  res.status(200).json(reply);
	} catch (err) {
	  console.error("Error in replyToPost:", err); // Log the error for debugging
	  res.status(500).json({ error: err.message });
	}
  };
const getFeedPosts = async (req, res) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const following = user.following;

		const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({ createdAt: -1 });

		res.status(200).json(feedPosts);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const getUserPosts = async (req, res) => {
	const { username } = req.params;
	try {
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const posts = await Post.find({ postedBy: user._id }).sort({ createdAt: -1 });

		res.status(200).json(posts);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export { createPost, getPost, deletePost, likeUnlikePost, replyToPost, getFeedPosts, getUserPosts };
