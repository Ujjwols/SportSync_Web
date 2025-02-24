import { useEffect, useState } from "react";
import UserHeader from "../components/UserHeader";
import { useParams } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";
import { Flex, Spinner, Button } from "@chakra-ui/react";
import Post from "../components/Post";
import MatchPost from "../components/MatchPost"; // import the MatchPost component
import useGetUserProfile from "../hooks/useGetUserProfile";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom";
import matchPostsAtom from "../atoms/matchAtom"; // import a separate atom for match posts

const UserPage = () => {
	const { user, loading } = useGetUserProfile();
	const { username } = useParams();
	const showToast = useShowToast();
	const [posts, setPosts] = useRecoilState(postsAtom);
	const [matchPosts, setMatchPosts] = useRecoilState(matchPostsAtom); // state for match posts
	const [fetchingPosts, setFetchingPosts] = useState(true);
	const [fetchingMatchPosts, setFetchingMatchPosts] = useState(true); // state for fetching match posts

	// State to manage selected section (Posts or Matchmaking)
	const [selectedSection, setSelectedSection] = useState("Posts");

	useEffect(() => {
		const getPosts = async () => {
			if (!user) return;
			setFetchingPosts(true);
			try {
				const res = await fetch(`/api/posts/user/${username}`);
				const data = await res.json();
				console.log(data);
				setPosts(data);
			} catch (error) {
				showToast("Error", error.message, "error");
				setPosts([]);
			} finally {
				setFetchingPosts(false);
			}
		};

		const getMatchPosts = async () => {
			if (!user) return;
			setFetchingMatchPosts(true);
			try {
				const res = await fetch(`/api/matchpost/user/${username}`);
				const data = await res.json();
				console.log(data);
				setMatchPosts(data);
			} catch (error) {
				showToast("Error", error.message, "error");
				setMatchPosts([]);
			} finally {
				setFetchingMatchPosts(false);
			}
		};

		getPosts();
		getMatchPosts();
	}, [username, showToast, setPosts, setMatchPosts, user]);

	if (!user && loading) {
		return (
			<Flex justifyContent={"center"}>
				<Spinner size={"xl"} />
			</Flex>
		);
	}

	if (!user && !loading) return <h1>User not found</h1>;

	return (
		<>
			<UserHeader user={user} />

			{/* Tabs for selecting Posts or Matchmaking */}
			<Flex w="full" justifyContent="center" mb={4} mt={3}>
				<Button
					onClick={() => setSelectedSection("Posts")}
					variant={selectedSection === "Posts" ? "solid" : "outline"}
					flex="1" // This ensures both buttons have equal size
					mr={2} // Optional: Adds some space between buttons
				>
					Posts
				</Button>
				<Button
					onClick={() => setSelectedSection("Matchmaking")}
					variant={selectedSection === "Matchmaking" ? "solid" : "outline"}
					flex="1" // This ensures both buttons have equal size
					ml={2} // Optional: Adds some space between buttons
				>
					Matchmaking
				</Button>
			</Flex>
			{/* Conditional rendering based on selected section */}
			{selectedSection === "Posts" && (
				<>
					{/* Regular posts */}
					{!fetchingPosts && posts.length === 0 && <h1>User has not posted any posts.</h1>}
					{fetchingPosts && (
						<Flex justifyContent={"center"} my={12}>
							<Spinner size={"xl"} />
						</Flex>
					)}
					{posts.map((post) => (
						<Post key={post._id} post={post} postedBy={post.postedBy} />
					))}
				</>
			)}

			{selectedSection === "Matchmaking" && (
				<>
					{/* Matchmaking posts */}
					{!fetchingMatchPosts && matchPosts.length === 0 && <h1>User has not posted any matchmaking posts.</h1>}
					{fetchingMatchPosts && (
						<Flex justifyContent={"center"} my={12}>
							<Spinner size={"xl"} />
						</Flex>
					)}
					{matchPosts.map((matchPost) => (
						<MatchPost key={matchPost._id} matchPost={matchPost} postedBy={matchPost.postedBy} />
					))}
				</>
			)}
		</>
	);
};

export default UserPage;
