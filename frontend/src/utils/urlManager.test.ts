/**
 * Simple tests for URL Manager functionality
 * This file can be run manually to test URL management
 */

import { URL_MANAGER } from './urlManager';

// Mock window.location for testing
const mockLocation = (pathname: string) => {
  Object.defineProperty(window, 'location', {
    value: {
      pathname,
    },
    writable: true,
  });
};

// Mock window.history.pushState
const mockPushState = () => {
  const pushStateSpy = () => {};
  Object.defineProperty(window.history, 'pushState', {
    value: pushStateSpy,
    writable: true,
  });
  return pushStateSpy;
};

export const testURLManager = () => {
  console.log('🧪 Testing URL Manager...');

  // Test getCurrentSessionId
  mockLocation('/chat/session-123');
  const sessionId = URL_MANAGER.getCurrentSessionId();
  console.log('✅ getCurrentSessionId:', sessionId === 'session-123' ? 'PASS' : 'FAIL');

  // Test isNewChat
  mockLocation('/chat/new');
  const isNew = URL_MANAGER.isNewChat();
  console.log('✅ isNewChat:', isNew ? 'PASS' : 'FAIL');

  // Test isSpecificSession
  mockLocation('/chat/session-456');
  const isSpecific = URL_MANAGER.isSpecificSession();
  console.log('✅ isSpecificSession:', isSpecific ? 'PASS' : 'FAIL');

  // Test getSessionIdFromPath
  const pathSessionId = URL_MANAGER.getSessionIdFromPath('/chat/test-session');
  console.log('✅ getSessionIdFromPath:', pathSessionId === 'test-session' ? 'PASS' : 'FAIL');

  console.log('🎯 URL Manager tests completed!');
};

// Export for manual testing
export default testURLManager;
