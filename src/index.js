const path = require('path')

const http = require('http')

const express = require('express')

const app = express()

const Filter = require('bad-words')

const server = http.createServer(app) //create server by passing the express app

const socketio = require('socket.io')

const io = socketio(server)// pass the http server as the argument for socketio

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')


const { generateMessage, generateLocationMessage } = require('./utils/messages')

const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('new connection')

    // socket.emit('message',generateMessage('Welcome'))


    // socket.broadcast.emit('message',generateMessage('A new user has joined our chat'))

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })


        if (error) {
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`A new user: ${user.username} has joined.`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })

        callback()
        //socket.emit
        //io.emit
        //socket.broadcast
        //io.to.emit (emit an event to everybody in ***specific*** room)
        //socket.broadcast.to.emit
    })
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message', generateMessage(user.username,message))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin',`A user: ${user.username} has left our chat`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }


    })

})



server.listen(port, () => { // use server to listen the events
    console.log(`Server is up on port ${port}`)
})