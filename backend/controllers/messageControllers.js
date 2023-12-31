const expressAsyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModels");

const sendMessage = expressAsyncHandler(async(req, res)=>{
    const {content, chatId} = req.body;

    if(!content || !chatId) {
        console.log("invalid data");
        return res.sendStatus(400);
    }

    let newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId 
    }

    try {
        let message = await Message.create(newMessage);

        message = await message.populate("sender", "name pic");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
             select: "name email pic"
        })
        
        await Chat.findByIdAndUpdate(req.body.chatId, {
            latestMessage: message,
        });
        res.json(message); 

    }catch(e){
        res.status(400);
        throw new Error(e.message);

    }

})

const allMessage = expressAsyncHandler(async (req, res) => {
    try {
      const messages = await Message.find({ chat: req.params.chatId })
        .populate("sender", "name pic email")
        .populate({
          path: "chat",
          populate: {
            path: "users",
            select: "name email pic",
          },
        });
  
      res.json(messages);
    } catch (e) {
      res.status(400);
      throw new Error(e.message);
    }
  });
  
module.exports= {sendMessage, allMessage};