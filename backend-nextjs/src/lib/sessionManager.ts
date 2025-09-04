import { prisma } from './database';

export interface ChatSessionData {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}

export interface ChatMessageData {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
}

export class SessionManager {
  /**
   * Buat session baru
   */
  static async createSession(userId?: string): Promise<{ sessionId: string; title: string }> {
    try {
      const session = await prisma.chatSession.create({
        data: {
          userId: userId || null,
          title: 'New Chat',
          isActive: true,
        },
      });

      return {
        sessionId: session.id,
        title: session.title,
      };
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create chat session');
    }
  }

  /**
   * Update title session berdasarkan pesan pertama
   */
  static async updateSessionTitle(sessionId: string, firstMessage: string): Promise<string> {
    try {
      // Generate title dari 3-4 kata pertama
      const words = firstMessage.split(' ').slice(0, 4);
      const title = words.join(' ');
      const finalTitle = title.length > 30 ? title.substring(0, 30) + '...' : title;

      await prisma.chatSession.update({
        where: { id: sessionId },
        data: {
          title: finalTitle,
          updatedAt: new Date(),
        },
      });

      return finalTitle;
    } catch (error) {
      console.error('Error updating session title:', error);
      throw new Error('Failed to update session title');
    }
  }

  /**
   * Ambil session dengan messages
   */
  static async getSession(sessionId: string): Promise<{
    session: ChatSessionData;
    messages: ChatMessageData[];
  } | null> {
    try {
      const session = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          isActive: true,
        },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' },
            select: {
              role: true,
              content: true,
              timestamp: true,
              metadata: true,
            },
          },
        },
      });

      if (!session) {
        return null;
      }

      return {
        session: {
          id: session.id,
          title: session.title,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          messageCount: session.messages.length,
        },
        messages: session.messages.map((msg: any) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
          timestamp: msg.timestamp,
          metadata: msg.metadata,
        })),
      };
    } catch (error) {
      console.error('Error getting session:', error);
      throw new Error('Failed to get chat session');
    }
  }

  /**
   * Simpan message
   */
  static async saveMessage(
    sessionId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: any
  ): Promise<void> {
    try {
      await prisma.chatMessage.create({
        data: {
          sessionId,
          role,
          content,
          metadata: metadata ? JSON.stringify(metadata) : undefined,
        },
      });

      // Update timestamp session
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() },
      });
    } catch (error) {
      console.error('Error saving message:', error);
      throw new Error('Failed to save message');
    }
  }

  /**
   * Ambil daftar sessions
   */
  static async getSessions(userId?: string, limit: number = 50): Promise<ChatSessionData[]> {
    try {
      const sessions = await prisma.chatSession.findMany({
        where: {
          isActive: true,
          ...(userId && { userId }),
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        include: {
          _count: {
            select: { messages: true },
          },
        },
      });

      return sessions.map((session: any) => ({
        id: session.id,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messageCount: session._count.messages,
      }));
    } catch (error) {
      console.error('Error getting sessions:', error);
      throw new Error('Failed to get chat sessions');
    }
  }

  /**
   * Hapus session (soft delete)
   */
  static async deleteSession(sessionId: string): Promise<void> {
    try {
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { isActive: false },
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      throw new Error('Failed to delete chat session');
    }
  }

  /**
   * Update session dengan data tambahan
   */
  static async updateSession(
    sessionId: string,
    data: Partial<{ title: string; conversationId: string }>
  ): Promise<void> {
    try {
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error updating session:', error);
      throw new Error('Failed to update chat session');
    }
  }
}
