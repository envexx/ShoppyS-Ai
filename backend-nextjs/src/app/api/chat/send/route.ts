import { NextRequest } from 'next/server';
import { withMiddleware, errorResponse, successResponse } from '@/lib/middleware';
import { getUserFromToken } from '@/lib/auth';
import { SensayService } from '@/lib/sensay-service';

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
    const { message, sessionId } = body;

    if (!message || message.trim().length === 0) {
      return errorResponse('Message is required', 400);
    }

    console.log(`Chat request from user ${user.id}: "${message}"`);

    // Get or create session if not provided
    let chatSessionId = sessionId;
    if (!chatSessionId) {
      chatSessionId = await sensayService.getOrCreateChatSession(user.id);
    }

    // Send message to Sensay
    const response = await sensayService.sendMessage(user.id, message.trim(), chatSessionId);

    return successResponse({
      ...response,
      sessionId: chatSessionId
    });
  } catch (error: any) {
    console.error('Chat send error:', error);
    return errorResponse(error.message || 'Failed to send message', 500);
  }
}

export const POST = withMiddleware(handler, {
  rateLimit: { windowMs: 1 * 60 * 1000, max: 30 } // 30 messages per minute
});
