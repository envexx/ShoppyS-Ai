import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { prisma } from './database';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  sensayUserId?: string | null;
}

export interface AuthRequest extends NextRequest {
  user?: AuthUser;
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'shoppy_sensay_jwt_secret_key_2024';

/**
 * Hash password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password
 */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generate JWT token
 */
export const generateToken = (payload: any): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

/**
 * Get user from token - for use in API routes
 */
export const getUserFromToken = async (request: NextRequest): Promise<AuthUser | null> => {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        sensayUserId: true
      }
    });

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
};

/**
 * Auth middleware for API routes
 */
export const withAuth = (handler: (req: NextRequest, user: AuthUser) => Promise<Response>) => {
  return async (req: NextRequest) => {
    try {
      const user = await getUserFromToken(req);
      
      if (!user) {
        return new Response(JSON.stringify({ error: 'Access token required' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return handler(req, user);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
};

/**
 * Register new user
 */
export const registerUser = async (email: string, username: string, password: string) => {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      throw new Error('User already exists with this email or username');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true
      }
    });

    // Generate token
    const token = generateToken({ userId: user.id });

    return {
      user,
      token
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Login user
 */
export const loginUser = async (emailOrUsername: string, password: string) => {
  try {
    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername },
          { username: emailOrUsername }
        ]
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    // Generate token
    const token = generateToken({ userId: user.id });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        sensayUserId: user.sensayUserId,
        createdAt: user.createdAt
      },
      token
    };
  } catch (error) {
    throw error;
  }
};
