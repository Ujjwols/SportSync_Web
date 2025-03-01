import { Box, Text, Flex, Spinner, Avatar, Stack, Icon } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import useShowToast from "../hooks/useShowToast";
import { FaHeart, FaComment } from "react-icons/fa6";
import { IoSettingsOutline } from "react-icons/io5";
import { IconButton, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const showToast = useShowToast();

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);  // Reset error before making the request
      try {
        const res = await fetch("/api/notifications/getnoti");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        setNotifications(data);
      } catch (error) {
        setError(error.message);
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [showToast]);

  const handleDeleteNotifications = async () => {
    try {
      const res = await fetch("/api/notifications/delnoti", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setNotifications([]);  // Clear notifications after deletion
      showToast("Success", "Notifications deleted successfully", "success");
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  return (
    <Box p={4} borderLeft="1px" borderRight="1px" borderColor="gray.700" minHeight="100vh">
      {/* Header */}
      <Flex justify="space-between" align="center" borderBottom="1px" borderColor="gray.700" pb={4}>
        <Text fontWeight="bold" fontSize="xl">Notifications</Text>
        <Menu>
          <MenuButton as={IconButton} icon={<IoSettingsOutline />} variant="ghost" aria-label="Settings" />
          <MenuList>
            <MenuItem onClick={handleDeleteNotifications}>Delete all notifications</MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      {/* Loading Spinner */}
      {loading && (
        <Flex justify="center" align="center" py={4}>
          <Spinner color="gray.500" size="lg" />
        </Flex>
      )}

      {/* Error Handling */}
      {error && (
        <Text textAlign="center" py={4} fontWeight="bold" color="red.500">
          Something went wrong. Please try again later.
        </Text>
      )}

      {/* Empty State */}
      {!loading && notifications?.length === 0 && (
        <Text textAlign="center" py={4} fontWeight="bold">No notifications 🤔</Text>
      )}

      {/* Notifications List */}
      {!loading && notifications?.map((notification) => (
        <Box key={notification._id} borderBottom="1px" borderColor="gray.700" py={4}>
          <Flex gap={4} align="center">
            {/* Notification Icon */}
            {notification.type === "like" && <Icon as={FaHeart} color="red.500" boxSize={6} />}
            {notification.type === "reply" && <Icon as={FaComment} color="green.500" boxSize={6} />}
            
            <Link to={`/profile/${notification.from.username}`}>
              <Flex align="center" gap={3}>
                {/* Profile Image */}
                <Avatar
                  src={notification.from.profilePic || "/avatar-placeholder.png"}
                  alt="Profile"
                  size="md"
                />
                {/* Text */}
                <Stack spacing={0}>
                  <Text fontWeight="bold">@{notification.from.username}</Text>
                  <Text>
                    {notification.type === "likes"
                      ? "liked your post"
                      : notification.type === "reply"
                      ? "replied to your post"
                      : "interacted with your post"}
                  </Text>
                </Stack>
              </Flex>
            </Link>
          </Flex>
        </Box>
      ))}
    </Box>
  );
};

export default NotificationPage;