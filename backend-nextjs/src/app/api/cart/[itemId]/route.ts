import { NextRequest } from 'next/server';
import { withMiddleware, errorResponse, successResponse } from '@/lib/middleware';
import { getUserFromToken } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { cacheService } from '@/lib/cache';

async function handlePut(request: NextRequest, context: { params: Promise<{ itemId: string }> }) {
  const user = await getUserFromToken(request);
  if (!user) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    const { itemId } = await context.params;
    const body = await request.json();
    const { quantity } = body;
    
    if (!quantity || quantity < 1) {
      return errorResponse('Valid quantity is required', 400);
    }
    
    // Use transaction for atomic update with cart totals
    const result = await prisma.$transaction(async (tx) => {
      const cartItem = await tx.cartItem.findFirst({
        where: { id: itemId, userId: user.id }
      });
      
      if (!cartItem) {
        throw new Error('Cart item not found');
      }
      
      const total = Number(cartItem.price) * quantity;
      
      const updatedItem = await tx.cartItem.update({
        where: { id: itemId },
        data: { quantity, total }
      });
      
      // Get updated cart totals
      const cartItems = await tx.cartItem.findMany({
        where: { userId: user.id }
      });
      
      const cartTotal = cartItems.reduce((sum, item) => sum + Number(item.total), 0);
      const cartCount = cartItems.length;
      
      return {
        item: updatedItem,
        cartTotal,
        cartCount
      };
    });
    
    // Invalidate cache
    cacheService.delete(`cart_count_${user.id}`);
    cacheService.delete(`cart_${user.id}`);

    return successResponse({
      data: result.item,
      cartTotal: result.cartTotal,
      cartCount: result.cartCount
    });
  } catch (error: any) {
    console.error('Update cart error:', error);
    return errorResponse(error.message || 'Failed to update cart item', 500);
  }
}

async function handleDelete(request: NextRequest, context: { params: Promise<{ itemId: string }> }) {
  const user = await getUserFromToken(request);
  if (!user) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    const { itemId } = await context.params;
    
    // Use transaction for atomic delete with cart totals
    const result = await prisma.$transaction(async (tx) => {
      const cartItem = await tx.cartItem.findFirst({
        where: { id: itemId, userId: user.id }
      });
      
      if (!cartItem) {
        throw new Error('Cart item not found');
      }
      
      await tx.cartItem.delete({
        where: { id: itemId }
      });
      
      // Get updated cart totals
      const cartItems = await tx.cartItem.findMany({
        where: { userId: user.id }
      });
      
      const cartTotal = cartItems.reduce((sum, item) => sum + Number(item.total), 0);
      const cartCount = cartItems.length;
      
      return {
        cartTotal,
        cartCount
      };
    });
    
    // Invalidate cache
    cacheService.delete(`cart_count_${user.id}`);
    cacheService.delete(`cart_${user.id}`);

    return successResponse({
      cartTotal: result.cartTotal,
      cartCount: result.cartCount
    }, 'Item removed from cart');
  } catch (error: any) {
    console.error('Remove from cart error:', error);
    return errorResponse(error.message || 'Failed to remove item from cart', 500);
  }
}

async function handler(request: NextRequest, context: { params: Promise<{ itemId: string }> }) {
  switch (request.method) {
    case 'PUT':
      return handlePut(request, context);
    case 'DELETE':
      return handleDelete(request, context);
    default:
      return errorResponse('Method not allowed', 405);
  }
}

export const PUT = withMiddleware(handler, {
  rateLimit: { windowMs: 1 * 60 * 1000, max: 30 }
});

export const DELETE = withMiddleware(handler, {
  rateLimit: { windowMs: 1 * 60 * 1000, max: 30 }
});
