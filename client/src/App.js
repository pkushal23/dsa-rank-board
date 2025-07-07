import { useState, useEffect } from 'react';
import { Code, User, LogOut, Menu, X } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import LoginPage from './LoginPage';
import LinkPlatformForm from './LinkPlatformForm';
import StatsDashboard from './StatsDashborad';
import TopCoders from './TopCoder';
import GlobalLeaderboard from './GlobalLeaderboard';
import { alertManager, AlertContainer } from './CustomAlert'; // Import the custom alert system

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
  try {
    // Optional: fallback to native confirm if needed
    const confirmed = typeof alertManager.confirm === 'function'
      ? await alertManager.confirm(
          'Are you sure you want to logout? You will need to sign in again to access your dashboard.'
        )
      : window.confirm('Are you sure you want to logout?');

    if (confirmed) {
      await auth.signOut();
      alertManager.success('You have been logged out successfully!');
      window.location.href = '/';
    }
  } catch (err) {
    alertManager.error('Failed to logout. Please try again.');
  }
};


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-800 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Add AlertContainer here - this will render all alerts */}
      <AlertContainer />
      
      {/* Header */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">DSA Rank Board</h1>
            </div>

            {/* Desktop User Info */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-300" />
                </div>
                <span className="text-sm text-gray-300">{user.displayName || user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 border border-gray-600 text-gray-300 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-700">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-700">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user.displayName || 'User'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Link Platform Form */}
          <LinkPlatformForm user={user} />
         
          {/* Stats Dashboard */}
          <StatsDashboard />
         
          {/* Leaderboards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TopCoders />
            <GlobalLeaderboard />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>© 2025 DSA Rank Board. Built with ❤️ for developers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;