import { Avatar } from "@chakra-ui/avatar";
import { Box, Flex, Text } from "@chakra-ui/layout";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { formatDistanceToNow } from "date-fns";
import { DeleteIcon } from "@chakra-ui/icons";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import matchPostsAtom from "../atoms/matchAtom";
import { Button } from "@chakra-ui/react";
import { BsFillChatQuoteFill } from "react-icons/bs";

const MatchPost = ({ matchPost, postedBy }) => {
    const [user, setUser] = useState(null);
    const showToast = useShowToast();
    const currentUser = useRecoilValue(userAtom);
    const [matchPosts, setMatchPosts] = useRecoilState(matchPostsAtom);
    const navigate = useNavigate();

    useEffect(() => {
        const getUser = async () => {
            try {
                const res = await fetch("/api/users/profile/" + postedBy);
                const data = await res.json();
                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                setUser(data);
            } catch (error) {
                showToast("Error", error.message, "error");
                setUser(null);
            }
        };

        getUser();
    }, [postedBy, showToast]);

    const handleDeleteMatchPost = async (e) => {
        try {
            e.preventDefault();
            if (!window.confirm("Are you sure you want to delete this match post?")) return;

            const res = await fetch(`/api/matchpost/${matchPost._id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }
            showToast("Success", "Match post deleted", "success");
            setMatchPosts(matchPosts.filter((mp) => mp._id !== matchPost._id));
        } catch (error) {
            showToast("Error", error.message, "error");
        }
    };

    // Function to handle invalid date formats
    // const formatDate = (date) => {
    //     const parsedDate = new Date(date);
    //     if (isNaN(parsedDate)) {
    //         return "Invalid date";
    //     }
    //     return parsedDate.toLocaleDateString();
    // };

    if (!user) return null;

    return (
        <Link to={`/${user.username}/matchpost/${matchPost._id}`}>
            <Flex gap={3} mb={4} py={5}>
                <Flex flexDirection={"column"} alignItems={"center"}>
                    <Avatar
                        size='md'
                        name={user.name}
                        src={user?.profilePic}
                        onClick={(e) => {
                            e.preventDefault();
                            navigate(`/${user.username}`);
                        }}
                    />
                    <Box w='1px' h={"full"} bg='gray.light' my={2}></Box>
                </Flex>
                <Flex flex={1} flexDirection={"column"} gap={2}>
                    <Flex justifyContent={"space-between"} w={"full"}>
                        <Flex w={"full"} alignItems={"center"}>
                            <Text
                                fontSize={"sm"}
                                fontWeight={"bold"}
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate(`/${user.username}`);
                                }}
                            >
                                {user?.username}
                            </Text>
                        </Flex>
                        <Flex gap={4} alignItems={"center"}>
                            <Text fontSize={"xs"} width={36} textAlign={"right"} color={"gray.light"}>
                                {formatDistanceToNow(new Date(matchPost.createdAt))} ago
                            </Text>

                            {currentUser?._id === user._id && <DeleteIcon size={20} onClick={handleDeleteMatchPost} />}
                        </Flex>
                    </Flex>

                    {matchPost.img && (
                         <Box mb={2}>
                            <img
                                src={matchPost.img}
                                alt="Match Post"
                                style={{ width: "100%", height: "auto", borderRadius: "8px" }}
                            />
                        </Box>
                    )}

                    <Text fontSize={"sm"}>{matchPost.text}</Text>

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

                    <Flex gap={3} my={1}>
                        <Button as={Link} to={`/chat`}>
                            <BsFillChatQuoteFill size={20} />
                            {/* Connect */}
                        </Button>
                    </Flex>
                </Flex>
            </Flex>
        </Link>
    );
};

export default MatchPost;
