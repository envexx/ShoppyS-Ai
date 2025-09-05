import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '../../../../lib/sessionManager';
import { getUserFromToken } from '../../../../lib/auth';
import { withMiddleware, errorResponse, successResponse } from '../../../../lib/middleware';

async function handler(request: NextRequest) {
  console.log('🚀 Sessions API handler called - Method:', request.method);
  
  if (request.method !== 'GET') {
    console.log('❌ Method not allowed:', request.method);
    return errorResponse('Method not allowed', 405);
  }

  try {
    console.log('🔍 Sessions API - Starting request processing');
    
    // Get user from token if authenticated
    const user = await getUserFromToken(request);
    const userId = user?.id;

    console.log('🔍 Sessions API - User ID:', userId, 'User:', user ? 'Authenticated' : 'Not authenticated');

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    
    console.log('📋 Fetching sessions for user:', userId, 'with limit:', limit);
    
    console.log('🔍 About to call SessionManager.getSessions...');
    const sessions = await SessionManager.getSessions(userId, limit);
    console.log('🔍 SessionManager.getSessions completed');

    console.log('✅ Found sessions:', sessions.length, 'for user:', userId);

    const response = successResponse({
      sessions: sessions,
      userAuthenticated: !!user,
      userId: userId
    });
    
    console.log('🔍 Returning response:', response);
    return response;

  } catch (error) {
    console.error('❌ Error loading sessions:', error);
    return errorResponse('Internal server error', 500);
  }
}

export const GET = withMiddleware(handler);
