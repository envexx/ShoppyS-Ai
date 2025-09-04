import { NextRequest } from 'next/server';
import { withMiddleware, errorResponse, successResponse } from '@/lib/middleware';
import { getUserFromToken } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { cacheService } from '@/lib/cache';

async function handler(request: NextRequest) {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }
    
    // Use transaction for atomic checkout process
    const result = await prisma.$transaction(async (tx) => {
      // Get all cart items
      const cartItems = await tx.cartItem.findMany({
        where: { userId: user.id }
      });
      
      if (cartItems.length === 0) {
        throw new Error('Cart is empty');
      }
      
      const orderId = `ORDER_${Date.now()}_${user.id}`;
      
      // Create purchase history entries
      const purchases = await Promise.all(
        cartItems.map(item => 
          tx.purchaseHistory.create({
            data: {
              userId: item.userId,
              productId: item.productId,
              productName: item.productName,
              description: item.description,
              price: item.price,
              quantity: item.quantity,
              total: item.total,
              imageUrl: item.imageUrl,
              productUrl: item.productUrl,
              orderId,
              status: 'completed'
            }
          })
        )
      );
      
      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId: user.id }
      });
      
      const totalAmount = purchases.reduce((sum, purchase) => sum + Number(purchase.total), 0);
      
      return {
        purchases,
        totalAmount,
        orderId
      };
    });
    
    // Invalidate cache
    cacheService.delete(`cart_count_${user.id}`);
    cacheService.delete(`cart_${user.id}`);
    
    return successResponse({
      ...result,
      message: 'Checkout completed successfully'
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return errorResponse(error.message || 'Failed to complete checkout', 500);
  }
}

export const POST = withMiddleware(handler);
