import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import axios from "axios";
export default function Signup() {
    const [show, setShow] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmpassword, setConfirmpassword] = useState("");
    const [pic, setPic] = useState("");
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const postImage = (pics) => {
        setLoading(true);
      
        if (pics === undefined) {
          showToast("Please select an image (JPEG or PNG)", "warning");
          setLoading(false);
          return;
        }
      
        if (pics.type === "image/jpeg" || pics.type === "image/png") {
          console.log("Image Uploaded");
          const data = new FormData();
          data.append("file", pics);
          data.append("upload_preset", "chat-App");
          data.append("cloud_name", "dnr0ppzpn");
          data.append("api_key", "557681952151673");
      
          fetch("https://api.cloudinary.com/v1_1/dnr0ppzpn/image/upload", {
            method: "post",
            body: data,
            mode: "cors",
          })
            .then((res) => res.json())
            .then((data) => {
              console.log(data);
              setPic(data.url.toString());
              setLoading(false);
            })
            .catch((err) => {
              console.error("Error uploading image:", err);
              setLoading(false);
            });
        } else {
          showToast("Please select an image (JPEG or PNG)", "warning");
          setLoading(false);
        }
      }

    const showToast = (title, status) => {
            toast({
                title: title,
                status: status,
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
    };

        const submitHandler = async() => {
            setLoading(true);
            if(!name||!email||!password||!confirmpassword)
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
            if(password !== confirmpassword)
            {
                toast({
                    title: "Password Does not Match",
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

                const {data} = await axios.post("https://chat-again.onrender.com/user/register",{name,email,password,pic}, config);
             
               
                    toast({
                        title: "Registration Success",
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                        position: "bottom",
                    });
                    
                    localStorage.setItem("userInfo", JSON.stringify(data))
                    setLoading(false);


            }catch(e){
                toast({
                    title: "Registration Failed",
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
                <FormControl id="first-name" isRequired>
                    <FormLabel>Name</FormLabel>
                    <Input placeholder='Enter your name' onChange={(e) => setName(e.target.value)} />
                </FormControl>

                <FormControl id="email" isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input placeholder='Enter your email' onChange={(e) => setEmail(e.target.value)} />
                </FormControl>
                <FormControl id="password" isRequired>
                    <FormLabel>Password</FormLabel>
                    <InputGroup>
                        <Input type={show ? "text" : "password"} placeholder='Enter your password' onChange={(e) => setPassword(e.target.value)} />
                        <InputRightElement width="4.5rem">
                            <Button h="1.75rem" size="sm" onClick={handleClick}>
                                {show ? "Hide" : "Show"}
                            </Button>
                        </InputRightElement>
                    </InputGroup>
                </FormControl>

                <FormControl id="confirm-password" isRequired>
                    <FormLabel>Confirm Password</FormLabel>
                    <InputGroup>
                        <Input type={show ? "text" : "password"} placeholder='Re-Enter your password' onChange={(e) => setConfirmpassword(e.target.value)} />
                        <InputRightElement width="4.5rem">
                            <Button h="1.75rem" size="sm" onClick={handleClick}>
                                {show ? "Hide" : "Show"}
                            </Button>
                        </InputRightElement>
                    </InputGroup>
                </FormControl>

                <FormControl id="pic" isRequired>
                    <FormLabel>Upload Your Picture</FormLabel>
                    <Input type="file" p={1.5} accept="image/*" placeholder='Upload your Image' onChange={(e) => postImage(e.target.files[0])} />
                </FormControl>

                <Button colorScheme='blue' width="100%" style={{ marginTop: 15 }} onClick={submitHandler} isLoading={loading}>
                    Sign Up
                </Button>

            </VStack>
        )
    }
