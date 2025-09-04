import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AuthForm from '../components/AuthForm';

interface User {
  id: string;
  email: string;
  username: string;
  sensayUserId?: string;
}

interface AuthPageProps {
  onLogin?: (user: User) => void;
}

const AuthPage = ({ onLogin }: AuthPageProps) => {
  const navigate = useNavigate();

  const handleLogin = (user: User) => {
    // Store user data
    if (onLogin) {
      onLogin(user);
    }
    // Redirect to chat page
    navigate('/chat');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden transition-colors duration-300">
      {/* Static Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"></div>

      {/* Navigation */}
      <nav className="relative z-10 p-3">
        <div className="flex items-center justify-start">
          {/* Back Button */}
          <button 
            onClick={handleBackToHome}
            className="flex items-center space-x-1.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm px-3 py-2 rounded-lg hover:bg-white/40 dark:hover:bg-gray-700/40"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium text-sm">Back</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="w-full max-w-sm mx-auto">
          {/* Glass Container */}
          <div className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-lg dark:border-gray-600/50 rounded-xl p-5 shadow-2xl">
            
            {/* Welcome Section */}
            <div className="text-center mb-5">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome Back!
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Sign in to continue your smart shopping journey
              </p>
            </div>

            {/* Authentication Form */}
            <AuthForm onLogin={handleLogin} />

            {/* Footer */}
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                By signing in, you agree to our{' '}
                <a href="#" className="text-[#71B836] hover:text-[#5A9A2E] underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-[#71B836] hover:text-[#5A9A2E] underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;