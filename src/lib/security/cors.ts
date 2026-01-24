/**
 * CORS (Cross-Origin Resource Sharing) Configuration
 * Controls which origins can access the API
 */

import { NextRequest, NextResponse } from 'next/server';

export interface CorsOptions {
  origin?: string | string[] | ((origin: string) => boolean);
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * Default CORS configuration
 */
const defaultCorsOptions: CorsOptions = {
  origin: process.env.NEXT_PUBLIC_APP_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

/**
 * Apply CORS headers to a response
 */
export function cors(options: CorsOptions = {}): (request: NextRequest) => NextResponse | null {
  const config = { ...defaultCorsOptions, ...options };

  return (request: NextRequest): NextResponse | null => {
    const origin = request.headers.get('origin') || '';
    const method = request.method;

    // Handle preflight OPTIONS request
    if (method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: getCorsHeaders(origin, config),
      });
    }

    return null;
  };
}

/**
 * Get CORS headers based on configuration
 */
export function getCorsHeaders(origin: string, options: CorsOptions = {}): Headers {
  const config = { ...defaultCorsOptions, ...options };
  const headers = new Headers();

  // Determine if origin is allowed
  const allowedOrigin = isOriginAllowed(origin, config.origin);

  if (allowedOrigin) {
    headers.set('Access-Control-Allow-Origin', allowedOrigin);
  }

  if (config.credentials) {
    headers.set('Access-Control-Allow-Credentials', 'true');
  }

  if (config.methods && config.methods.length > 0) {
    headers.set('Access-Control-Allow-Methods', config.methods.join(', '));
  }

  if (config.allowedHeaders && config.allowedHeaders.length > 0) {
    headers.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
  }

  if (config.exposedHeaders && config.exposedHeaders.length > 0) {
    headers.set('Access-Control-Expose-Headers', config.exposedHeaders.join(', '));
  }

  if (config.maxAge) {
    headers.set('Access-Control-Max-Age', config.maxAge.toString());
  }

  return headers;
}

/**
 * Check if origin is allowed based on configuration
 */
function isOriginAllowed(
  origin: string,
  allowedOrigin?: string | string[] | ((origin: string) => boolean)
): string | false {
  if (!origin) return false;

  // Allow all origins
  if (allowedOrigin === '*') {
    return '*';
  }

  // Single origin string
  if (typeof allowedOrigin === 'string') {
    return origin === allowedOrigin ? origin : false;
  }

  // Array of allowed origins
  if (Array.isArray(allowedOrigin)) {
    return allowedOrigin.includes(origin) ? origin : false;
  }

  // Function to determine if origin is allowed
  if (typeof allowedOrigin === 'function') {
    return allowedOrigin(origin) ? origin : false;
  }

  return false;
}

/**
 * Add CORS headers to an existing response
 */
export function addCorsHeaders(
  response: NextResponse,
  origin: string,
  options: CorsOptions = {}
): NextResponse {
  const headers = getCorsHeaders(origin, options);

  headers.forEach((value, key) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * CORS middleware for API routes
 */
export function corsMiddleware(options: CorsOptions = {}) {
  return async (
    request: NextRequest,
    handler: () => Promise<NextResponse>
  ): Promise<NextResponse> => {
    const origin = request.headers.get('origin') || '';

    // Handle preflight request
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: getCorsHeaders(origin, options),
      });
    }

    // Execute the handler
    const response = await handler();

    // Add CORS headers to the response
    return addCorsHeaders(response, origin, options);
  };
}

/**
 * Preset CORS configurations
 */

// Public API - allow all origins
export const publicCors = cors({
  origin: '*',
  credentials: false,
});

// Authenticated API - only allow app origin
export const authenticatedCors = cors({
  origin: process.env.NEXT_PUBLIC_APP_URL,
  credentials: true,
});

// Analytics tracking - allow multiple domains
export const analyticsCors = cors({
  origin: (origin) => {
    // Allow localhost for development
    if (origin.includes('localhost')) return true;

    // Allow configured domains
    const allowedDomains = process.env.ALLOWED_ANALYTICS_DOMAINS?.split(',') || [];
    return allowedDomains.some((domain) => origin.includes(domain));
  },
  credentials: false,
});

// Webhook endpoints - verify origin
export const webhookCors = cors({
  origin: '*', // Webhooks are verified by signature, not origin
  credentials: false,
  methods: ['POST'],
});
