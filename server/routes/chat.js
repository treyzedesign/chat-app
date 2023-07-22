const {Router} = require('express')
const Chat = require('../models/ChatModel')
const User = require('../models/User')

const {protect} = require('../utils/Auth')

const chatRouter = Router()

chatRouter.post('/accesschat', protect ,async(req,res)=>{
    const {userId} = req.body
    console.log(req.user.id);
    try{
        if(!userId){
            res.status(400).json({message: "user id not recieved"})
        }
        let isChat = await Chat.find({
            isGroupChat: false,
            $and: [
                {users: { $elemMatch:{ $eq: req.user.id } } },
                {users: { $elemMatch:{ $eq: userId } } },
            ]
        }).populate("users", "-password")
          .populate("latestMessage")
        
          isChat = await User.populate(isChat, {
            path: 'latestMsessage.sender',
            select: "name picture email"
          })
        if(!isChat){
            res.status(400).send('bad request')
        }
          if(isChat > 0 ){
            res.send(isChat[0])
          }else{
            var chatData = {
                chatName: "sender",
                isGroupChat: false,
                users: [req.user.id, userId],
              };
          }
        const createdChat = await Chat.create(chatData);
        const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
            "users",
            "-password"
          );
        res.status(200).json({message: FullChat})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// get all chats for user

chatRouter.get('/getChats', protect, async(req,res)=>{
    try {
        Chat.find({ users: { $elemMatch: { $eq: req.user.id } } })
          .populate("users", "-password")
          .populate("groupAdmin", "-password")
          .populate("latestMessage")
          .sort({ updatedAt: -1 })
          .then(async (results) => {
            results = await User.populate(results, {
              path: "latestMessage.sender",
              select: "name pic email",
            });
            res.status(200).send(results);
          });
      } catch (error) {
        res.status(400).send(results);

      }
    
})
module.exports = chatRouter