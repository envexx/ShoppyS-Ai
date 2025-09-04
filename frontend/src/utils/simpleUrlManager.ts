/**
 * Simple URL Manager - mengikuti pola yang diberikan user
 * Menggunakan window.history.replaceState() untuk update URL tanpa reload
 */

export const SimpleURLManager = {
  /**
   * Update URL ke new chat
   */
  navigateToNewChat: () => {
    window.history.replaceState(null, '', '/chat/new');
    console.log('🔄 URL updated to new chat');
  },

  /**
   * Update URL ke session tertentu
   */
  navigateToSession: (sessionId: string) => {
    window.history.replaceState(null, '', `/chat/${sessionId}`);
    console.log(`🔄 URL updated to session: ${sessionId}`);
  },

  /**
   * Get current session ID dari URL
   */
  getCurrentSessionId: (): string | null => {
    const path = window.location.pathname;
    const match = path.match(/^\/chat\/(.+)$/);
    return match ? match[1] : null;
  },

  /**
   * Check apakah ini new chat
   */
  isNewChat: (): boolean => {
    return window.location.pathname === '/chat/new';
  },

  /**
   * Check apakah ini specific session
   */
  isSpecificSession: (): boolean => {
    const sessionId = SimpleURLManager.getCurrentSessionId();
    return sessionId !== null && sessionId !== 'new';
  },

  /**
   * Update browser title
   */
  updateTitle: (sessionId: string, sessionTitle?: string) => {
    const title = sessionTitle || `Chat ${sessionId.slice(0, 8)}...`;
    document.title = `${title} - ShoppyS`;
  },

  /**
   * Get session ID dari path
   */
  getSessionIdFromPath: (path: string): string | null => {
    const match = path.match(/^\/chat\/(.+)$/);
    return match ? match[1] : null;
  }
};

export default SimpleURLManager;
