import { Avatar, Box, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Input, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Spinner, Text, Tooltip, useDisclosure, useToast } from '@chakra-ui/react';
import React, { useState } from 'react'
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { ChatState } from '../Context/ChatProvider';
import ProfileModal from './ProfileModal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChatLoading from './ChatLoading';
import UserListItem from '../Users/UserListItem';
import { getSender } from '../../config/ChatsLogics';
import NotificationBadge from 'react-notification-badge';
import {Effect} from 'react-notification-badge';

export default function SideDrawer() {
  const { user, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();

  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please write something to search",
        status: "warning",
        duration: "5000",
        isClosable: true,
        position: "top-left"
      })
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      }

      const { data } = await axios.get(`http://localhost:5000/user/alluser?search=${search}`, config);

      setSearchResult(data);
      setLoading(false);

    }
    catch (e) {
      toast({
        title: "Error Occured",
        status: "error",
        duration: "5000",
        isClosable: true,
        position: "bottom-left"
      })
    }
  }

  const accessChat = async(userId) => {
    try{
        setLoadingChat(true);
        const config = {
          headers: {
            "Content-Type":"application/json",
            Authorization: `Bearer ${user.token}`
          }
        }
        const {data} = await axios.post("http://localhost:5000/chat/accessChat", {userId}, config);
        if(!chats.find((c)=>c._id===data._id )){
          setChats([data, ...chats]);
        }
        setSelectedChat(data);
        setLoadingChat(false);

    }catch(e){
      toast({
        title: "Error fetching chats",
        description:e.message,
        status: "error",
        duration: "5000",
        isClosable: true,
        position: "bottom-left"
      })
    }

  }
  const navigate = useNavigate();
  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  }

  
  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" bg="white" w="100%" p="5px 10px 5px 10px" borderWidth="5px">
        <Tooltip label="Search user chat" hasArrow placement='bottom'>
          <Button variant="ghost" onClick={onOpen}><i class="fa fa-search" aria-hidden="true"></i>
            <Text display={{ base: "none", md: "flex" }} px="4">Search user</Text>
          </Button>
        </Tooltip>
        <Text fontSize="2xl" fontFamily="cursive">Chat-Again</Text>
        <div>
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge count={notification.length}
              effect={Effect.SCALE} />
              <BellIcon fontSize="2xl" m={1} /></MenuButton>
            <MenuList pl={2}>
              {!notification?.length && "No New Messages"}
              {notification?.map((noti)=>(
                <MenuItem key={noti._id} onClick={()=>{
                  setSelectedChat(noti.chat);
                  setNotification(notification.filter((n)=>n!==noti));

                }}>
                  {noti.chat.isGroupChat?`New message in ${noti.chat.chatName}`
                  : `New message from ${getSender(user, noti.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>

          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar size="sm" cursor="pointer" name={user.name} src={user.pic}></Avatar>
            </MenuButton>
            <MenuList>
              <ProfileModal user={user} >
                <MenuItem >My Profile</MenuItem>
              </ProfileModal>

              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search User</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input placeholder='Search by email or name' mr={2} value={search} onChange={(e) => setSearch(e.target.value)} />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem key={user._id} user={user} handleFunction={() => accessChat(user._id)} />
              ))
            )}

            {loadingChat && <Spinner ml="auto" display="flex"/>}

          </DrawerBody>
        </DrawerContent>



      </Drawer>
    </div>
  )
}
