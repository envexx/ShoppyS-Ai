import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '../../../../lib/sessionManager';
import { getUserFromToken } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get user from token if authenticated
    const user = await getUserFromToken(request);
    const userId = user?.id;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const sessions = await SessionManager.getSessions(userId, limit);

    return NextResponse.json({
      success: true,
      data: {
        sessions: sessions
      }
    });

  } catch (error) {
    console.error('Error loading sessions:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
