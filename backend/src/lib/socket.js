import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from '../models/message.model.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5001"], // Gerekirse diğer portları ekleyin
  },
});

// Kullanıcı soket eşlemeleri
const userSocketMap = {}; // { userId: [socketId1, socketId2] }

// Kullanıcının bağlı olduğu soket ID'lerini almak
export function getReceiverSocketId(userId) {
  return userSocketMap[userId] || [];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  // Bağlanan kullanıcının `userId` bilgisini alın
  const userId = socket.handshake.query.userId;
  if (userId) {
    if (!userSocketMap[userId]) userSocketMap[userId] = [];
    userSocketMap[userId].push(socket.id);
  }

  // Güncel online kullanıcı listesini gönder
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Kullanıcı yazmaya başladığında
  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverSocketIds = getReceiverSocketId(receiverId);
    receiverSocketIds.forEach((id) => {
      io.to(id).emit("typing", { senderId });
    });
  });

  // Kullanıcı yazmayı durdurduğunda
  socket.on("stopTyping", ({ senderId, receiverId }) => {
    const receiverSocketIds = getReceiverSocketId(receiverId);
    receiverSocketIds.forEach((id) => {
      io.to(id).emit("stopTyping", { senderId });
    });
  });

  // Mesaj iletildi durumu
  socket.on("messageDelivered", async ({ messageId, receiverId }) => {
    try {
      await Message.findByIdAndUpdate(messageId, { status: 'delivered' });
      const senderSocketIds = getReceiverSocketId(receiverId);
      senderSocketIds.forEach(id => {
        io.to(id).emit("messageStatusUpdate", { messageId, status: 'delivered' });
      });
    } catch (error) {
      console.error("Error updating message status:", error);
    }
  });

  // Mesaj okundu durumu
  socket.on("messageRead", async ({ messageId, senderId }) => {
    try {
      // Mesajı veritabanında güncelle
      await Message.findByIdAndUpdate(messageId, { status: 'read' });
      
      // Gönderen kullanıcının tüm cihazlarına bildirim gönder
      const senderSockets = getReceiverSocketId(senderId);
      if (senderSockets.length > 0) {
        senderSockets.forEach(socketId => {
          io.to(socketId).emit("messageStatusUpdate", {
            messageId,
            status: 'read'
          });
        });
      }
    } catch (error) {
      console.error("Error updating message read status:", error);
    }
  });

  // Kullanıcı bağlantısını keserse
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    if (userId && userSocketMap[userId]) {
      // Soket ID'sini kullanıcı eşlemesinden kaldır
      userSocketMap[userId] = userSocketMap[userId].filter((id) => id !== socket.id);
      if (userSocketMap[userId].length === 0) delete userSocketMap[userId];
    }
    // Güncel online kullanıcı listesini gönder
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };



