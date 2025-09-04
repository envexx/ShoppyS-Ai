import { NextRequest } from 'next/server';
import { withMiddleware, errorResponse, successResponse } from '@/lib/middleware';
import { getUserFromToken } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { cacheService } from '@/lib/cache';

async function handleGet(request: NextRequest) {
  const user = await getUserFromToken(request);
  if (!user) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    
    const total = cartItems.reduce((sum, item) => sum + Number(item.total), 0);
    
    return successResponse({
      items: cartItems,
      total: total,
      count: cartItems.length
    });
  } catch (error: any) {
    console.error('Get cart error:', error);
    return errorResponse(error.message || 'Failed to get cart items', 500);
  }
}

async function handleDelete(request: NextRequest) {
  const user = await getUserFromToken(request);
  if (!user) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    await prisma.cartItem.deleteMany({
      where: { userId: user.id }
    });
    
    return successResponse(null, 'Cart cleared');
  } catch (error: any) {
    console.error('Clear cart error:', error);
    return errorResponse(error.message || 'Failed to clear cart', 500);
  }
}

async function handler(request: NextRequest) {
  switch (request.method) {
    case 'GET':
      return handleGet(request);
    case 'DELETE':
      return handleDelete(request);
    default:
      return errorResponse('Method not allowed', 405);
  }
}

export const GET = withMiddleware(handler);
export const DELETE = withMiddleware(handler);
