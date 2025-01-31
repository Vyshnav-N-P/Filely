const http = require("http");
const { Server } =requrie('socket.io');

const server = http.createServer();
const io=new Server(server , {
    cors :{ 
        origin: "*", // Allow all origins (adjust for production)
    }, 
});

io.on(connection, (socket)=>{
    console.log("User connected:", socket.id);

    socket.on("offer", (data) => {
        socket.broadcast.emit("offer", data);
      });

    socket.on('answer', (data) => {
        socket.broadcast.emit('answer', data);
    })
    socket.on('icecandidate', (data) => {
        socket.broadcast.emit('icecandidate', data);
    })
    socket.on('disconnect', () => {
        console.log("User disconnected:", socket.id);
    });
});

 