import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { auth } from './firebase';
import { Link, RefreshCw, Unlink, CheckCircle } from 'lucide-react';
import { alertManager } from './CustomAlert';

function LinkPlatformForm({ user }) {
  const [platform, setPlatform] = useState('leetcode');
  const [handle, setHandle] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDelinking, setIsDelinking] = useState(false);
  const [linkedProfiles, setLinkedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Platform display names
  const platformNames = {
    leetcode: 'LeetCode',
    codeforces: 'Codeforces',
    codechef: 'CodeChef',
    gfg: 'GeeksforGeeks'
  };

  // Memoize fetchLinkedProfiles to prevent unnecessary re-renders
  const fetchLinkedProfiles = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/profile/stats/${user.uid}`);
      setLinkedProfiles(response.data);
    } catch (error) {
      console.error('Error fetching linked profiles:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]); // Only recreate if user.uid changes
 
  // Fetch linked profiles on component mount
  useEffect(() => {
    if (user) {
      fetchLinkedProfiles();
    }
  }, [user, fetchLinkedProfiles]); // ✅ Now includes fetchLinkedProfiles

  const isProfileLinked = (platformName) => {
    return linkedProfiles.some(profile => profile.platform === platformName);
  };

  const getLinkedHandle = (platformName) => {
    const profile = linkedProfiles.find(profile => profile.platform === platformName);
    return profile ? profile.handle : '';
  };

  const handleLink = async () => {
    const user = auth.currentUser;
    if (!user) return alertManager.warning('Please login first');

    if (!handle.trim()) {
      return alertManager.warning('Please enter a valid handle');
    }

    try {
      setIsLinking(true);
      const res = await axios.post('http://localhost:5000/api/profile/link', {
        uid: user.uid,
        platform,
        handle: handle.trim()
      });
      
      alertManager.success(res.data.message, { 
        title: 'Profile Linked',
        duration: 6000 
      });
      
      setHandle('');
      // Refresh linked profiles
      await fetchLinkedProfiles();
      
    } catch (err) {
      if (err.response && err.response.data.error) {
        const errorMessage = err.response.data.error;
        
        if (errorMessage.includes('already linked')) {
          alertManager.info(
            `Your ${platform} profile is already linked. Use "Sync Now" to update your stats. And Refresh! to see the stats.`,
            { 
              title: 'Profile Already Linked',
              duration: 6000 
            }
          );
        } else if (errorMessage.includes('Invalid handle')) {
          alertManager.warning(
            `Could not find a ${platform} profile with handle "${handle}". Please check the username and try again.`
          );
        } else if (errorMessage.includes('User not found')) {
          alertManager.error(
            'Your account was not found. Please try logging out and logging back in.'
          );
        } else {
          alertManager.error(errorMessage);
        }
      } else {
        alertManager.error(
          'Unable to connect to the server. Please check your internet connection and try again.'
        );
      }
    } finally {
      setIsLinking(false);
    }
  };

  const handleDelink = async (platformToDelink) => {
    if (!user) return alertManager.warning('Please login first');

    // Confirmation dialog
   const confirmed = await alertManager.confirm(
  `Are you sure you want to delink your ${platformNames[platformToDelink]} profile? This will remove all associated stats and data.`
);

if (confirmed) {
  try {
    setIsDelinking(true);
    
    const res = await axios.delete('http://localhost:5000/api/profile/delink', {
      data: {
        uid: user.uid,
        platform: platformToDelink
      }
    });

    alertManager.success(res.data.message, {
      title: 'Profile Delinked',
      duration: 4000
    });

    await fetchLinkedProfiles();
  } catch (err) {
    if (err.response && err.response.data.error) {
      alertManager.error(err.response.data.error);
    } else {
      alertManager.error('Failed to delink profile. Please try again.');
    }
  } finally {
    setIsDelinking(false);
  }
}};

  const handleSync = async () => {
    if (!user) return alertManager.warning('Please login first');
    
    setIsSyncing(true);
    
    try {
      await axios.post(`http://localhost:5000/api/profile/sync/${user.uid}`);
      setIsSyncing(false);
      alertManager.success(
        'Your stats have been updated! Refresh the page to see the latest data.'
      );
    } catch (err) {
      setIsSyncing(false);
      if (err.response && err.response.data.error) {
        alertManager.error(err.response.data.error);
      } else {
        alertManager.error(
          'Unable to sync your stats. Please try again later.'
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-700 p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
          <Link className="w-5 h-5 text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Manage Coding Profiles</h2>
      </div>

      {/* Linked Profiles Section */}
      {linkedProfiles.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Linked Profiles</h3>
          <div className="space-y-3">
            {linkedProfiles.map((profile) => (
              <div key={profile.platform} className="bg-gray-800 p-3 sm:p-4 rounded-lg">
                <div className="flex items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="text-white font-medium">{platformNames[profile.platform]}</span>
                        <span className="text-gray-400 text-sm break-all">@{profile.handle}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelink(profile.platform)}
                    disabled={isDelinking}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">
                      {isDelinking ? 'Delinking...' : 'Delink'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Link New Profile Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Link New Profile</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Platform
          </label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-white"
          >
            <option value="leetcode">LeetCode</option>
            <option value="codeforces">Codeforces</option>
            <option value="codechef">CodeChef</option>
            <option value="gfg">GeeksforGeeks</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Handle
          </label>
          <input
            type="text"
            placeholder="Your username/handle"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-white placeholder-gray-400"
          />
          
          {/* Show warning if platform is already linked */}
          {isProfileLinked(platform) && (
            <p className="text-yellow-400 text-sm mt-1">
              ⚠️ {platformNames[platform]} is already linked with handle: @{getLinkedHandle(platform)}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleLink}
            disabled={isLinking || !handle.trim()}
            className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLinking ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Link className="w-4 h-4" />
            )}
            {isLinking ? 'Linking...' : 'Link Profile'}
          </button>

          <button
            onClick={handleSync}
            disabled={isSyncing || linkedProfiles.length === 0}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSyncing ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {isSyncing ? 'Syncing..' : 'Sync Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LinkPlatformForm;