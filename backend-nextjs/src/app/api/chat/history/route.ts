import { NextRequest } from 'next/server';
import { withMiddleware, errorResponse, successResponse } from '@/lib/middleware';
import { getUserFromToken } from '@/lib/auth';
import { SensayService } from '@/lib/sensay-service';

const sensayService = new SensayService();

async function handler(request: NextRequest) {
  if (request.method !== 'GET') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    console.log('🔍 Chat History API - User ID:', user.id, 'User:', user.username);

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const sessionId = url.searchParams.get('sessionId');

    console.log('📋 Fetching chat history for user:', user.id, 'sessionId:', sessionId, 'limit:', limit);

    // If sessionId is provided, validate it belongs to the user
    if (sessionId) {
      const isValidSession = await sensayService.validateSessionOwnership(sessionId, user.id);
      if (!isValidSession) {
        console.log('❌ Invalid session access:', sessionId, 'for user:', user.id);
        return errorResponse('Invalid session access', 403);
      }
      console.log('✅ Session validated:', sessionId, 'for user:', user.id);
    }

    const history = await sensayService.getChatHistory(user.id, limit, sessionId || undefined);

    console.log('✅ Found chat history:', history.length, 'messages for user:', user.id);

    return successResponse({
      history: history,
      userAuthenticated: true,
      userId: user.id,
      sessionId: sessionId
    });
  } catch (error: any) {
    console.error('❌ Chat history error:', error);
    return errorResponse(error.message || 'Failed to get chat history', 500);
  }
}

export const GET = withMiddleware(handler);
