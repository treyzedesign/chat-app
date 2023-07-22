const express = require('express');
const mongoose = require('mongoose')
const cors = require('cors')
const userRouter = require('./routes/User')
const messageRouter = require('./routes/message')
const chatRouter = require('./routes/chat')

const server = express();
const PORT = 4040
require('dotenv').config()
server.use(cors())
server.use(express.json())

const app = require('http').createServer(server);
const io = require('socket.io')(app, {
    cors:{
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
})

//user routes
server.use('/api/v1', userRouter)
server.use('/api/v1', messageRouter)
server.use('/api/v1', chatRouter)



server.get('*', (req,res) => {
    res.send('This Route does not exists')
})
const startserver = async()=>{
    mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@cluster0.5kk0hsk.mongodb.net/chatbuzz?retryWrites=true&w=majority`)
    app.listen(PORT, ()=>{
        console.log(`server is listening on port ${PORT}`);
    })
}
startserver()
