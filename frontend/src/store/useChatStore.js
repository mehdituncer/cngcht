import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  // State değişkenleri
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // Sidebar için tüm kullanıcıları getir
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Seçili kullanıcı ile olan mesajlaşma geçmişini getir
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Yeni mesaj gönderme işlemi
  sendMessage: async (messageData) => {
    const { selectedUser, messages, users } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      const message = { ...res.data, status: 'sent' };
      set({ messages: [...messages, message] });

      // Mesajları güncelle
      set({ messages: [...messages, res.data] });

      // Kullanıcı listesini güncelle
      const updatedUsers = [...users];
      const userIndex = updatedUsers.findIndex(u => u._id === selectedUser._id);
      
      if (userIndex !== -1) {
        const userToUpdate = { ...updatedUsers[userIndex], lastMessage: res.data };
        updatedUsers.splice(userIndex, 1);
        updatedUsers.unshift(userToUpdate);
        set({ users: updatedUsers });
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  // Toplu mesaj gönderme işlemi
  sendMessageToMultiple: async ({ userIds, text, image }) => {
    try {
      const promises = userIds.map(userId =>
        axiosInstance.post(`/messages/send/${userId}`, { text, image })
      );
      await Promise.all(promises);
      toast.success("Message sent to selected users");
    } catch (error) {
      toast.error("Failed to send message to some users");
      console.error("Error sending message to multiple users:", error);
    }
  },

  // Socket.io ile gerçek zamanlı mesaj dinleyicisini başlat
  subscribeToMessages: () => {
    const { selectedUser } = get();
    const currentUserId = useAuthStore.getState().user?._id;

    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      // Gelen mesajın, seçilen kullanıcıyla ilişkili olup olmadığını kontrol et
      const isMessageFromSelectedUser = newMessage.senderId === selectedUser._id;
      const isMessageForCurrentUser = newMessage.receiverId === currentUserId;

      if (!isMessageFromSelectedUser && !isMessageForCurrentUser) return;

      // Yeni mesajı state'e ekle
      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  // Socket.io mesaj dinleyicisini kaldır
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  // Aktif sohbet kullanıcısını belirle
  setSelectedUser: (selectedUser) => set({ selectedUser }),

  // Kullanıcı listesini güncelle
  setUsers: (users) => {
    set({ users });
  },

  // Yeni mesaj geldiğinde kullanıcı sıralamasını güncelle
  updateUserOrder: (senderId, receiverId, newMessage) => {
    const { users } = get();
    const updatedUsers = [...users];
    
    // İlgili kullanıcıyı bul ve son mesajı güncelle
    const userToUpdate = updatedUsers.find(u => 
      u._id === (get().selectedUser?._id === senderId ? receiverId : senderId)
    );
    
    if (userToUpdate) {
      userToUpdate.lastMessage = newMessage;
      // Kullanıcıyı listeden çıkar ve en başa ekle
      const filteredUsers = updatedUsers.filter(u => u._id !== userToUpdate._id);
      set({ users: [userToUpdate, ...filteredUsers] });
    }
  },
  
  // Socket.io olay dinleyicilerini kur
  setupSocketListeners: (socket) => {
    if (!socket) return;
    
    // Yeni mesaj geldiğinde
    socket.on("newMessage", (message) => {
      const { selectedUser, messages } = get();
      const currentUserId = useAuthStore.getState().user?._id;

      if (selectedUser?._id === message.senderId) {
        // Kullanıcı aktif sohbette ise mesajı direkt okundu olarak işaretle
        socket.emit("messageRead", {
          messageId: message._id,
          senderId: message.senderId
        });
        set({ messages: [...messages, { ...message, status: 'read' }] });
      } else {
        // Değilse iletildi olarak işaretle
        socket.emit("messageDelivered", {
          messageId: message._id,
          receiverId: message.senderId
        });
        set({ messages: [...messages, { ...message, status: 'delivered' }] });
      }
    });

    // Mesaj durumu güncellendiğinde
    socket.on("messageStatusUpdate", ({ messageId, status }) => {
      get().updateMessageStatus(messageId, status);
    });

    return () => {
      socket.off("newMessage");
    };
  },

  // Mesaj durumunu güncelle (okundu, iletildi vb.)
  updateMessageStatus: (messageId, status) => {
    const { messages } = get();
    const updatedMessages = messages.map(message => 
      message._id === messageId ? { ...message, status } : message
    );
    set({ messages: updatedMessages });
  },
}));
