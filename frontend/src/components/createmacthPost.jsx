import { AddIcon } from "@chakra-ui/icons";
import {
	Button,
	CloseButton,
	Flex,
	FormControl,
	Image,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
	Textarea,
	useColorModeValue,
	useDisclosure,
	Select,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import usePreviewImg from "../hooks/usePreviewImg";
import { BsFillImageFill } from "react-icons/bs";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";

const MAX_CHAR = 500;

const CreateMatchmakingPost = () => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [matchpostText, setPostText] = useState("");
	const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
	const imageRef = useRef(null);
	const [remainingChar, setRemainingChar] = useState(MAX_CHAR);
	const user = useRecoilValue(userAtom);
	const showToast = useShowToast();
	const [loading, setLoading] = useState(false);

	const [teamName, setTeamName] = useState("");
	const [location, setLocation] = useState("");
	const [date, setDate] = useState("");
	const [time, setTime] = useState("");
	const [gameType, setGameType] = useState("");
	const [payment, setPayment] = useState("");

	const handleTextChange = (e) => {
		const inputText = e.target.value;

		if (inputText.length > MAX_CHAR) {
			const truncatedText = inputText.slice(0, MAX_CHAR);
			setPostText(truncatedText);
			setRemainingChar(0);
		} else {
			setPostText(inputText);
			setRemainingChar(MAX_CHAR - inputText.length);
		}
	};

	const handleCreateMatchmakingPost = async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/matchpost/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					postedBy: user._id,
					text: matchpostText,
					img: imgUrl,
					teamName,
					location,
					date,
					time,
					gameType,
					payment,
				}),
			});

			const data = await res.json();
			if (data.error) {
				showToast("Error", data.error, "error");
				return;
			}
			showToast("Success", "Matchmaking post created successfully", "success");
			onClose();
			setPostText("");
			setImgUrl("");
			setTeamName("");
			setLocation("");
			setDate("");
			setTime("");
			setGameType("");
			setPayment("");
		} catch (error) {
			showToast("Error", error, "error");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Button
				position={"fixed"}
				top={10}
				right={5}
				bg={useColorModeValue("gray.300", "gray.dark")}
				onClick={onOpen}
				size={{ base: "sm", sm: "md" }}
				display="flex"
				alignItems="center"
				gap={2} // Adds space between the icon and text
				>
				<AddIcon />
				<Text>MatchPosts</Text>
			</Button>


			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />

				<ModalContent>
					<ModalHeader>Create Matchmaking Post</ModalHeader>
					<ModalCloseButton />
					<ModalBody pb={6}>
						<FormControl>
							<Textarea
								placeholder='Post content goes here..'
								onChange={handleTextChange}
								value={matchpostText}
							/>
							<Text fontSize='xs' fontWeight='bold' textAlign={"right"} m={"1"} color={"gray.800"}>
								{remainingChar}/{MAX_CHAR}
							</Text>

							<Input
								placeholder='Team Name'
								value={teamName}
								onChange={(e) => setTeamName(e.target.value)}
								mb={2}
							/>
							<Input
								placeholder='Location'
								value={location}
								onChange={(e) => setLocation(e.target.value)}
								mb={2}
							/>
							<Input
								type='date'
								value={date}
								onChange={(e) => setDate(e.target.value)}
								mb={2}
							/>
							<Input
								type='time'
								value={time}
								onChange={(e) => setTime(e.target.value)}
								mb={2}
							/>
							<Select
								placeholder='Select game type'
								value={gameType}
								onChange={(e) => setGameType(e.target.value)}
								mb={2}
							>
								<option value='Football'>Football</option>
								<option value='Basketball'>Basketball</option>
								<option value='Tennis'>Futsal</option>
							</Select>
							<Input
								placeholder='Payment'
								value={payment}
								onChange={(e) => setPayment(e.target.value)}
								mb={2}
							/>

							<Input type='file' hidden ref={imageRef} onChange={handleImageChange} />

							<BsFillImageFill
								style={{ marginLeft: "5px", cursor: "pointer" }}
								size={16}
								onClick={() => imageRef.current.click()}
							/>
						</FormControl>

						{imgUrl && (
							<Flex mt={5} w={"full"} position={"relative"}>
								<Image src={imgUrl} alt='Selected img' />
								<CloseButton
									onClick={() => {
										setImgUrl("");
									}}
									bg={"gray.800"}
									position={"absolute"}
									top={2}
									right={2}
								/>
							</Flex>
						)}
					</ModalBody>

					<ModalFooter>
						<Button colorScheme='blue' mr={10} onClick={handleCreateMatchmakingPost} isLoading={loading}>
							Post
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default CreateMatchmakingPost;