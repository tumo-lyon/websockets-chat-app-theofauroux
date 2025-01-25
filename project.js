import { createServer } from 'node:http';
import express from 'express';
import { Server } from 'socket.io';


const app = express();
const server = createServer(app);
const io = new Server(server);
app.use(express.static('public'));
const typingUsers = new Set();

app.get('/', (req,res) => {
    res.redirect('/index.html');
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});

io.on('connection', (socket) => {
	console.log(`Un client s'est connecté: ${socket.conn.remoteAdress}`);

    socket.on("typing_start", () =>{
        typingUsers.add(socket.conn.remoteAddress);
        io.emit('typing', Array.from(typingUsers));
    })

    socket.on("typing_stop", ()=> {
        typingUsers.delete(socket.conn.remoteAddress);
        io.emit('typing', Array.from(typingUsers));
    })
    io.emit('system_message', {
        content : `Bienvenue sur le chat de tumo`
    });

        

    io.on("disconnected", () => {
        console.log(`Un client s'est déconnecté: ${socket.conn.remoteAdress}`);
    })

    socket.on("user_message_send", (data) => {
        console.log(`Message: ${data.content}`);
        io.emit("user_message", {
            author : socket.conn.remoteAddress,
            content : data.content,
            time : new Date().toLocaleTimeString(),
            isMe : false,
        })
    
    })
});


