/* eslint-disable @typescript-eslint/no-require-imports */
//import express from 'express';
//import http from 'http';
// import { Server } from 'socket.io';
// import cors from 'cors';

const express = require('express');
const http = require('http');
const app = express();
const cors = require('cors');
const {Server} = require('socket.io');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://filely.netlify.app/",
    methods: ["GET", "POST"]
  }
});

// Enable CORS for the Express app
app.use(cors({
  origin: ["http://localhost:3000","https://filely.netlify.app"], // Allow only localhost:3000
  methods: ["GET", "POST"],
}));

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    socket.to(roomId).emit("user-joined", socket.id);
  });

  socket.on("offer", ({ target, offer }) => {
    socket.to(target).emit("offer", { sender: socket.id, offer });
  });

  socket.on("answer", ({ target, answer }) => {
    socket.to(target).emit("answer", { sender: socket.id, answer });
  });

  socket.on("ice-candidate", ({ target, candidate }) => {
    socket.to(target).emit("ice-candidate", { sender: socket.id, candidate });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});
app.get( '' , (req ,res ) => {
  res.send("FILELY PROPERTY");
});
server.listen(5000, () => {
  console.log("Server is running on port 5000");
});




