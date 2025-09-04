import { NextRequest } from 'next/server';
import { withMiddleware, successResponse } from '@/lib/middleware';

async function handler(request: NextRequest) {
  const data = {
    message: '🛍️ Shoppy Sensay Next.js API Server',
    version: '2.0.0',
    status: 'Running',
    framework: 'Next.js 15',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me'
      },
      chat: {
        send: 'POST /api/chat/send',
        history: 'GET /api/chat/history'
      },
      cart: {
        get: 'GET /api/cart',
        add: 'POST /api/cart/add',
        update: 'PUT /api/cart/[itemId]',
        remove: 'DELETE /api/cart/[itemId]',
        clear: 'DELETE /api/cart',
        count: 'GET /api/cart/count'
      },
      shopify: {
        search: 'POST /api/shopify/search',
        featured: 'GET /api/shopify/featured',
        product: 'GET /api/shopify/product/[handle]'
      },
      purchases: 'GET /api/purchases',
      checkout: 'POST /api/checkout'
    },
    documentation: 'https://api.sensay.io/docs'
  };

  return successResponse(data);
}

export const GET = withMiddleware(handler);
export const POST = withMiddleware(handler);
