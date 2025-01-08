import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import MessageInput from "./MessageInput";
import avatar from "../assets/avatar.png";

export default function MultipleChat() {
  const [userIds, setUserIds] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const { sendMessageToMultiple, users } = useChatStore();

  useEffect(() => {
    const ids = searchParams.get("userIds")?.split(",") || [];
    setUserIds(ids);
    setSelectedUsers(users.filter(user => ids.includes(user._id)));
    setLoading(false);
  }, [searchParams, users]);

  const handleSend = async ({ text, image }) => {
    if (!userIds.length) return;
    await sendMessageToMultiple({ userIds, text, image });
  };

  if (loading) return <div>Loading multiple chat...</div>;

  return (

      <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex flex-col h-full rounded-lg overflow-hidden ">

          <div className="flex items-center p-4 gap-4 border-b border-base-300">
          {selectedUsers.map(user => (
            <div key={user._id} className="flex items-center gap-2">
              <img
                src={user.profilePic || avatar}
                alt={user.fullName}
                className="h-10 w-10 border object-cover rounded-full"
              />
              <div>
                <h3 className="font-medium">{user.fullName}</h3>
                <p className="text-sm text-base-content/70">
                  {user.online ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          ))}
        </div>

          <div className="flex-1 p-4 overflow-y-auto">
        {/* Show a message indicating that messages will be sent individually */}
        <div className="text-center text-zinc-500 py-4">
          Messages will be sent individually to each selected user.
        </div>
      </div>
    
          <MessageInput onSend={handleSend} />
          </div>
        </div>
      </div>
    </div>



    





  );
}