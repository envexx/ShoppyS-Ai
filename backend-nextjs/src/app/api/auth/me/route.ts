import { NextRequest } from 'next/server';
import { withMiddleware, errorResponse, successResponse } from '@/lib/middleware';
import { getUserFromToken } from '@/lib/auth';

async function handler(request: NextRequest) {
  if (request.method !== 'GET') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    return successResponse(user);
  } catch (error: any) {
    console.error('Get user error:', error);
    return errorResponse('Failed to get user information', 500);
  }
}

export const GET = withMiddleware(handler);
