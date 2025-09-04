import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '../../../../lib/sessionManager';
import { getUserFromToken } from '../../../../lib/auth';
import { SensayService } from '../../../../lib/sensay-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { sessionId } = params;

  try {
    const sessionData = await SessionManager.getSession(sessionId);
    
    if (!sessionData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Chat session not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      sessionId: sessionId,
      title: sessionData.session.title,
      messages: sessionData.messages
    });

  } catch (error) {
    console.error('Error loading chat:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { sessionId } = params;

  try {
    console.log('🔄 POST /api/chat/[sessionId] - Continuing chat in session:', sessionId);
    
    const body = await request.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Message is required' 
      }, { status: 400 });
    }

    // Get user from token if authenticated
    console.log('🔐 Getting user from token...');
    const user = await getUserFromToken(request);
    const userId = user?.id;
    console.log('👤 User ID:', userId);

    // Validate session ownership
    const sessionData = await SessionManager.getSession(sessionId);
    if (!sessionData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Chat session not found' 
      }, { status: 404 });
    }

    // Initialize Sensay service
    const sensayService = new SensayService();

    // Send message to Sensay AI and get response
    console.log('🤖 Sending message to Sensay AI...');
    const sensayResponse = await sensayService.sendMessage(userId || 'anonymous', message, sessionId);
    console.log('✅ Sensay AI response received:', sensayResponse);

    return NextResponse.json({
      success: true,
      sessionId: sessionId,
      response: sensayResponse.content,
      cartAction: sensayResponse.cartAction
    });

  } catch (error) {
    console.error('❌ Error continuing chat:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { sessionId } = params;

  try {
    await SessionManager.deleteSession(sessionId);
    
    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
