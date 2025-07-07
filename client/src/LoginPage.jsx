import { auth, provider } from './firebase';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';
import {Globe, Code, Terminal, Trophy, Zap} from 'lucide-react';
import { alertManager } from './CustomAlert';

function LoginPage() {
  const navigate = useNavigate();
   const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
  try {
    setIsLoading(true);

    // ✅ Force account chooser popup
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    const res = await signInWithPopup(auth, provider);
    const user = res.user;

    await axios.post('http://localhost:5000/api/auth/login', {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
    });

    setTimeout(() => {
      setIsLoading(false);
      alertManager.success('Login successful!');
    }, 1500);

    navigate('/dashboard');
  } catch (err) {
    setIsLoading(false);
    alertManager.warning('Login failed');
  }
};


  return (
   <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.3),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.3),transparent_50%)]"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Main Card */}
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-6 shadow-lg">
                <Terminal className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
                DSA Rank Board
              </h1>
              <p className="text-gray-400 text-lg">Track your coding journey across platforms</p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-3 bg-gray-800/40 rounded-xl border border-gray-700/30">
                <Code className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Code</p>
              </div>
              <div className="text-center p-3 bg-gray-800/40 rounded-xl border border-gray-700/30">
                <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Compete</p>
              </div>
              <div className="text-center p-3 bg-gray-800/40 rounded-xl border border-gray-700/30">
                <Zap className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Progress</p>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/25 hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Globe className="w-5 h-5" />
              )}
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </button>

            {/* Alternative Login */}
            {/* <div className="mt-4">
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-gray-800/60 hover:bg-gray-800/80 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 border border-gray-700/50 hover:border-gray-600"
              >
                <Github className="w-5 h-5" />
                Continue with GitHub
              </button>
            </div> */}

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm mb-4">
                Join <span className="text-purple-400 font-semibold">10,000+</span> developers
              </p>
              <div className="flex justify-center space-x-6 text-xs text-gray-600">
                <span>LeetCode</span>
                <span>•</span>
                <span>CodeChef</span>
                <span>•</span>
                <span>Codeforces</span>
              </div>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-gray-900/40 backdrop-blur-lg rounded-xl border border-gray-700/30">
              <div className="text-2xl font-bold text-white mb-1">1M+</div>
              <div className="text-xs text-gray-400">Problems Solved</div>
            </div>
            <div className="text-center p-4 bg-gray-900/40 backdrop-blur-lg rounded-xl border border-gray-700/30">
              <div className="text-2xl font-bold text-white mb-1">50K+</div>
              <div className="text-xs text-gray-400">Active Users</div>
            </div>
            <div className="text-center p-4 bg-gray-900/40 backdrop-blur-lg rounded-xl border border-gray-700/30">
              <div className="text-2xl font-bold text-white mb-1">24/7</div>
              <div className="text-xs text-gray-400">Tracking</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
      <div className="absolute top-32 right-16 w-1 h-1 bg-pink-500 rounded-full animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse delay-500"></div>
      <div className="absolute bottom-32 right-10 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-700"></div>
    </div>
  );
}

export default LoginPage;
