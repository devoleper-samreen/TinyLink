/**
 * Prisma Client Singleton
 * Ensures only one instance of Prisma Client is created
 * Prevents connection issues during development with hot reloading
 */

import { PrismaClient } from '@prisma/client';

// Extend global namespace to store Prisma instance
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create Prisma client instance
// In development, reuse existing instance to avoid connection exhaustion
// In production, create new instance
export const prisma = global.prisma || new PrismaClient();

// Store instance globally in development for hot reload persistence
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
