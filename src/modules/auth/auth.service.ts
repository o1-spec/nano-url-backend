import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { createError } from '../../utils/errors';
import type { RegisterInput, LoginInput } from './auth.schema';

const SALT_ROUNDS = 10;

export async function createUser(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw createError('User already exists', 400);
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      password: hashedPassword,
    },
  });

  return user;
}

export async function validateUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw createError('Invalid credentials', 401);
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);

  if (!isPasswordValid) {
    throw createError('Invalid credentials', 401);
  }

  return user;
}

export function generateToken(userId: bigint): string {
  return jwt.sign({ sub: userId.toString() }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
}

export async function getUserById(id: bigint) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function updateUser(id: bigint, input: any) {
  return prisma.user.update({
    where: { id },
    data: input,
  });
}

export async function deleteUser(id: bigint) {
  return prisma.user.delete({
    where: { id },
  });
}
