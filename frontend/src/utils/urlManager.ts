/**
 * URL Management utilities for chat sessions
 */

export const URL_MANAGER = {
  /**
   * Get the current session ID from URL
   */
  getCurrentSessionId: (): string | null => {
    const path = window.location.pathname;
    const match = path.match(/\/chat\/(.+)/);
    return match ? match[1] : null;
  },

  /**
   * Navigate to a specific chat session
   */
  navigateToSession: (sessionId: string) => {
    if (sessionId === 'new-chat') {
      window.history.pushState({}, '', '/chat/new');
    } else {
      window.history.pushState({}, '', `/chat/${sessionId}`);
    }
  },

  /**
   * Navigate to new chat
   */
  navigateToNewChat: () => {
    window.history.pushState({}, '', '/chat/new');
  },

  /**
   * Check if current URL is for a new chat
   */
  isNewChat: (): boolean => {
    return window.location.pathname === '/chat/new';
  },

  /**
   * Check if current URL is for a specific session
   */
  isSpecificSession: (): boolean => {
    const path = window.location.pathname;
    return path.startsWith('/chat/') && path !== '/chat/new';
  },

  /**
   * Get session ID from URL path
   */
  getSessionIdFromPath: (path: string): string | null => {
    const match = path.match(/\/chat\/(.+)/);
    return match ? match[1] : null;
  },

  /**
   * Update browser title based on session
   */
  updateTitle: (sessionId: string, sessionTitle?: string) => {
    if (sessionId === 'new-chat') {
      document.title = 'New Chat - ShoppyS';
    } else {
      document.title = sessionTitle ? `${sessionTitle} - ShoppyS` : `Chat ${sessionId} - ShoppyS`;
    }
  }
};

/**
 * Hook for managing chat URLs (alternative to direct URL management)
 */
export const useChatURL = () => {
  const getCurrentSession = () => URL_MANAGER.getCurrentSessionId();
  
  const navigateToSession = (sessionId: string) => {
    URL_MANAGER.navigateToSession(sessionId);
  };
  
  const navigateToNewChat = () => {
    URL_MANAGER.navigateToNewChat();
  };
  
  return {
    getCurrentSession,
    navigateToSession,
    navigateToNewChat,
    isNewChat: URL_MANAGER.isNewChat,
    isSpecificSession: URL_MANAGER.isSpecificSession
  };
};
