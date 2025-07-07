import { useState } from 'react';
import { Award, ChevronRight } from 'lucide-react';
import axios from 'axios';
import ProfileModal from './ProfileModal'; // Import the ProfileModal

function TopCoders() {
    const [daily, setDaily] = useState([]);
    const [weekly, setWeekly] = useState([]);
    const [view, setView] = useState("daily");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchLeaderboard = async (type) => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/profile/top-coders/${type}`);
            if (type === "daily") {
                setDaily(res.data);
                setView("daily");
            } else {
                setWeekly(res.data);
                setView("weekly");
            }
        } catch (err) {
            alert("Failed to fetch leaderboard");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUserClick = (username) => {
        setSelectedUser(username);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const currentData = view === "daily" ? daily : weekly;

    return (
        <>
            <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-yellow-900 rounded-lg flex items-center justify-center">
                        <Award className="w-5 h-5 text-yellow-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Top Coders</h2>
                </div>
                
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => fetchLeaderboard("daily")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            view === "daily"
                                ? "bg-purple-600 text-white"
                                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}
                    >
                        Daily
                    </button>
                    <button
                        onClick={() => fetchLeaderboard("weekly")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            view === "weekly"
                                ? "bg-purple-600 text-white"
                                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}
                    >
                        Weekly
                    </button>
                </div>
                
                <div className="space-y-3">
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="w-8 h-8 border-2 border-purple-800 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-400">Loading leaderboard...</p>
                        </div>
                    ) : currentData.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            No data available. Click a button to load the leaderboard.
                        </div>
                    ) : (
                        currentData.map((coder, index) => (
                            <div 
                                key={index} 
                                className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                                onClick={() => handleUserClick(coder.name)}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    index === 0 ? 'bg-yellow-500 text-white' :
                                    index === 1 ? 'bg-gray-400 text-white' :
                                    index === 2 ? 'bg-amber-600 text-white' :
                                    'bg-gray-600 text-gray-200'
                                }`}>
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-white hover:text-purple-400 transition-colors">{coder.name}</p>
                                    <p className="text-sm text-gray-400">{coder.score} points</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-500" />
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

export default TopCoders;