import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "./Styles.css";
import { IconButton, Spinner, useToast, InputGroup, InputRightElement, Button } from "@chakra-ui/react";
import { getSender, getSenderFull } from '../config/ChatsLogics';
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./Pages/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "lottie-react";
import animation from "../animation/animation.json"

import io from "socket.io-client";
import UpdateGroupChatModal from "./Pages/UpdateGroupChatModal";
import { ChatState } from "./Context/ChatProvider";
const ENDPOINT = "http://localhost:5000"; // "https://talk-a-tive.herokuapp.com"; -> After deployment
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();

  // const defaultOptions = {
  //   loop: true,
  //   autoplay: true,
  //   animationData: animationData,
  //   rendererSettings: {
  //     preserveAspectRatio: "xMidYMid slice" , 
  //   },
  // };
  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `http://localhost:5000/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
    if ((event && event.key === "Enter" && newMessage) || !event) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "http://localhost:5000/message",
          {
            content: newMessage,
            chatId: selectedChat,
          },
          config
        );
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };


  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);


  useEffect(() => {
    const handleNewMessage = (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification?.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessageRecieved]);
      }
    };

    socket.on("message recieved", handleNewMessage);

    // Cleanup function
    return () => {
      socket.off("message recieved", handleNewMessage);
    };
  }, [selectedChatCompare, notification, fetchAgain, setNotification]);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
        setIsTyping(false); // Update istyping state
      }
    }, timerLength);
  };


  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };



  return (
    <>
      {
        selectedChat ?
          (<>
            <Text fontSize={{ base: "28px", md: "30px" }}
              pb={3} px={2} w="100%" display="flex"
              justifyContent={{ base: "space-between" }}
              alignItems='center'>

              <IconButton display={{ base: "flex", md: "none" }} icon={<ArrowBackIcon />}
                onClick={() => setSelectedChat("")} />
              {!selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}
                  <ProfileModal user={getSenderFull(user, selectedChat.users)} />
                </>
              ) : (
                <>{selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchMessages={fetchMessages} />
                </>
              )}

            </Text>
            <Box display="flex" flexDir="column" justifyContent="flex-end" p={3} bg={"#E8E8E8"} w="100%" h="90%" borderRadius="lg" overflowy="hidden"
            >
              {loading ? (<Spinner size="xl" w={20} h={20} alignSelf="center" margin="auto" />) : (
                <div className='messages'>
                  <ScrollableChat messages={messages} />

                </div>)}
              <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                {istyping ? (
                  <Lottie
                    options={defaultOptions}
                    width={70}
                    style={{ marginTop: 20, marginLeft: 20, width: 70 }}
                    animationData={animation}
                    loop={true}
                  />
                ) : (
                  <></>
                )}
                <InputGroup>
                  <Input
                    variant="filled"
                    bg="#E0E0E0"
                    placeholder="Enter a message"
                    onChange={typingHandler}
                    value={newMessage}
                    onKeyDown={(event) => sendMessage(event)}
                  />
                  <InputRightElement width='4.5rem'>
                    <Button h='1.75rem' size='sm' onClick={() => sendMessage()}>
                      Send
                    </Button>
                  </InputRightElement>
                </InputGroup>

              </FormControl>


            </Box>
          </>) :
          (
            <Box display="flex" alignItems="center" justifyContent="center" h="100%" >
              <Text fontSize="3xl" pb={3} >
                Click on user to start chatting
              </Text>

            </Box>
          )
      }
    </>
  )
};

export default SingleChat;