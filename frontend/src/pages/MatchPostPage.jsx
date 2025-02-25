import { Avatar, Box,Divider, Flex, Image, Spinner, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Comment from "../components/Comment";
import useGetUserProfile from "../hooks/useGetUserProfile";
import useShowToast from "../hooks/useShowToast";
import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { DeleteIcon } from "@chakra-ui/icons";

const MatchPostPage = () => {
    const { mid } = useParams(); // 
    const showToast = useShowToast();
    const navigate = useNavigate();
    const currentUser = useRecoilValue(userAtom);
    
    const { user, loading } = useGetUserProfile();
    const [matchPost, setMatchPost] = useState(null); //
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const getMatchPost = async () => {
            setFetching(true);
            try {
                if (!mid) {
                    showToast("Error", "Invalid match post ID", "error");
                    return;
                }

                const res = await fetch(`/api/matchpost/${mid}`);
                const data = await res.json();
                
                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }

                setMatchPost(data);
            } catch (error) {
                showToast("Error", error.message, "error");
            } finally {
                setFetching(false);
            }
        };

        getMatchPost();
    }, [mid, showToast]);

    const handleDeleteMatchPost = async () => {
        if (!matchPost) return;
        if (!window.confirm("Are you sure you want to delete this match post?")) return;

        try {
            const res = await fetch(`/api/matchpost/${matchPost._id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }
            showToast("Success", "Match post deleted", "success");
            navigate(`/${user.username}`);
        } catch (error) {
            showToast("Error", error.message, "error");
        }
    };

    if (loading || fetching) {
        return (
            <Flex justifyContent="center">
                <Spinner size="xl" />
            </Flex>
        );
    }

    if (!matchPost) return <Text>No match post found.</Text>;

    return (
        <>
            <Flex>
                <Flex w="full" alignItems="center" gap={3}>
                    <Avatar src={user?.profilePic} size="md" name={user?.username} />
                    <Flex>
                        <Text fontSize="sm" fontWeight="bold">{user?.username}</Text>
                        <Image src="/verified.png" w={4} h={4} ml={4} />
                    </Flex>
                </Flex>
                <Flex gap={4} alignItems="center">
                    <Text fontSize="xs" width={36} textAlign="right" color="gray.light">
                        {formatDistanceToNow(new Date(matchPost.createdAt))} ago
                    </Text>
                    {currentUser?._id === user._id && <DeleteIcon size={20} onClick={handleDeleteMatchPost} />}
                </Flex>
            </Flex>

            <Text my={3}>{matchPost.text}</Text>

            <Box mb={2}>
                        <Text fontSize={"xs"} fontWeight={"bold"}>Team Name:</Text>
                        <Text fontSize={"sm"}>{matchPost.teamName || "No team name"}</Text>
                    </Box>

                    <Box mb={2}>
                        <Text fontSize={"xs"} fontWeight={"bold"}>Location:</Text>
                        <Text fontSize={"sm"}>{matchPost.location || "No location"}</Text>
                    </Box>

                    <Box mb={2}>
                        <Text fontSize={"xs"} fontWeight={"bold"}>Match Date:</Text>
                        <Text fontSize={"sm"}>{new Date(matchPost.date).toLocaleDateString()}</Text>
                    </Box>

                    <Box mb={2}>
                        <Text fontSize={"xs"} fontWeight={"bold"}>Match Time:</Text>
                        <Text fontSize={"sm"}>{matchPost.time}</Text>
                    </Box>

                    <Box mb={2}>
                        <Text fontSize={"xs"} fontWeight={"bold"}>Game Type:</Text>
                        <Text fontSize={"sm"}>{matchPost.gameType}</Text>
                    </Box>
                    <Box mb={2}>
                        <Text fontSize={"xs"} fontWeight={"bold"}>Payment:</Text>
                        <Text fontSize={"sm"}>{matchPost.payment}</Text>
                    </Box>

            {matchPost.img && (
                <Box borderRadius={6} overflow="hidden" border="1px solid" borderColor="gray.light">
                    <Image src={matchPost.img} w="full" />
                </Box>
            )}

    

            <Divider my={4} />

            {matchPost.replies?.map((reply) => (
                <Comment
                    key={reply._id}
                    reply={reply}
                    lastReply={reply._id === matchPost.replies[matchPost.replies.length - 1]?._id}
                />
            ))}
        </>
    );
};

export default MatchPostPage;
