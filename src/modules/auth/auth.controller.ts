import { Request, Response, NextFunction } from 'express';
import { RegisterSchema, LoginSchema, UpdateUserSchema } from './auth.schema';
import * as authService from './auth.service';
import { serializeBigInt } from '../../utils/serialization';
import { env } from '../../config/env';

const COOKIE_NAME = 'token';

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as any,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: parsed.error.flatten() },
      });
      return;
    }

    const user = await authService.createUser(parsed.data);
    const token = authService.generateToken(user.id);

    res.cookie(COOKIE_NAME, token, cookieOptions);

    const { password, ...userWithoutPassword } = user;
    res.status(201).json({
      success: true,
      data: serializeBigInt(userWithoutPassword),
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: parsed.error.flatten() },
      });
      return;
    }

    const user = await authService.validateUser(parsed.data);
    const token = authService.generateToken(user.id);

    res.cookie(COOKIE_NAME, token, cookieOptions);

    const { password, ...userWithoutPassword } = user;
    res.status(200).json({
      success: true,
      data: serializeBigInt(userWithoutPassword),
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie(COOKIE_NAME, cookieOptions);
  res.status(200).json({ success: true, message: 'Logged out successfully' });
}

export async function me(_req: Request, res: Response) {
  const { password, ...userWithoutPassword } = (_req as any).user;
  res.status(200).json({
    success: true,
    data: serializeBigInt(userWithoutPassword),
  });
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const parsed = UpdateUserSchema.safeParse(req.body);
    
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: parsed.error.flatten() },
      });
      return;
    }

    const updatedUser = await authService.updateUser(user.id, parsed.data);
    const { password, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      success: true,
      data: serializeBigInt(userWithoutPassword),
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    await authService.deleteUser(user.id);
    
    res.clearCookie(COOKIE_NAME, cookieOptions);
    res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    next(err);
  }
}
