import { NextRequest } from 'next/server';
import { withMiddleware, errorResponse, successResponse } from '@/lib/middleware';
import { registerUser } from '@/lib/auth';

async function handler(request: NextRequest) {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const body = await request.json();
    const { email, username, password } = body;

    if (!email || !username || !password) {
      return errorResponse('Email, username, and password are required', 400);
    }

    if (password.length < 6) {
      return errorResponse('Password must be at least 6 characters', 400);
    }

    const result = await registerUser(email, username, password);
    
    return successResponse(result, 'User registered successfully');
  } catch (error: any) {
    console.error('Register error:', error);
    return errorResponse(error.message || 'Failed to register user', 400);
  }
}

export const POST = withMiddleware(handler, {
  rateLimit: { windowMs: 15 * 60 * 1000, max: 5 } // 5 registration attempts per 15 minutes
});
