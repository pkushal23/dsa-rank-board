import { useState, useEffect } from 'react';
import { X, User, Code, Trophy, Calendar } from 'lucide-react';
import axios from 'axios';

function ProfileModal({ username, isOpen, onClose }) {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && username) {
      fetchProfile();
    }
  }, [isOpen, username]);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get(`http://localhost:5000/api/profile/public-profile/${username}`);
      setProfile(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  };

  const getPlatformColor = (platform) => {
    const colors = {
      codeforces: 'bg-red-500',
      leetcode: 'bg-yellow-500',
      codechef: 'bg-blue-500',
      gfg: 'bg-green-500'
    };
    return colors[platform] || 'bg-gray-500';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-900 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-purple-800 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading profile...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchProfile}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : profile ? (
            <div className="space-y-6">
              {/* User Info */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">{profile.name}</h3>
                <div className="flex items-center justify-center gap-2 text-purple-400">
                  <Trophy className="w-4 h-4" />
                  <span className="text-lg font-semibold">{profile.totalScore} points</span>
                </div>
              </div>

              {/* Platform Stats */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Platform Stats
                </h4>
                
                {profile.platforms.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No platforms linked</p>
                ) : (
                  <div className="space-y-3">
                    {profile.platforms.map((platform, index) => (
                      <div key={index} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getPlatformColor(platform.platform)}`}></div>
                            <span className="font-medium text-white capitalize">{platform.platform}</span>
                          </div>
                          <span className="text-sm text-gray-400">@{platform.handle}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {platform.problems_solved && (
                            <div>
                              <p className="text-gray-400">Problems Solved</p>
                              <p className="text-white font-semibold">{platform.problems_solved}</p>
                            </div>
                          )}
                          {platform.rating && (
                            <div>
                              <p className="text-gray-400">Rating</p>
                              <p className="text-white font-semibold">{platform.rating}</p>
                            </div>
                          )}
                        </div>
                        
                        {platform.last_updated && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                            <Calendar className="w-3 h-3" />
                            <span>Updated: {formatDate(platform.last_updated)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;