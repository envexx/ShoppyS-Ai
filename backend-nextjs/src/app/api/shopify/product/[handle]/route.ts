import { NextRequest } from 'next/server';
import { withMiddleware, errorResponse, successResponse } from '@/lib/middleware';
import { getUserFromToken } from '@/lib/auth';
import { ShopifyService } from '@/lib/shopify-service';

const shopifyService = new ShopifyService();

async function handler(request: NextRequest, { params }: { params: { handle: string } }) {
  if (request.method !== 'GET') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const { handle } = params;
    
    if (!handle) {
      return errorResponse('Product handle is required', 400);
    }

    console.log(`Getting product details for handle: ${handle}`);
    const product = await shopifyService.getProductByHandle(handle);
    
    if (!product) {
      return errorResponse('Product not found', 404);
    }

    return successResponse(product);
  } catch (error: any) {
    console.error('Shopify get product error:', error);
    return errorResponse(error.message || 'Failed to get product details', 500);
  }
}

export const GET = withMiddleware(handler);
