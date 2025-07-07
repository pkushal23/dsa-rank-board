import { useEffect, useState } from 'react';
import { Trophy, Target } from 'lucide-react';
import { auth } from './firebase';
import axios from 'axios';
import ProgressGraph from './ProgressGraph';

const platformConfig = {
  leetcode: {
    name: 'LeetCode',
    icon: '🟠',
    color: 'bg-orange-500'
  },
  codechef: {
    name: 'CodeChef',
    icon: '🟤',
    color: 'bg-amber-600'
  },
  codeforces: {
    name: 'Codeforces',
    icon: '🔵',
    color: 'bg-blue-500'
  },
  atcoder: {
    name: 'AtCoder',
    icon: '🟢',
    color: 'bg-green-500'
  },
  hackerrank: {
    name: 'HackerRank',
    icon: '🟢',
    color: 'bg-green-600'
  },
  topcoder: {
    name: 'TopCoder',
    icon: '🔴',
    color: 'bg-red-500'
  }
};

function StatsDashboard() {
  const [stats, setStats] = useState([]);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const user = auth.currentUser;
      if (!user) {
        alert('Please login');
        setLoading(false);
        return;
      }
      
      try {
        setError(null);
        
        // Fetch stats
        const statsResponse = await axios.get(`http://localhost:5000/api/profile/stats/${user.uid}`);
        setStats(statsResponse.data || []);
        
        // Fetch total score
        const scoreResponse = await axios.get(`http://localhost:5000/api/profile/score/${user.uid}`);
        setScore(scoreResponse.data?.totalScore || 0);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        
        // Handle different error cases
        if (err.response?.status === 404) {
          // New user - no data yet
          setStats([]);
          setScore(0);
          setError('No data found. Start by linking your coding platforms!');
        } else if (err.response?.status >= 500) {
          // Server error
          setError('Server error. Please try again later.');
        } else {
          // Other errors (network, etc.)
          setError('Failed to load data. Please check your connection and try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-800 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-400">Loading stats...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 text-yellow-400">⚠️</div>
            <p className="text-yellow-200 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Score Card */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm font-medium">Total Weighted Score</p>
            <p className="text-3xl font-bold">
              {score !== null ? score.toLocaleString() : '0'}
            </p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-900 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Platform Statistics</h2>
        </div>
        
        {stats.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">Welcome to DSA Rank Board!</h3>
            <p className="text-gray-400 mb-4">
              No platform statistics available yet. Link your coding platforms above to get started!
            </p>
            <div className="text-sm text-gray-500">
              <p>Supported platforms: LeetCode, CodeChef, Codeforces, AtCoder, HackerRank, TopCoder</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.platform} className="bg-gray-800 rounded-xl p-4 hover:shadow-lg hover:bg-gray-750 transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {platformConfig[stat.platform]?.icon || '📊'}
                    </span>
                    <h3 className="font-semibold text-white capitalize">
                      {platformConfig[stat.platform]?.name || stat.platform}
                    </h3>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${
                    platformConfig[stat.platform]?.color || 'bg-gray-500'
                  }`}></span>
                </div>
               
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Handle</span>
                    <span className="text-sm font-medium text-gray-200">{stat.handle}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Problems Solved</span>
                    <span className="text-sm font-bold text-green-400">{stat.problems_solved}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Rating</span>
                    <span className="text-sm font-bold text-purple-400">
                      {stat.rating ?? 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                    <span className="text-xs text-gray-500">Last Updated</span>
                    <span className="text-xs text-gray-500">
                      {new Date(stat.last_updated).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ProgressGraph/>
    </div>
  );
}

export default StatsDashboard;