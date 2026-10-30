import { NextResponse } from 'next/server'
import { isAdminRequest } from '../../../../lib/auth'

export async function GET(request) {
  const authenticated = isAdminRequest(request)
  return NextResponse.json({ authenticated, username: authenticated ? process.env.ADMIN_USERNAME : null })
}
