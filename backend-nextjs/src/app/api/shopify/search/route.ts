import { NextRequest } from 'next/server';
import { withMiddleware, errorResponse, successResponse } from '@/lib/middleware';
import { getUserFromToken } from '@/lib/auth';
import { ShopifyService } from '@/lib/shopify-service';

const shopifyService = new ShopifyService();

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
    const { query, limit = 5 } = body;
    
    if (!query || query.trim().length === 0) {
      return errorResponse('Search query is required', 400);
    }

    console.log(`Shopify search request: "${query}" (limit: ${limit})`);
    const products = await shopifyService.searchProducts(query.trim(), limit);
    
    return successResponse({
      products,
      count: products.length,
      formattedResponse: shopifyService.formatProductsForChat(products)
    });
  } catch (error: any) {
    console.error('Shopify search error:', error);
    return errorResponse(error.message || 'Failed to search products', 500);
  }
}

export const POST = withMiddleware(handler);
