import Notification from "../models/notificationModel.js";

export const getNotifications = async (req, res) => {
	try {
	  const userId = req.user?._id; // Ensure user is authenticated
  
	  if (!userId) {
		return res.status(401).json({ error: "Unauthorized access" });
	  }
  
	  // Fetch notifications
	  const notifications = await Notification.find({ to: userId })
		.populate("from", "username profilePic")
		.lean();
  
	  console.log("Fetched notifications:", notifications); // Debugging
  
	  // Update notifications to mark them as read
	  await Notification.updateMany({ to: userId, read: false }, { read: true });
  
	  // Fetch updated notifications
	  const updatedNotifications = await Notification.find({ to: userId })
		.populate("from", "username profilePic")
		.lean();
  
	  res.status(200).json(updatedNotifications);
	} catch (error) {
	  console.error("Error in getNotifications:", error.message);
	  res.status(500).json({ error: "Internal Server Error" });
	}
  };

export const deleteNotifications = async (req, res) => {
	try {
		const userId = req.user?._id; // Ensure user is authenticated
		if (!userId) {
			return res.status(401).json({ error: "Unauthorized access" });
		}

		const result = await Notification.deleteMany({ to: userId });
		console.log(`Deleted ${result.deletedCount} notifications for user ${userId}`);

		res.status(200).json({ message: "Notifications deleted successfully" });
	} catch (error) {
		console.error("Error in deleteNotifications:", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
