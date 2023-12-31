const asyncHandler = require('express-async-handler');
const User = require("../models/userModel");
const generateToken = require("../Config/generateToken");
const bcrypt = require("bcrypt");
const registerUser = asyncHandler(async(req,res)=>{
    const {name, email, password, pic} = req.body;

    if(!name||!email||!password)
    {
        throw new Error("All fields required");
    }

    const userExist = await User.findOne({email});

    if(userExist){
        throw new Error("User already exists");
    }

    bcrypt.hash(password,10, async(err,hash)=>{
        if(err){
            return res.status(422).json({
                error:err
            })
        }
        else{
            const user = await User.create({
                name,
                email,
                password:hash,
                pic
            })
            if(user){
                res.status(200).json({
                    _id: user._id,
                    name:user.name,
                    email:user.email,
                    pic:user.pic,
                    token: generateToken(user._id)
                })
            }
            else{
                res.status(400);
                throw new Error("Failed to create user");
            }

        }
    })
})

const loginUser = asyncHandler(async(req, res)=>{
    const {email, password} = req.body;

    const user = await User.findOne({email:email})
    if(!user){
        throw new Error("User does not exists");
    }

    bcrypt.compare(password,user.password,(err,result)=>{
        if(err){
            return res.status(500).json({
                error:err
            })
        }
        if(result){
            res.status(200).json({
                _id: user._id,
                name:user.name,
                email:user.email,
                pic:user.pic,
                token: generateToken(user._id)
            })

        }
        else{
            return res.status(401).json({
                error: "Invalid password",
            });
        }
    })

})

const allUser = asyncHandler(async(req,res)=>{
    const keyword  = req.query.search ? {
        $or:[
            {name:{$regex:req.query.search, $options: "i" }},
            {email:{$regex:req.query.search, $options: "i" }}

        ]
    }: {};
  const user = await User.find(keyword).find({_id:{$ne:req.user._id}});;


  res.send(user)

})

module.exports = {registerUser, loginUser, allUser};