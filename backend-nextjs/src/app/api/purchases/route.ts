import { NextRequest } from 'next/server';
import { withMiddleware, errorResponse, successResponse } from '@/lib/middleware';
import { getUserFromToken } from '@/lib/auth';
import { prisma } from '@/lib/database';

async function handler(request: NextRequest) {
  if (request.method !== 'GET') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }
    
    const purchases = await prisma.purchaseHistory.findMany({
      where: { userId: user.id },
      orderBy: { purchaseDate: 'desc' }
    });
    
    return successResponse(purchases);
  } catch (error: any) {
    console.error('Get purchase history error:', error);
    return errorResponse(error.message || 'Failed to get purchase history', 500);
  }
}

export const GET = withMiddleware(handler);
