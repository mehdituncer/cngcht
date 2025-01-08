import avatar from "../assets/avatar.png";
function Call({ user }) {
    if (!user) {
      return <div>Loading...</div>;
    }
  
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="avatar mb-4">
          <div className="size-24 border rounded-full">
            <img src={user.profilePic || avatar} avatar alt={user.fullName} />
          </div>
        </div>
        <h2 className="text-2xl font-bold">{user.fullName}</h2>
      </div>
    );
  }
  
  export default Call;