import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import { deleteNotifications, getNotifications } from "../controllers/notificationController.js";

const router = express.Router();

router.get("/getnoti", protectRoute, getNotifications);
router.delete("/delnoti", protectRoute, deleteNotifications);

export default router;
