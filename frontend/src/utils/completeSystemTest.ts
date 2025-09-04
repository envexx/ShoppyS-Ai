/**
 * Test script untuk memverifikasi sistem URL routing dan localStorage
 * Jalankan di browser console untuk test
 */

export const testCompleteSystem = () => {
  console.log('🧪 Testing Complete URL Routing & localStorage System...');
  
  // Test 1: Check current URL
  const currentPath = window.location.pathname;
  console.log('📍 Current URL:', currentPath);
  
  // Test 2: Check localStorage
  const chatHistory = localStorage.getItem('sensay_chat_history');
  const chatSessions = localStorage.getItem('sensay_chat_sessions');
  console.log('💾 Chat History in localStorage:', chatHistory ? 'Available' : 'Not found');
  console.log('💾 Chat Sessions in localStorage:', chatSessions ? 'Available' : 'Not found');
  
  // Test 3: Check URL_MANAGER
  if (window.URL_MANAGER) {
    console.log('🔧 URL_MANAGER available:', true);
    console.log('📊 Current session ID:', window.URL_MANAGER.getCurrentSessionId());
    console.log('🆕 Is new chat:', window.URL_MANAGER.isNewChat());
    console.log('📝 Is specific session:', window.URL_MANAGER.isSpecificSession());
  } else {
    console.log('❌ URL_MANAGER not available');
  }
  
  // Test 4: Check chatStorage
  if (window.chatStorage) {
    console.log('🔧 chatStorage available:', true);
    const sessions = window.chatStorage.getChatSessions();
    const sessionCount = Object.keys(sessions).length;
    console.log('📝 Total sessions in localStorage:', sessionCount);
    
    if (sessionCount > 0) {
      const latestSession = Object.values(sessions).sort((a: any, b: any) => b.timestamp - a.timestamp)[0];
      console.log('🕒 Latest session:', latestSession);
    }
  } else {
    console.log('❌ chatStorage not available');
  }
  
  // Test 5: Check if we're on a valid chat route
  const isValidChatRoute = currentPath.startsWith('/chat/');
  console.log('✅ Valid chat route:', isValidChatRoute);
  
  // Test 6: Check if it's a new chat
  const isNewChat = currentPath === '/chat/new';
  console.log('🆕 Is new chat:', isNewChat);
  
  // Test 7: Check if it's a specific session
  const isSpecificSession = isValidChatRoute && !isNewChat;
  console.log('📝 Is specific session:', isSpecificSession);
  
  // Test 8: Extract session ID if any
  const sessionId = currentPath.replace('/chat/', '');
  console.log('🆔 Session ID from URL:', sessionId);
  
  console.log('🎯 Complete system test completed!');
  
  return {
    currentPath,
    isValidChatRoute,
    isNewChat,
    isSpecificSession,
    sessionId,
    hasLocalStorage: !!(chatHistory || chatSessions),
    hasURLManager: !!window.URL_MANAGER,
    hasChatStorage: !!window.chatStorage
  };
};

// Export untuk penggunaan di console
window.testCompleteSystem = testCompleteSystem;
