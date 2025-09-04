import { NextRequest } from 'next/server';
import { withMiddleware, errorResponse, successResponse } from '@/lib/middleware';
import { getUserFromToken } from '@/lib/auth';
import { ShopifyService } from '@/lib/shopify-service';

const shopifyService = new ShopifyService();

async function handler(request: NextRequest) {
  if (request.method !== 'GET') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    console.log(`Getting featured products (limit: ${limit})`);
    const products = await shopifyService.getFeaturedProducts(limit);
    
    return successResponse({
      products,
      count: products.length,
      formattedResponse: shopifyService.formatProductsForChat(products)
    });
  } catch (error: any) {
    console.error('Shopify featured products error:', error);
    return errorResponse(error.message || 'Failed to get featured products', 500);
  }
}

export const GET = withMiddleware(handler);
