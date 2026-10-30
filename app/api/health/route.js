import { prisma } from '../../../lib/prisma'

export const runtime = 'nodejs'

// Deployment diagnostics. Never returns secrets or error messages (they can contain hosts); only a Prisma error code.
// P1000 auth failed · P1001/P1002 unreachable · P1017 connection closed · P2021 missing table · P2022 missing column
export async function GET() {
  let database = 'ok', errorCode = null
  try {
    await prisma.event.findFirst() // selects every column, so a missing migration shows up as P2021/P2022
    await prisma.transaction.findFirst()
  } catch (error) {
    database = 'error'
    errorCode = error?.code || error?.name || 'unknown'
  }
  return Response.json({
    databaseUrlPresent: Boolean(process.env.DATABASE_URL),
    directUrlPresent: Boolean(process.env.DIRECT_URL),
    database,
    errorCode,
    vercelEnvironment: process.env.VERCEL_ENV || null,
    nodeEnvironment: process.env.NODE_ENV || null,
  }, { headers: { 'Cache-Control': 'no-store' } })
}
