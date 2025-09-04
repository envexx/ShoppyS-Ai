import { NextRequest } from 'next/server';
import { withMiddleware, successResponse } from '@/lib/middleware';

async function handler(request: NextRequest) {
  const data = {
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Shoppy Sensay Next.js API'
  };

  return successResponse(data);
}

export const GET = withMiddleware(handler);
export const POST = withMiddleware(handler);
