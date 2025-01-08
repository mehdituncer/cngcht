import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import avatar from "../assets/avatar.png";


const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    isTyping, // Yeni eklenen alan
  } = useChatStore();
  const { authUser, socket } = useAuthStore();
  const messageEndRef = useRef(null);

  // Sort messages by timestamp
  const sortedMessages = messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    // Mesajları görüntülediğinde okundu bilgisi gönder
    if (selectedUser && messages.length > 0) {
      messages.forEach(message => {
        if (message.senderId === selectedUser._id && message.status !== 'read') {
          socket.emit("messageRead", {
            messageId: message._id,
            senderId: message.senderId
          });
        }
      });
    }
  }, [messages, selectedUser, socket]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <span className="text-xs text-gray-500">✓</span>;
      case 'delivered':
        return <span className="text-xs text-gray-500">✓✓</span>;
      case 'read':
        return <span className="text-xs text-blue-500">✓✓</span>;
      default:
        return null;
    }
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {sortedMessages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || avatar
                      : selectedUser.profilePic || avatar
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
              {message.senderId === authUser._id && (
                <div className="text-right mt-1">
                  {getStatusIcon(message.status)}
                </div>
              )}
            </div>
          </div>
        ))}
        {/* Yazıyor bilgisini burada gösteriyoruz */}
        {isTyping && (
          <div className="typing-indicator">
            <span>{selectedUser.name} yazıyor...</span>
          </div>
        )}
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
