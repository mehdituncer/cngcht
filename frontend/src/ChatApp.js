import { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5001", {
  query: { userId: "yourUserId" },
});

function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Gelen mesajları dinle
    socket.on("receiveMessage", ({ senderId, message }) => {
      setMessages((prev) => [...prev, { senderId, message }]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const sendMessage = () => {
    const newMessage = { senderId: "yourUserId", receiverId: "receiverUserId", message };
    setMessages((prev) => [...prev, newMessage]); // Mesajı kendi tarafında göster
    socket.emit("sendMessage", newMessage); // Mesajı sunucuya gönder
    setMessage(""); // Mesaj kutusunu temizle
  };

  return (
    
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.senderId}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default ChatApp;
