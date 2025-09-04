import { NextRequest, NextResponse } from 'next/server';

// Rate limiting storage
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

/**
 * Rate limiter for API requests
 */
export function rateLimit(windowMs: number = 15 * 60 * 1000, max: number = 100) {
  return (req: NextRequest): boolean => {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.timestamp < windowStart) {
        rateLimitMap.delete(key);
      }
    }

    const current = rateLimitMap.get(ip);
    
    if (!current) {
      rateLimitMap.set(ip, { count: 1, timestamp: now });
      return true;
    }

    if (current.timestamp < windowStart) {
      rateLimitMap.set(ip, { count: 1, timestamp: now });
      return true;
    }

    if (current.count >= max) {
      return false;
    }

    current.count++;
    return true;
  };
}

/**
 * CORS handler for API routes
 */
export function corsHeaders(origin?: string | null): Record<string, string> {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173'
  ];

  const isAllowedOrigin = origin && allowedOrigins.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
  };
}

/**
 * Handle preflight OPTIONS requests
 */
export function handleOptions(request: NextRequest): NextResponse {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 200 });
  
  const corsHeadersObj = corsHeaders(origin);
  Object.entries(corsHeadersObj).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Add standard response headers
 */
export function addStandardHeaders(response: NextResponse, origin?: string | null): NextResponse {
  // Add CORS headers
  const corsHeadersObj = corsHeaders(origin);
  Object.entries(corsHeadersObj).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

/**
 * Generic error response
 */
export function errorResponse(message: string, status: number = 500, origin?: string | null): NextResponse {
  const response = NextResponse.json(
    { error: message, timestamp: new Date().toISOString() },
    { status }
  );

  return addStandardHeaders(response, origin);
}

/**
 * Generic success response
 */
export function successResponse(data: any, message?: string, origin?: string | null): NextResponse {
  const responseData = message ? { success: true, message, data } : { success: true, data };
  const response = NextResponse.json(responseData);

  return addStandardHeaders(response, origin);
}

/**
 * Logging middleware
 */
export function logRequest(request: NextRequest): void {
  const timestamp = new Date().toISOString();
  const method = request.method;
  const url = request.url;
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  console.log(`${timestamp} - ${method} ${url} - ${userAgent}`);
}

/**
 * Compression utility (manual gzip for specific responses)
 */
export function shouldCompress(contentType: string): boolean {
  const compressibleTypes = [
    'application/json',
    'text/html',
    'text/css',
    'text/javascript',
    'application/javascript',
    'text/xml',
    'application/xml'
  ];
  
  return compressibleTypes.some(type => contentType.includes(type));
}

/**
 * Main API middleware wrapper
 */
export function withMiddleware(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  options: {
    rateLimit?: { windowMs?: number; max?: number };
    requireAuth?: boolean;
  } = {}
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const origin = request.headers.get('origin');
    
    // Log request
    logRequest(request);

    // Handle preflight OPTIONS requests
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    // Rate limiting
    if (options.rateLimit) {
      const limiter = rateLimit(options.rateLimit.windowMs, options.rateLimit.max);
      if (!limiter(request)) {
        return errorResponse('Too many requests, please try again later.', 429, origin);
      }
    }

    try {
      const response = await handler(request, context);
      return addStandardHeaders(response, origin);
    } catch (error: any) {
      console.error('API Error:', error);
      return errorResponse(
        process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        500,
        origin
      );
    }
  };
}
