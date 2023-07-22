const {Router} = require('express')
const uuid = require('uuid')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const userRouter = Router()
const cloudinary = require('../utils/Cloudinary')
const {protect} = require('../utils/Auth')
require('dotenv').config()

const gen_token = (id, email, admin)=>{
    let token = jwt.sign({id:id, email:email, isAdmin: admin}, process.env.TOKEN_SECRET)
    return token
}
//register user
userRouter.post('/register', async (req, res) => {
    try {
        const {name, email, password, picture}= req.body
        const newPassword = await bcrypt.hash(password, 10)
        const total = await User.countDocuments({})
        // console.log(total)
       
        if (total < 1){
            const saveUser = await User.create({
                name: name,
                email: email,
                password: newPassword,
                isAdmin : true,
            })
            if (saveUser){
                res.status(201).json({message: "user created successfully", data: saveUser})
            }
        }
        const saveUser = await User.create({
            name: name,
            email: email,
            password: newPassword  
        })
        if (saveUser){
            res.status(201).json({message: "user created successfully", data: saveUser})
        }
        
    } catch (error) {
        if(error.code === 11000){
            res.status(400).json({message: "user already exists"})
        }else if (error.code != 11000){
            res.status(400).json({message: error.message})
        }       
    }
})

//login user
userRouter.post("/login", async(req, res)=>{
    try {
        const {email, password} = req.body
        const db_checker = await User.findOne({email: email})
        if(!db_checker){
            res.status(404).json({message: "User not found"})
        }else{
            const saved_password = db_checker.password
            const compare = await bcrypt.compare(password, saved_password)
            const accesstoken = gen_token(db_checker._id, db_checker.email, db_checker.isAdmin)
            if(compare){
                await User.updateOne({email: email},{
                    $set:{
                        token : accesstoken
                    }
                })
                res.status(200).json({
                    message:"login successful",
                    accesstoken: accesstoken ,
                    data: db_checker   
                })
            }else{
                res.status(404).json({message: "password not correct"})
            }
        }
        
    } catch (error) {
        res.status(500).json({message: "Error: " + error.message})
    }
})

// add profile pic

userRouter.post('/user/profile-pic/:id', async(req,res)=>{
    const userid = req.params.id
    const {picture} = req.body
    try{
        const finder = await User.findOne({id:userid})
        if(finder){
            const result = await cloudinary.uploader.upload(picture,{
                folder: 'chat-profile'
            })
            console.log(result)
            await User.updateOne({
                $set:{
                    picture: result.secure_url
                }
            }).then((feedback)=>{
                res.send(feedback)
            }).catch((err)=>{
                res.send(err)
            })
        }else{
            res.send('not found')
        }
       
        
    }catch(error){
        res.status(400).json({message: error.message})
    }
})
 

// get all user 
userRouter.get('/user', async(req,res)=>{
    try {
        data = await User.find()
        res.status(200).json({data: data})
    } catch (error) {
        res.status(500).json({
            message: "server error"
        })
    }
})
// search user

// userRouter.get('/user/find', protect ,async(req,res)=>{
//     const keyword = req.query.search ? {
//         $or: [
//             {name: {$regex: req.query.search, options: 'i' }},
//             {email: {$regex: req.query.search, options: 'i' }}

//         ]
//     } : {}

//     const users = await User.findOne  ({keyword})
//     res.send(users)   
// })
module.exports = userRouter