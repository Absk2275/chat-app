import { ViewIcon } from '@chakra-ui/icons'
import { Box, Button, FormControl, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure, useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import { ChatState } from '../Context/ChatProvider';
import UserBadgeItem from '../Users/UserBadgeItem';
import axios from 'axios';
import UserListItem from '../Users/UserListItem';

export default function UpdateGroupChatModal({ fetchAgain, setFetchAgain, fetchMessages }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { user, selectedChat, setSelectedChat } = ChatState();

    const [groupChatName, setGroupChatName] = useState();
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameLoading, setRenameLoading] = useState(false);

    const toast = useToast();

    const handleRemove = async (user1) => {
        if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
          toast({
            title: "Only admins can remove someone!",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
          return;
        }
    
        try {
          setLoading(true);
          const config = {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          };
          const { data } = await axios.put(
            `https://chat-again.onrender.com/chat/removeFromGroup`,
            {
              chatId: selectedChat._id,
              userId: user1._id,
            },
            config
          );
    
          user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
          setFetchAgain(!fetchAgain);
          fetchMessages();
          
          setLoading(false);
        } catch (error) {
          toast({
            title: "Error Occured!",
            description: error.response.data.message,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
          setLoading(false);
        }
        setGroupChatName("");
      };
    
    const handleRename = async() =>{
        if(!groupChatName)
        {
            return;
        }
        try{
            setRenameLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }

            const { data } = await axios.put("http://localhost:5000/chat/renameGroup", {
                chatId: selectedChat._id,
                chatName: groupChatName
            },
                config);
                setSelectedChat(data);
                setFetchAgain(!fetchAgain);
                setRenameLoading(false);
        }catch(e)
        {
            toast({
                title: "Error Occured",
                description: e.response.data.message,
                status: "error",
                duration: "5000",
                isClosable: true,
                position: "bottom-left"
            })
            setRenameLoading(false);


        }
        setGroupChatName("");
    }
    const handleSearch = async (query) => {
        setSearch(query);

        if (!query) {

            return;
        }
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }
            const { data } = await axios.get(`http://localhost:5000/user/alluser?search=${search}`, config);

            setLoading(false);
            setSearchResult(data);
        } catch (e) {
            toast({
                title: "Faild to search user ",
                status: "error",
                duration: "5000",
                isClosable: true,
                position: "bottom-left"
            })

        }
    }

    const handleAddUser = async(user1) =>{
        if(selectedChat.groupAdmin._id===user._id)
        {
            toast({
                title: "Only admin can add user ",
                status: "error",
                duration: "5000",
                isClosable: true,
                position: "bottom"
            });
            return;

        }



        if(selectedChat.users.find((u)=>u._id===user1._id))
        {
            toast({
                title: "User already in group ",
                status: "error",
                duration: "5000",
                isClosable: true,
                position: "bottom"
            });
            return;
        }

        try{
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }
            const {data} = await axios.put("http://localhost:5000/chat/addToGroup", {
                chatId: selectedChat._id,
                userId: user1._id
            }, config);
            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setLoading(false);

        }catch(e){
            toast({
                title: "Error Occured!!",
                description: e.response.data.message,
                status: "error",
                duration: "5000",
                isClosable: true,
                position: "bottom"
            });
        }

    }
    return (
        <>
            <IconButton display={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader fontSize="35px" display="flex" justifyContent="center">{selectedChat.chatName}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
                            {selectedChat.users.map((u) =>
                                <UserBadgeItem key={user._id} user={u} handleFunction={() => handleRemove(u)} />
                            )}
                        </Box>
                        <FormControl display="flex">
                            <Input placeholder="Chat Name" mb={3} value={groupChatName}
                                onChange={(e) => setGroupChatName(e.target.value)} />
                            <Button variant="solid" colorScheme="teal" ml={1} isLoading={renameLoading}
                                onClick={handleRename}>
                                Update
                            </Button>
                        </FormControl>

                        <FormControl>
                            <Input placeholder='Add users to group' mb={1} onChange={(e) => { handleSearch(e.target.value)}} />
                        </FormControl>
                        {loading ? (
                            <Spinner size="lg" />
                        ):(searchResult.map((user)=>(
                            <UserListItem key={user._id} user={user} handleFunction={()=>handleAddUser(user)} />
                        )))}

                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='red' mr={3} onClick={()=>handleRemove(user)}>
                            Leave Group
                        </Button>

                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>

    )
}
