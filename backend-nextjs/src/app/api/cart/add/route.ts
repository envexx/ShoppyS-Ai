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

    const body = await request.json();
    const { productId, productName, description, price, quantity = 1, imageUrl, productUrl } = body;
    
    console.log('Add to cart request:', { userId: user.id, productId, productName, price, quantity });
    
    if (!productId || !productName || !price) {
      console.log('Missing required fields:', { productId, productName, price });
      return errorResponse('Product ID, name, and price are required', 400);
    }
    
    // Use transaction for atomic operations with cart totals
    const result = await prisma.$transaction(async (tx) => {
      // Check if product already exists in cart
      const existingItem = await tx.cartItem.findFirst({
        where: {
          userId: user.id,
          productId
        }
      });
      
      let cartItem;
      let isUpdate = false;
      
      if (existingItem) {
        // Update existing item quantity
        const newQuantity = existingItem.quantity + quantity;
        const newTotal = Number(price) * newQuantity;
        
        cartItem = await tx.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: newQuantity,
            total: newTotal
          }
        });
        isUpdate = true;
      } else {
        // Create new cart item
        const total = Number(price) * quantity;
        
        cartItem = await tx.cartItem.create({
          data: {
            userId: user.id,
            productId,
            productName,
            description,
            price: Number(price),
            quantity,
            total,
            imageUrl,
            productUrl
          }
        });
      }
      
      // Get updated cart totals
      const cartItems = await tx.cartItem.findMany({
        where: { userId: user.id }
      });
      
      const cartTotal = cartItems.reduce((sum, item) => sum + Number(item.total), 0);
      const cartCount = cartItems.length;
      
      return {
        item: cartItem,
        cartTotal,
        cartCount,
        isUpdate
      };
    });
    
    console.log('Cart item processed:', result.item);
    
    // Invalidate cache
    cacheService.delete(`cart_count_${user.id}`);
    cacheService.delete(`cart_${user.id}`);

    return successResponse({
      data: result.item,
      cartTotal: result.cartTotal,
      cartCount: result.cartCount
    }, result.isUpdate ? 'Item quantity updated in cart' : 'Item added to cart');
  } catch (error: any) {
    console.error('Add to cart error:', error);
    return errorResponse(error.message || 'Failed to add item to cart', 500);
  }
}

export const POST = withMiddleware(handler, {
  rateLimit: { windowMs: 1 * 60 * 1000, max: 30 } // 30 cart operations per minute
});
