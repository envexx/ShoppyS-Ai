/**
 * Debug utilities untuk mengatasi masalah duplikasi pesan
 */

import { chatStorage } from './chatStorage';

export const DebugUtils = {
  /**
   * Check duplikasi pesan di localStorage
   */
  checkDuplicateMessages: (sessionId?: string) => {
    const history = chatStorage.getChatHistory();
    const sessions = chatStorage.getChatSessions();
    
    console.log('🔍 Checking for duplicate messages...');
    console.log('📊 Total sessions:', Object.keys(sessions).length);
    
    if (sessionId) {
      const messages = history[sessionId] || [];
      const duplicateIds = messages
        .map(msg => msg.id)
        .filter((id, index, arr) => arr.indexOf(id) !== index);
      
      console.log(`📝 Session ${sessionId}: ${messages.length} messages`);
      console.log(`🔄 Duplicate IDs:`, duplicateIds);
      
      if (duplicateIds.length > 0) {
        console.log('⚠️ Found duplicate messages!');
        return { sessionId, duplicateIds, messageCount: messages.length };
      }
    } else {
      // Check all sessions
      const results: any[] = [];
      
      Object.keys(history).forEach(sid => {
        const messages = history[sid];
        const duplicateIds = messages
          .map(msg => msg.id)
          .filter((id, index, arr) => arr.indexOf(id) !== index);
        
        if (duplicateIds.length > 0) {
          results.push({ sessionId: sid, duplicateIds, messageCount: messages.length });
        }
      });
      
      console.log('🔍 Duplicate check results:', results);
      return results;
    }
    
    return null;
  },

  /**
   * Clear duplikasi pesan
   */
  clearDuplicateMessages: (sessionId: string) => {
    const history = chatStorage.getChatHistory();
    const messages = history[sessionId] || [];
    
    // Remove duplicates based on ID
    const uniqueMessages = messages.filter((msg, index, arr) => 
      arr.findIndex(m => m.id === msg.id) === index
    );
    
    if (uniqueMessages.length < messages.length) {
      history[sessionId] = uniqueMessages;
      localStorage.setItem('sensay_chat_history', JSON.stringify(history));
      
      console.log(`🧹 Removed ${messages.length - uniqueMessages.length} duplicate messages from session ${sessionId}`);
      return { removed: messages.length - uniqueMessages.length, remaining: uniqueMessages.length };
    }
    
    return { removed: 0, remaining: messages.length };
  },

  /**
   * Clear all localStorage data
   */
  clearAllData: () => {
    chatStorage.clearAll();
    console.log('🗑️ All localStorage data cleared');
  },

  /**
   * Show localStorage stats
   */
  showStats: () => {
    const history = chatStorage.getChatHistory();
    const sessions = chatStorage.getChatSessions();
    
    const totalMessages = Object.values(history).reduce((sum, messages) => sum + messages.length, 0);
    const totalSessions = Object.keys(sessions).length;
    
    console.log('📊 localStorage Stats:');
    console.log(`📝 Total sessions: ${totalSessions}`);
    console.log(`💬 Total messages: ${totalMessages}`);
    console.log(`💾 Storage size: ${JSON.stringify(history).length + JSON.stringify(sessions).length} bytes`);
    
    return { totalSessions, totalMessages };
  },

  /**
   * Reset specific session
   */
  resetSession: (sessionId: string) => {
    chatStorage.clearSession(sessionId);
    console.log(`🔄 Session ${sessionId} reset`);
  }
};

// Export untuk penggunaan global
window.DebugUtils = DebugUtils;

