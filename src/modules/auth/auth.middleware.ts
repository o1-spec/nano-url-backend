import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { getUserById } from './auth.service';
import { createError } from '../../utils/errors';

export async function protect(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.token;

    if (!token) {
      throw createError('Not authenticated', 401);
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as { sub: string };
    
    if (!decoded.sub) {
      throw createError('Invalid token', 401);
    }

    const user = await getUserById(BigInt(decoded.sub));

    if (!user) {
      throw createError('User not found', 401);
    }

    (req as any).user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      next(createError('Invalid token', 401));
      return;
    }
    next(err);
  }
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.token;

    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { sub: string };
      if (decoded.sub) {
        const user = await getUserById(BigInt(decoded.sub));
        if (user) {
          (req as any).user = user;
        }
      }
    }
    next();
  } catch (err) {
    // In optional auth, we just continue even if token is invalid
    next();
  }
}
