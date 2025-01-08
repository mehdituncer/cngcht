import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Sidebar için kullanıcı listesini ve son mesajları getiren fonksiyon
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Giriş yapmış kullanıcı dışındaki tüm kullanıcıları getir
    const users = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    
    // Her kullanıcı için son mesajı bul ve kullanıcı bilgilerine ekle
    const usersWithLastMessage = await Promise.all(
      users.map(async (user) => {
        // İki kullanıcı arasındaki son mesajı bul
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: loggedInUserId, receiverId: user._id },
            { senderId: user._id, receiverId: loggedInUserId },
          ],
        }).sort({ createdAt: -1 });

        return {
          ...user.toObject(),
          lastMessage: lastMessage || null,
        };
      })
    );

    // Kullanıcıları son mesaj tarihine göre sırala
    const sortedUsers = usersWithLastMessage.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
    });

    res.status(200).json(sortedUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// İki kullanıcı arasındaki tüm mesajları getiren fonksiyon
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    // İki kullanıcı arasındaki tüm mesajları bul
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Yeni mesaj gönderme fonksiyonu
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Base64 formatındaki resmi Cloudinary'ye yükle
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Yeni mesaj oluştur
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // Alıcı çevrimiçiyse socket üzerinden mesajı ilet
    const receiverSocketIds = getReceiverSocketId(receiverId);
    if (receiverSocketIds) {
      receiverSocketIds.forEach(socketId => {
        io.to(socketId).emit("newMessage", newMessage);
      });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};