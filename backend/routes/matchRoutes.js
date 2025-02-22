import express from "express";
import {
	createMatchmakingPost,
	getMatchmakingPost,
	deleteMatchmakingPost,
	getUserMatchPosts,
	getMatchFeedPosts,
} from "../controllers/matchController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/matchfeed", protectRoute, getMatchFeedPosts);
router.get("/:id", getMatchmakingPost);
router.get("/user/:username", getUserMatchPosts);
router.post("/create", protectRoute, createMatchmakingPost);
router.delete("/:id", protectRoute, deleteMatchmakingPost);


export default router;