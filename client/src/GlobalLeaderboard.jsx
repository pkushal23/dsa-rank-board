import { useEffect, useState } from 'react';
import { Star, Users } from 'lucide-react';
import axios from 'axios';
import ProfileModal from './ProfileModal'; // Import the ProfileModal

function GlobalLeaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/profile/leaderboard');
        setLeaders(res.data);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const handleUserClick = (username) => {
    setSelectedUser(username);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <>
      <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-900 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Global Leaderboard</h2>
        </div>
       
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-purple-800 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading leaderboard...</p>
            </div>
          ) : leaders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No leaderboard data available.
            </div>
          ) : (
            leaders.slice(0, 10).map((leader, index) => (
              <div 
                key={leader.name} 
                className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => handleUserClick(leader.name)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index < 3 ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-gray-600 text-gray-200'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white hover:text-purple-400 transition-colors">{leader.name}</p>
                  <p className="text-sm text-gray-400">{Math.round(leader.score)} points</p>
                </div>
                {index < 3 && <Star className="w-4 h-4 text-yellow-400" />}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal 
        username={selectedUser}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
}

export default GlobalLeaderboard;