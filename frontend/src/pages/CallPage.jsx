import { useParams, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Call from '../components/Call';
import { useChatStore } from '../store/useChatStore';

const CallPage = () => {
  const { userId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const video = queryParams.get('video') === 'true';

  const { selectedUser } = useChatStore();

  // Assuming selectedUser is already set based on userId
  // If not, you might need to fetch the user based on userId

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden items-center justify-center">
            <Call user={selectedUser} video={video} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallPage;