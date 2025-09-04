import { NextRequest } from 'next/server';
import { withMiddleware, errorResponse, successResponse } from '@/lib/middleware';
import { loginUser } from '@/lib/auth';

async function handler(request: NextRequest) {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const body = await request.json();
    const { emailOrUsername, password } = body;

    if (!emailOrUsername || !password) {
      return errorResponse('Email/username and password are required', 400);
    }

    const result = await loginUser(emailOrUsername, password);
    
    return successResponse(result, 'Login successful');
  } catch (error: any) {
    console.error('Login error:', error);
    return errorResponse(error.message || 'Failed to login', 401);
  }
}

export const POST = withMiddleware(handler, {
  rateLimit: { windowMs: 15 * 60 * 1000, max: 10 } // 10 login attempts per 15 minutes
});
