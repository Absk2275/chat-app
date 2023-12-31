import { Box, Button, FormControl, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, useToast } from '@chakra-ui/react';
import React, { useState } from 'react'
import { ChatState } from '../Context/ChatProvider';
import axios from 'axios';
import UserListItem from '../Users/UserListItem';
import UserBadgeItem from '../Users/UserBadgeItem';

export default function GroupChatModal({ children }) {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [groupChatName, setGroupChatName] = useState();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);

    const toast = useToast();
    const { user, chats, setChats } = ChatState();

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
            const { data } = await axios.get(`https://chat-again.onrender.com/user/alluser?search=${search}`, config);

            setLoading(false);
            setSearchResult(data);
        } catch (e) {
            toast({
                title: "Error Occured",
                status: "error",
                duration: "5000",
                isClosable: true,
                position: "bottom-left"
            })

        }
    }
    const handleGroup = (userToAdd) => {
        if (selectedUsers.includes(userToAdd)) {
            toast({
                title: "User Already Added",
                status: "warning",
                duration: "5000",
                isClosable: true,
                position: "top"
            })
            return;
        }

        setSelectedUsers([...selectedUsers, userToAdd]);

    }
    const handleDelete = (deleteUser) => {
        setSelectedUsers(selectedUsers.filter(sel => sel._id !== deleteUser._id))
    }
    const handleSubmit = async () => {

        if (!groupChatName || !selectedUsers) {
            toast({
                title: "Please fill all the fields",
                status: "warning",
                duration: "5000",
                isClosable: true,
                position: "top"
            })
            return;
        }
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }
            const { data } = await axios.post("http://localhost:5000/chat/group", {
                name: groupChatName,
                users: JSON.stringify(selectedUsers.map((u) => u._id))
            }, config);

            setChats([data, ...chats]);
            onClose();
            toast({
                title: "New Group Chat Created",
                status: "success",
                duration: "5000",
                isClosable: true,
                position: "bottom"
            })
        }
        catch (e) {
            toast({
                title: "Failed to create group chat",
                description: e.response.data,
                status: "error",
                duration: "5000",
                isClosable: true,
                position: "bottom"
            })

        }
    }

    return (
        <>
            <span onClick={onOpen}>{children}</span>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader fontSize="35px" display="flex" justifyContent="center">Create Group Chat</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display="flex" flexDir="column" alignItems="center">
                        <FormControl>
                            <Input placeholder='Chat Name' mb={3} onChange={(e) => setGroupChatName(e.target.value)} />
                        </FormControl>
                        <FormControl>
                            <Input placeholder='Add users Eg: Abhishek, Bibek, Neha' mb={1} onChange={(e) => { handleSearch(e.target.value) }} />
                        </FormControl>
                        <Box w="100%" display="flex" flexWrap="wrap">
                            {selectedUsers.map(u => (
                                <UserBadgeItem key={user._id} user={u} handleFunction={() => handleDelete(u)} />
                            ))}
                        </Box>
                        {loading ? (<div>Loading</div>) :
                            (searchResult?.slice(0, 4).map((user) => (
                                <UserListItem key={user._id} user={user} handleFunction={() => handleGroup(user)} />
                            )))}
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' onClick={handleSubmit}>
                            Create Chat
                        </Button>

                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}
