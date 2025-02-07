const http = require("http");
const { Server } =require('socket.io');

const server = http.createServer();
const io=new Server(server , {
    cors :{ 
        origin: "*", // Allow all origins (adjust for production)
    }, 
});

io.on("connection", (socket)=>{
    console.log("User connected:", socket.id);

    socket.on("offer", (data) => {
        socket.to().emit("offer", data);
      });

    socket.on('answer', (data) => {
        socket.to().emit('answer', data);``
    })
    socket.on('icecandidate', (data) => {
        socket.to().emit('icecandidate', data);
    })
    socket.on('disconnect', () => {
        console.log("User disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Signaling server is running on port ${PORT}`));
