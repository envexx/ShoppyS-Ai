import { NextRequest } from 'next/server';
import { withMiddleware, errorResponse, successResponse } from '../../../../lib/middleware';
import { getUserFromToken } from '../../../../lib/auth';
import { SensayService } from '../../../../lib/sensay-service';

const sensayService = new SensayService();

async function handler(request: NextRequest) {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const user = await getUserFromToken(request);
    if (!user) {
      console.log('❌ Unauthorized chat request - no valid user token');
      return errorResponse('Unauthorized', 401);
    }

    console.log('🔍 Chat send request from user:', user.id, user.username);

    const body = await request.json();
    const { message, sessionId, isNewChat } = body;

    if (!message || message.trim().length === 0) {
      console.log('❌ Empty message received from user:', user.id);
      return errorResponse('Message is required', 400);
    }

    console.log(`📨 Chat request from user ${user.id} (${user.username}): "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`, { 
      sessionId, 
      isNewChat,
      messageLength: message.length 
    });

    // Determine if this should be a new session
    let chatSessionId = sessionId;
    let isNewSession = false;
    
    // Create new session if:
    // 1. No sessionId provided
    // 2. isNewChat is explicitly true
    // 3. sessionId is 'new-chat' or similar
    if (!chatSessionId || isNewChat || chatSessionId === 'new-chat') {
      console.log(`🆕 Creating new chat session for user ${user.id}`);
      chatSessionId = await sensayService.getOrCreateChatSession(user.id, true); // Force new session
      isNewSession = true;
      console.log(`✅ Created new chat session ${chatSessionId} for user ${user.id}`);
    } else {
      // Validate existing session ownership
      console.log(`🔍 Validating session ${chatSessionId} ownership for user ${user.id}`);
      const isValidSession = await sensayService.validateSessionOwnership(chatSessionId, user.id);
      if (!isValidSession) {
        console.error(`❌ Session ${chatSessionId} does not belong to user ${user.id}`);
        return errorResponse('Invalid session access', 403);
      }
      console.log(`✅ Using existing chat session ${chatSessionId} for user ${user.id}`);
    }

    // Send message to Sensay
    console.log(`🤖 Sending message to Sensay for user ${user.id}, session ${chatSessionId}`);
    const response = await sensayService.sendMessage(user.id, message.trim(), chatSessionId);

    console.log(`✅ Chat response sent successfully for user ${user.id}, session ${chatSessionId}`);

    return successResponse({
      ...response,
      sessionId: chatSessionId,
      isNewSession: isNewSession
    });
  } catch (error: any) {
    console.error('❌ Chat send error for user:', error);
    return errorResponse(error.message || 'Failed to send message', 500);
  }
}

export const POST = withMiddleware(handler, {
  rateLimit: { windowMs: 1 * 60 * 1000, max: 30 } // 30 messages per minute
});
