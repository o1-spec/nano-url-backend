import dotenv from 'dotenv';

dotenv.config();

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: parseInt(optional('PORT', '3000'), 10),
  BASE_URL: optional('BASE_URL', 'http://localhost:3000'),

  DATABASE_URL: required('DATABASE_URL'),

  REDIS_HOST: optional('REDIS_HOST', 'localhost'),
  REDIS_PORT: parseInt(optional('REDIS_PORT', '6379'), 10),

  RATE_LIMIT_WINDOW_MS: parseInt(optional('RATE_LIMIT_WINDOW_MS', '60000'), 10),
  RATE_LIMIT_MAX: parseInt(optional('RATE_LIMIT_MAX', '60'), 10),

  JWT_SECRET: optional('JWT_SECRET', 'dev_secret'),
  JWT_EXPIRES_IN: optional('JWT_EXPIRES_IN', '7d'),
} as const;
