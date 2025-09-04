import { NextRequest } from 'next/server';
import { withMiddleware, successResponse, errorResponse } from '@/lib/middleware';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/database';

/**
 * GET /api/chat/sessions
 * Get all chat sessions for the authenticated user
 */
async function handler(request: NextRequest) {
  const origin = request.headers.get('origin');

  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse('Authorization token required', 401, origin);
    }

    const token = authHeader.substring(7);
    
    // Verify token and get user
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return errorResponse('Invalid token', 401, origin);
    }

    // Get user's chat sessions with message count
    const sessions = await prisma.chatSession.findMany({
      where: {
        userId: decoded.userId
      },
      include: {
        messages: {
          orderBy: {
            timestamp: 'desc'
          },
          take: 1, // Get only the latest message for preview
          select: {
            content: true,
            timestamp: true,
            role: true
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Format response
    const formattedSessions = sessions.map(session => ({
      id: session.id,
      title: `Chat ${session.id.slice(-6)}`, // Generate a title from session ID
      conversationId: session.conversationId,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      timestamp: session.updatedAt.toISOString(),
      messageCount: session._count.messages,
      lastMessage: session.messages[0]?.content || 'No messages yet'
    }));

    return successResponse(formattedSessions, undefined, origin);

  } catch (error: any) {
    console.error('Error fetching chat sessions:', error);
    return errorResponse('Failed to fetch chat sessions', 500, origin);
  }
}

/**
 * POST /api/chat/sessions
 * Create a new chat session
 */
async function createHandler(request: NextRequest) {
  const origin = request.headers.get('origin');

  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse('Authorization token required', 401, origin);
    }

    const token = authHeader.substring(7);
    
    // Verify token and get user
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return errorResponse('Invalid token', 401, origin);
    }

    // Create new chat session
    const session = await prisma.chatSession.create({
      data: {
        userId: decoded.userId
      },
      include: {
        _count: {
          select: {
            messages: true
          }
        }
      }
    });

    const formattedSession = {
      id: session.id,
      title: `Chat ${session.id.slice(-6)}`,
      conversationId: session.conversationId,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      timestamp: session.updatedAt.toISOString(),
      messageCount: session._count.messages,
      lastMessage: 'No messages yet'
    };

    return successResponse(formattedSession, 'Chat session created successfully', origin);

  } catch (error: any) {
    console.error('Error creating chat session:', error);
    return errorResponse('Failed to create chat session', 500, origin);
  }
}

// Export handlers with middleware
export const GET = withMiddleware(handler, {
  rateLimit: { windowMs: 15 * 60 * 1000, max: 100 }
});

export const POST = withMiddleware(createHandler, {
  rateLimit: { windowMs: 15 * 60 * 1000, max: 50 }
});
