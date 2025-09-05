import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, MessageCircle, Clock, MoreVertical, RefreshCw, Plus, Moon, Sun } from 'lucide-react';
import * as api from '../services/api';
import { URL_MANAGER } from '../utils/urlManager';
import { createApiUrl, getAuthHeaders } from '../config/api';

interface User {
  id: string;
  email: string;
  username: string;
  sensayUserId?: string;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
  messageCount: number;
}

interface ChatSidebarProps {
  selectedChat: string;
  onChatSelect: (chat: string) => void;
  user: User | null;
  onLogout: () => void;
  refreshTrigger?: number; // Add this to trigger refresh from parent
}

const ChatSidebar = ({ selectedChat, onChatSelect, user, onLogout, refreshTrigger }: ChatSidebarProps) => {
  const navigate = useNavigate();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);


  const defaultChat = {
    id: 'shoppy-sensay',
    name: 'Shoppy Sensay',
    avatar: '🛍️',
    lastMessage: 'Hello! Ready to find amazing deals? 🛒',
    time: 'online',
    unread: 0,
    online: true,
    verified: true
  };



  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Load chat sessions and history when user logs in (only once)
  useEffect(() => {
    if (user && !sessionsLoaded) {
      console.log('👤 User logged in, loading sessions for:', user.id, user.username);
      // Add a small delay to ensure token is properly set
      const timer = setTimeout(() => {
        loadChatSessions();
      }, 100);
      
      return () => clearTimeout(timer);
    } else if (!user) {
      console.log('👤 User logged out, clearing sessions');
      // Clear data when user logs out
      setChatSessions([]);
      setSessionsLoaded(false);
    }
  }, [user, sessionsLoaded]);

  // Refresh sessions when triggered from parent
  useEffect(() => {
    if (refreshTrigger && user) {
      console.log('🔄 Refreshing sessions due to trigger:', refreshTrigger, 'for user:', user.id);
      setSessionsLoaded(false); // Reset flag to allow reload
      // Immediate refresh without delay
      loadChatSessions();
    }
  }, [refreshTrigger, user]);



  const loadChatSessions = async () => {
    try {
      setHistoryLoading(true);
      
      console.log('🔄 Loading chat sessions for user:', user?.id, user?.username);
      
      // Langsung fetch dari server tanpa local storage
      const token = localStorage.getItem('token');
      if (token && user) {
        try {
          const API_BASE_URL = import.meta.env.DEV 
            ? 'http://localhost:3000/api' 
            : 'https://shoppy-s-ai-backend.vercel.app/api';
            
          console.log('🌐 Fetching sessions directly from server...');
          console.log('🔗 API URL:', `${API_BASE_URL}/chat/sessions`);
          console.log('🔑 Token exists:', !!token);
          console.log('👤 User authenticated:', !!user);
          
          const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          console.log('📡 Server response status:', response.status);
          console.log('📡 Server response headers:', Object.fromEntries(response.headers.entries()));
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Server sessions response:', data);
            
            if (data.success && data.data && data.data.sessions && Array.isArray(data.data.sessions)) {
              const serverSessions = data.data.sessions.map((session: any) => ({
                id: session.id,
                title: session.title || 'New Chat',
                lastMessage: '', // Server doesn't provide lastMessage
                timestamp: new Date(session.updatedAt).getTime(),
                messageCount: session.messageCount || 0
              }));
              
              console.log('📦 Server sessions processed:', serverSessions.length);
              console.log('📦 Server sessions details:', serverSessions);
              
              // Langsung set sessions dari server tanpa merge
              setChatSessions(serverSessions);
              
              console.log('✅ Sessions loaded from server:', serverSessions.length);
              console.log('✅ User authenticated:', data.data.userAuthenticated);
              console.log('✅ User ID:', data.data.userId);
              console.log('✅ Final sessions:', serverSessions);
            } else {
              console.log('⚠️ No sessions data in response or invalid format:', data);
              console.log('⚠️ Response structure:', {
                success: data.success,
                hasData: !!data.data,
                hasSessions: !!(data.data && data.data.sessions),
                isArray: Array.isArray(data.data?.sessions)
              });
              // Set empty array jika server data invalid
              setChatSessions([]);
            }
          } else {
            const errorText = await response.text();
            console.log('❌ Failed to load sessions from server. Status:', response.status, 'Error:', errorText);
            
            if (response.status === 401) {
              console.log('🔐 Authentication failed, user may need to re-login');
              // Set empty array untuk authentication error
              setChatSessions([]);
            } else {
              // Set empty array untuk server error
              setChatSessions([]);
            }
          }
        } catch (error) {
          console.error('❌ Error fetching from server:', error);
          console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : 'No stack trace'
          });
          // Set empty array untuk network error
          setChatSessions([]);
        }
      } else {
        console.log('⚠️ No token or user found, cannot fetch sessions');
        console.log('🔍 Token exists:', !!localStorage.getItem('token'));
        console.log('🔍 User exists:', !!user);
        // Set empty array jika tidak ada token atau user
        setChatSessions([]);
      }
      
      setSessionsLoaded(true);
    } catch (error) {
      console.error('❌ Error loading chat sessions:', error);
      setChatSessions([]);
    } finally {
      setHistoryLoading(false);
    }
  };





  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) {
      return 'just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const refreshHistory = () => {
    if (user) {
      // Manual refresh should always work
      setSessionsLoaded(false); // Reset flag to allow reload
      loadChatSessions();
    }
  };

  const handleNewChat = () => {
    onChatSelect('new-chat');
    // Update URL tanpa reload
    window.history.replaceState(null, '', '/chat/new');
  };

  const handleChatSelect = (sessionId: string) => {
    onChatSelect(sessionId);
    // Update URL tanpa reload
    window.history.replaceState(null, '', `/chat/${sessionId}`);
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent chat selection
    
    if (confirm('Are you sure you want to delete this chat session?')) {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const API_BASE_URL = import.meta.env.DEV 
            ? 'http://localhost:3000/api' 
            : 'https://shoppy-s-ai-backend.vercel.app/api';
            
          console.log('🗑️ Deleting session:', sessionId);
          
          const response = await fetch(`${API_BASE_URL}/chat/${sessionId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        
          if (response.ok) {
            console.log('✅ Session deleted successfully:', sessionId);
            // Remove from local state
            setChatSessions(prev => prev.filter(session => session.id !== sessionId));
            
            // If this was the selected chat, switch to new chat
            if (selectedChat === sessionId) {
              handleNewChat();
            }
          } else {
            const errorText = await response.text();
            console.log('❌ Failed to delete session:', response.status, errorText);
            // Still remove from local state for better UX
            setChatSessions(prev => prev.filter(session => session.id !== sessionId));
            
            if (selectedChat === sessionId) {
              handleNewChat();
            }
          }
        } else {
          console.log('❌ No token found for session deletion');
        }
      } catch (error) {
        console.error('❌ Error deleting session:', error);
        // Remove from local state for better UX even if server call fails
        setChatSessions(prev => prev.filter(session => session.id !== sessionId));
        
        if (selectedChat === sessionId) {
          handleNewChat();
        }
      }
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // You can add localStorage or context logic here
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="h-full bg-transparent flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50 flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <img 
              src="/ShoppyS logo .png" 
              alt="ShoppyS Logo" 
              className="w-8 h-8 rounded-lg shadow-lg"
            />
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white font-sora">ShoppyS</h1>
              <p className="text-sm text-gray-500 dark:text-gray-300 font-medium">AI Assistant</p>
            </div>
          </div>
          {user && (
            <div className="flex items-center space-x-2">
              <button 
                onClick={toggleDarkMode}
                className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white hover:bg-white/30 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? <Sun className="w-4 h-4 icon-glow-cyan" /> : <Moon className="w-4 h-4 icon-glow-blue" />}
              </button>
              <button 
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white hover:bg-white/30 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4 icon-glow-gray" />
              </button>
            </div>
          )}
        </div>

        {/* Login Prompt for unauthenticated users */}
        {!user && (
          <div className="mt-4 text-center">
            <div className="bg-[#71B836]/10 dark:bg-[#71B836]/20 border border-[#71B836]/30 dark:border-[#71B836]/50 rounded-xl p-4">
              <div className="text-[#71B836] dark:text-[#71B836]/80 mb-2">
                <User className="w-8 h-8 mx-auto" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Welcome to ShoppyS</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Please sign in to start your shopping journey
              </p>
              <a
                href="/auth"
                className="inline-block bg-[#71B836] hover:bg-[#71B836]/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Sign In
              </a>
            </div>
          </div>
        )}
      </div>



      {/* Chat History */}
      <div className="flex-1 overflow-y-auto ultra-thin-scrollbar min-h-0">
        {user && (
          <div className="p-4 space-y-4">
            {/* New Chat Button */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-300 font-sora">Chat</h2>
                <button
                  onClick={handleNewChat}
                  className="flex items-center space-x-1 px-2 py-1 text-xs bg-[#71B836] hover:bg-[#71B836]/80 text-white rounded-lg transition-colors"
                  title="Start new chat"
                >
                  <Plus className="w-3 h-3 icon-glow-white" />
                  <span>New</span>
                </button>
              </div>
              
              {/* Current Chat or New Chat */}
              <div
                onClick={handleNewChat}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedChat === 'new-chat' 
                    ? 'bg-[#71B836]/10 dark:bg-[#71B836]/20 border border-[#71B836]/30 dark:border-[#71B836]/50' 
                    : 'hover:bg-white/20'
                }`}
              >
                <div className="w-8 h-8 bg-[#71B836]/10 dark:bg-[#71B836]/20 rounded-lg flex items-center justify-center mr-3">
                  <MessageCircle className="w-4 h-4 text-[#71B836] dark:text-[#71B836]/80 icon-glow-blue" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                    {selectedChat === 'new-chat' ? 'New Chat' : defaultChat.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-300 truncate">
                    {selectedChat === 'new-chat' ? 'Start a conversation with Shoppy Sensay' : defaultChat.lastMessage}
                  </p>
                </div>
                
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
            </div>

            {/* Chat Sessions History */}
            {(chatSessions.length > 0 || user) && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-500 font-sora">Recent Sessions</h2>
                  <div className="flex items-center space-x-2">
                    {historyLoading && (
                      <div className="w-4 h-4 border-2 border-[#71B836] border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <button
                      onClick={refreshHistory}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                      title="Refresh history"
                    >
                      <RefreshCw className="w-3 h-3 icon-glow-blue" />
                    </button>
                  </div>
                </div>
                {chatSessions.length > 0 ? (
                  <div className="space-y-2">
                    {chatSessions.slice(0, 5).map((session) => (
                    <div
                      key={session.id}
                      onClick={() => handleChatSelect(session.id)}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedChat === session.id 
                          ? 'bg-[#71B836]/10 dark:bg-[#71B836]/20 border border-[#71B836]/30 dark:border-[#71B836]/50' 
                          : 'hover:bg-white/20'
                      }`}
                    >
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                        <Clock className="w-4 h-4 text-gray-600 dark:text-gray-300 icon-glow-gray" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm">{session.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-300 truncate">{session.lastMessage}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-400 dark:text-gray-500">{formatTime(session.timestamp)}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">{session.messageCount} msgs</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors"
                        title="Delete session"
                      >
                        <MoreVertical className="w-3 h-3 icon-glow-gray" />
                      </button>
                    </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <MessageCircle className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2 icon-glow-gray" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No chat sessions yet</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Start chatting to see your history</p>
                  </div>
                )}
              </div>
            )}


          </div>
        )}
      </div>



      {/* User Profile Footer */}
      {user && (
        <div className="p-4 border-t border-gray-200/50 flex-shrink-0">
          <div className="flex items-center space-x-3 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg p-3">
            <img 
              src="/ShoppyS logo .png" 
              alt="ShoppyS Logo" 
              className="w-10 h-10 rounded-lg shadow-lg"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate font-sora">{user.username}</p>
              <p className="text-xs text-gray-500 dark:text-gray-300 truncate">{user.email}</p>
              <div className="flex items-center space-x-1 mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-600 font-medium">Online</span>
                {chatSessions.length > 0 && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">{chatSessions.length} sessions</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSidebar;