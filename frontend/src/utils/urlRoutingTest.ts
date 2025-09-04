/**
 * Test script untuk memverifikasi sistem URL routing
 * Jalankan di browser console untuk test
 */

export const testURLRouting = () => {
  console.log('🧪 Testing URL Routing System...');
  
  // Test 1: Check current URL
  const currentPath = window.location.pathname;
  console.log('📍 Current URL:', currentPath);
  
  // Test 2: Check if we're on a valid chat route
  const isValidChatRoute = currentPath.startsWith('/chat/');
  console.log('✅ Valid chat route:', isValidChatRoute);
  
  // Test 3: Check if it's a new chat
  const isNewChat = currentPath === '/chat/new';
  console.log('🆕 Is new chat:', isNewChat);
  
  // Test 4: Check if it's a specific session
  const isSpecificSession = isValidChatRoute && !isNewChat;
  console.log('📝 Is specific session:', isSpecificSession);
  
  // Test 5: Extract session ID if any
  const sessionId = currentPath.replace('/chat/', '');
  console.log('🆔 Session ID:', sessionId);
  
  // Test 6: Check URL_MANAGER functions
  if (window.URL_MANAGER) {
    console.log('🔧 URL_MANAGER available:', true);
    console.log('📊 Current session ID:', window.URL_MANAGER.getCurrentSessionId());
    console.log('🆕 Is new chat:', window.URL_MANAGER.isNewChat());
    console.log('📝 Is specific session:', window.URL_MANAGER.isSpecificSession());
  } else {
    console.log('❌ URL_MANAGER not available');
  }
  
  console.log('🎯 URL Routing test completed!');
  
  return {
    currentPath,
    isValidChatRoute,
    isNewChat,
    isSpecificSession,
    sessionId
  };
};

// Export untuk penggunaan di console
window.testURLRouting = testURLRouting;
