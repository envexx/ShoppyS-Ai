/**
 * Chat Storage Utility untuk menyimpan riwayat chat di localStorage
 * Mengurangi reload yang berlebihan dan meningkatkan performa
 */

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
  messageCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  products?: any[];
  metadata?: any;
}

export interface ChatHistory {
  [sessionId: string]: ChatMessage[];
}

export interface ChatSessions {
  [sessionId: string]: ChatSession;
}

class ChatStorage {
  private readonly CHAT_HISTORY_KEY = 'sensay_chat_history';
  private readonly CHAT_SESSIONS_KEY = 'sensay_chat_sessions';
  private readonly MAX_HISTORY_SIZE = 50; // Maksimal 50 session
  private readonly MAX_MESSAGES_PER_SESSION = 100; // Maksimal 100 pesan per session

  /**
   * Menyimpan pesan ke localStorage
   */
  saveMessage(sessionId: string, message: ChatMessage): void {
    try {
      const history = this.getChatHistory();
      
      if (!history[sessionId]) {
        history[sessionId] = [];
      }
      
      // Check if message already exists to avoid duplicates
      const existingMessage = history[sessionId].find(msg => msg.id === message.id);
      if (existingMessage) {
        console.log(`⚠️ Message ${message.id} already exists in session ${sessionId}, skipping`);
        return;
      }
      
      history[sessionId].push(message);
      
      // Batasi jumlah pesan per session
      if (history[sessionId].length > this.MAX_MESSAGES_PER_SESSION) {
        history[sessionId] = history[sessionId].slice(-this.MAX_MESSAGES_PER_SESSION);
      }
      
      localStorage.setItem(this.CHAT_HISTORY_KEY, JSON.stringify(history));
      
      // Update session info
      this.updateSessionInfo(sessionId, message);
      
      console.log(`💾 Saved message to session ${sessionId}, total: ${history[sessionId].length}`);
    } catch (error) {
      console.error('Error saving message to localStorage:', error);
    }
  }

  /**
   * Mengambil riwayat chat dari localStorage
   */
  getChatHistory(): ChatHistory {
    try {
      const stored = localStorage.getItem(this.CHAT_HISTORY_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error reading chat history from localStorage:', error);
      return {};
    }
  }

  /**
   * Mengambil pesan untuk session tertentu
   */
  getSessionMessages(sessionId: string): ChatMessage[] {
    const history = this.getChatHistory();
    return history[sessionId] || [];
  }

  /**
   * Menyimpan info session
   */
  saveSession(session: ChatSession): void {
    try {
      const sessions = this.getChatSessions();
      sessions[session.id] = session;
      
      // Batasi jumlah session yang disimpan
      const sessionIds = Object.keys(sessions);
      if (sessionIds.length > this.MAX_HISTORY_SIZE) {
        // Hapus session terlama
        const oldestSessionId = sessionIds.sort((a, b) => 
          sessions[a].timestamp - sessions[b].timestamp
        )[0];
        delete sessions[oldestSessionId];
        
        // Hapus juga history-nya
        const history = this.getChatHistory();
        delete history[oldestSessionId];
        localStorage.setItem(this.CHAT_HISTORY_KEY, JSON.stringify(history));
      }
      
      localStorage.setItem(this.CHAT_SESSIONS_KEY, JSON.stringify(sessions));
      console.log(`💾 Saved session ${session.id}: ${session.title}`);
    } catch (error) {
      console.error('Error saving session to localStorage:', error);
    }
  }

  /**
   * Mengambil semua session
   */
  getChatSessions(): ChatSessions {
    try {
      const stored = localStorage.getItem(this.CHAT_SESSIONS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error reading chat sessions from localStorage:', error);
      return {};
    }
  }

  /**
   * Update info session berdasarkan pesan terbaru
   */
  private updateSessionInfo(sessionId: string, message: ChatMessage): void {
    try {
      const sessions = this.getChatSessions();
      const now = Date.now();
      
      if (!sessions[sessionId]) {
        sessions[sessionId] = {
          id: sessionId,
          title: 'New Chat',
          lastMessage: '',
          timestamp: now,
          messageCount: 0,
          createdAt: now,
          updatedAt: now
        };
      }
      
      sessions[sessionId].lastMessage = message.content.substring(0, 100) + (message.content.length > 100 ? '...' : '');
      sessions[sessionId].timestamp = message.timestamp;
      sessions[sessionId].updatedAt = now;
      sessions[sessionId].messageCount = this.getSessionMessages(sessionId).length;
      
      // Generate title dari pesan pertama user
      if (message.role === 'user' && sessions[sessionId].title === 'New Chat') {
        const words = message.content.split(' ').slice(0, 4);
        const title = words.join(' ');
        sessions[sessionId].title = title.length > 30 ? title.substring(0, 30) + '...' : title;
      }
      
      localStorage.setItem(this.CHAT_SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error updating session info:', error);
    }
  }

  /**
   * Hapus session dan history-nya
   */
  deleteSession(sessionId: string): void {
    try {
      const sessions = this.getChatSessions();
      const history = this.getChatHistory();
      
      delete sessions[sessionId];
      delete history[sessionId];
      
      localStorage.setItem(this.CHAT_SESSIONS_KEY, JSON.stringify(sessions));
      localStorage.setItem(this.CHAT_HISTORY_KEY, JSON.stringify(history));
      
      console.log(`🗑️ Deleted session ${sessionId}`);
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  }

  /**
   * Clear semua data
   */
  clearAll(): void {
    try {
      localStorage.removeItem(this.CHAT_HISTORY_KEY);
      localStorage.removeItem(this.CHAT_SESSIONS_KEY);
      console.log('🗑️ Cleared all chat data');
    } catch (error) {
      console.error('Error clearing chat data:', error);
    }
  }

  /**
   * Clear data untuk session tertentu
   */
  clearSession(sessionId: string): void {
    try {
      const history = this.getChatHistory();
      const sessions = this.getChatSessions();
      
      delete history[sessionId];
      delete sessions[sessionId];
      
      localStorage.setItem(this.CHAT_HISTORY_KEY, JSON.stringify(history));
      localStorage.setItem(this.CHAT_SESSIONS_KEY, JSON.stringify(sessions));
      
      console.log(`🗑️ Cleared session ${sessionId}`);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  /**
   * Sync dengan server (untuk backup)
   */
  async syncWithServer(): Promise<void> {
    // TODO: Implement sync dengan server
    console.log('🔄 Syncing with server...');
  }

  /**
   * Generate unique message ID
   */
  generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create new session
   */
  createNewSession(): ChatSession {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    const session: ChatSession = {
      id: sessionId,
      title: 'New Chat',
      lastMessage: '',
      timestamp: now,
      messageCount: 0,
      createdAt: now,
      updatedAt: now
    };
    
    this.saveSession(session);
    return session;
  }
}

export const chatStorage = new ChatStorage();
