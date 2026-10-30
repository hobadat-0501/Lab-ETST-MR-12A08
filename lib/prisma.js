import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Shown to users when data cannot be loaded; the actual cause is logged on the server.
export const SERVICE_ERROR = 'Unable to load data right now. Please try again shortly.'
