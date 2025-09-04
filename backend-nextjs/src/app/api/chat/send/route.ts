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
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { message, sessionId, isNewChat } = body;

    if (!message || message.trim().length === 0) {
      return errorResponse('Message is required', 400);
    }

    console.log(`Chat request from user ${user.id}: "${message}"`, { sessionId, isNewChat });

    // Determine if this should be a new session
    let chatSessionId = sessionId;
    let isNewSession = false;
    
    // Create new session if:
    // 1. No sessionId provided
    // 2. isNewChat is explicitly true
    // 3. sessionId is 'new-chat' or similar
    if (!chatSessionId || isNewChat || chatSessionId === 'new-chat') {
      chatSessionId = await sensayService.getOrCreateChatSession(user.id);
      isNewSession = true;
      console.log(`✅ Created new chat session ${chatSessionId} for user ${user.id}`);
    } else {
      // Validate existing session ownership
      const isValidSession = await sensayService.validateSessionOwnership(chatSessionId, user.id);
      if (!isValidSession) {
        console.error(`❌ Session ${chatSessionId} does not belong to user ${user.id}`);
        return errorResponse('Invalid session access', 403);
      }
      console.log(`✅ Using existing chat session ${chatSessionId} for user ${user.id}`);
    }

    // Send message to Sensay
    const response = await sensayService.sendMessage(user.id, message.trim(), chatSessionId);

    return successResponse({
      ...response,
      sessionId: chatSessionId,
      isNewSession: isNewSession
    });
  } catch (error: any) {
    console.error('Chat send error:', error);
    return errorResponse(error.message || 'Failed to send message', 500);
  }
}

export const POST = withMiddleware(handler, {
  rateLimit: { windowMs: 1 * 60 * 1000, max: 30 } // 30 messages per minute
});
