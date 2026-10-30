export const runtime = 'nodejs'

export async function GET() {
  return Response.json({
    databaseUrlPresent: Boolean(process.env.DATABASE_URL),
    directUrlPresent: Boolean(process.env.DIRECT_URL),
    vercelEnvironment: process.env.VERCEL_ENV || null,
    nodeEnvironment: process.env.NODE_ENV || null,
  }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
