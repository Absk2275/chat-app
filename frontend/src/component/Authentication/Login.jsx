import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack, useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import axios from "axios";
import { useNavigate } from 'react-router-dom';
export default function Login() {
    const navigate = useNavigate();
    const [show, setShow] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const submitHandler = async() => {
        setLoading(true);
        if(!email||!password)
            {
                toast({
                    title: "All fields required",
                    status: "warning",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
                setLoading(false);
                return
            }

            try{
                const config ={
                    headers:{
                        "Content-type" :"application/json", 
                    }
                };
                const {data} = await axios.post("http://localhost:5000/user/login",{email,password}, config);
                toast({
                    title: "Login Success",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
                localStorage.setItem("userInfo", JSON.stringify(data));

                setLoading(false);
                navigate("/chats")
                console.log("login success");

            }catch(e){
                toast({
                    title: "Login Failed",
                    description: e.response.data.message,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
                setLoading(false);

            }
    }
    const handleClick = () => {
        setShow(!show);
    }
    return (
        <VStack spacing="5px">


            <FormControl id="email-login" isRequired>
                <FormLabel>Email</FormLabel>
                <Input placeholder='Enter your email' onChange={(e) => setEmail(e.target.value)} value={email}/>
            </FormControl>
            <FormControl id="password-login" isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                    <Input type={show ? "text" : "password"} placeholder='Enter your password' onChange={(e) => setPassword(e.target.value)} value={password}/>
                    <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={handleClick}>
                            {show ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            <Button colorScheme='blue' width="100%" style={{ marginTop: 15 }} onClick={submitHandler} isLoading={loading}>
                Login
            </Button>
            <Button variant="solid" colorScheme='red' width="100%" style={{ marginTop: 15 }}  onClick={() => {
                setEmail("guest@achatagain.com");
                setPassword("12345678")
                
            }}>
                Login with Guest Credentials
            </Button>

        </VStack>
    )
}

