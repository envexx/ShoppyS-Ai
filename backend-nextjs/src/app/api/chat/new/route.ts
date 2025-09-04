import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '../../../../lib/sessionManager';
import { getUserFromToken } from '../../../../lib/auth';
import { SensayService } from '../../../../lib/sensay-service';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 POST /api/chat/new - Starting request');
    
    const body = await request.json();
    const { message } = body;
    console.log('📨 Received message:', message);

    if (!message || !message.trim()) {
      console.log('❌ Message is empty or missing');
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

    // Initialize Sensay service
    const sensayService = new SensayService();

    // Buat session baru
    console.log('🆕 Creating new session...');
    const { sessionId } = await SessionManager.createSession(userId);
    console.log('✅ Session created:', sessionId);

    // Send message to Sensay AI and get response
    console.log('🤖 Sending message to Sensay AI...');
    const sensayResponse = await sensayService.sendMessage(userId || 'anonymous', message, sessionId);
    console.log('✅ Sensay AI response received:', sensayResponse);

    // Update session title berdasarkan pesan pertama
    console.log('📝 Updating session title...');
    const title = await SessionManager.updateSessionTitle(sessionId, message);
    console.log('✅ Session title updated:', title);

    const response = {
      success: true,
      sessionId: sessionId,
      title: title,
      response: sensayResponse.content,
      cartAction: sensayResponse.cartAction
    };
    
    console.log('🎉 Success response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error creating new chat:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
