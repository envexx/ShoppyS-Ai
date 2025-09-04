import { NextRequest } from 'next/server';
import { withMiddleware, errorResponse, successResponse } from '@/lib/middleware';
import { getUserFromToken } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { cacheService } from '@/lib/cache';

async function handler(request: NextRequest) {
  if (request.method !== 'GET') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const cacheKey = `cart_count_${user.id}`;
    
    // Try to get from cache first
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      return successResponse({
        ...cachedData,
        cached: true
      });
    }
    
    // Use aggregation for faster count and total calculation
    const cartStats = await prisma.cartItem.aggregate({
      where: { userId: user.id },
      _count: { id: true },
      _sum: { total: true }
    });
    
    const result = {
      count: cartStats._count.id || 0,
      total: Number(cartStats._sum.total) || 0
    };
    
    // Cache the result for 30 seconds
    cacheService.set(cacheKey, result, 30000);
    
    return successResponse(result);
  } catch (error: any) {
    console.error('Get cart count error:', error);
    return errorResponse(error.message || 'Failed to get cart count', 500);
  }
}

export const GET = withMiddleware(handler);
