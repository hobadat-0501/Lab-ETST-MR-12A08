import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export function databaseErrorMessage() {
  if (!process.env.DATABASE_URL) {
    return process.env.VERCEL
      ? 'Deployment Vercel này không nhận được DATABASE_URL. Kiểm tra đúng project và Production/Preview scope, rồi tạo deployment mới.'
      : 'Chưa cấu hình DATABASE_URL trong .env để kết nối PostgreSQL Supabase.'
  }
  return 'Không kết nối được PostgreSQL. Kiểm tra DATABASE_URL và trạng thái dự án Supabase.'
}
