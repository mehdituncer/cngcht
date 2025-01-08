import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";
import avatar from "../assets/avatar.png";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers, socket } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    if (socket) {
      // Socket bağlantısı değiştiğinde dinleyicileri yeniden kur
      const cleanup = useChatStore.getState().setupSocketListeners(socket);
      return () => cleanup();
    }
  }, [socket]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2 lg:gap-2 justify-center lg:justify-start">
          <Users size={24} /> {/* İkon boyutu doğrudan prop olarak verildi */}
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        {/* Online filtre toggle */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => isMultiSelect ? handleUserSelect(user._id) : setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${!isMultiSelect && selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
              ${isMultiSelect && selectedUsers.includes(user._id) ? "bg-base-300" : ""}
            `}
          >

            <div className="relative mx-auto lg:mx-0">
              {isMultiSelect && (
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user._id)}
                  onChange={() => handleUserSelect(user._id)}
                  className="checkbox checkbox-sm absolute left-0 -top-2 z-10 bg-white"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              <img
                src={user.profilePic || avatar}
                alt={user.fullName}
                className="h-12 w-12 border object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 
                  rounded-full ring-1 ring-zinc-700"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>

      {/* Toplu Mesajlaşma Butonu */}
      <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 p-3 border-t border-base-300 items-center justify-center lg:justify-between">
        <button 
          className={`flex items-center lg:space-x-2 ${isMultiSelect ? 'text-primary space-x-1' : ''}`}
          onClick={() => {
            setIsMultiSelect(!isMultiSelect);
            setSelectedUsers([]);
            setSelectedUser(null);
          }}
        >
          <svg className="h-5 w-5 " xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 22.5L11.2 19H6C5.44772 19 5 18.5523 5 18V7.10256C5 6.55028 5.44772 6.10256 6 6.10256H22C22.5523 6.10256 23 6.55028 23 7.10256V18C23 18.5523 22.5523 19 22 19H16.8L14 22.5ZM15.8387 17H21V8.10256H7V17H11.2H12.1613L14 19.2984L15.8387 17ZM2 2H19V4H3V15H1V3C1 2.44772 1.44772 2 2 2Z"></path>
          </svg>
          <span className="flex">
            {isMultiSelect ? `${selectedUsers.length}` : <span className="hidden lg:flex">Multiple Message</span>} 
          </span>
        </button>
        {isMultiSelect && (
          <button
            className="btn btn-sm font-medium"
            disabled={selectedUsers.length < 2}
            onClick={() => {
              navigate(`/multipleChat?userIds=${selectedUsers.join(',')}`);
            }}
          >
            Open Chat
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
