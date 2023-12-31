import React, { useState } from 'react';
import { Flex} from '@chakra-ui/react';
import { ChatState } from './Context/ChatProvider';
import SideDrawer from "./Pages/SideDrawer";
import MyChats from "./Pages/MyChats";
import ChatBox from "./Pages/ChatBox";
function ChatPage() {
const {user} = ChatState();
const [fetchAgain, setFetchAgain] = useState(false);


  return (
    <div style={{width:"100%", }}>
      {user && <SideDrawer/>}
      
      <Flex justify="space-between" w="100%" h="91.5vh" p="10px">
        {user && <MyChats  fetchAgain={fetchAgain} />}
        {user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
      </Flex>
     
      
    </div>
  )
}

export default ChatPage;