export function formatMessageTime(date) {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });


    
  }
  export const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play();
  };