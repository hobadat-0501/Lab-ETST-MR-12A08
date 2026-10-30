import { NextResponse } from 'next/server'
import { isAdminRequest } from '../../../../lib/auth'

export async function GET(request) {
  return NextResponse.json({ authenticated: isAdminRequest(request), username: isAdminRequest(request) ? process.env.ADMIN_USERNAME : null })
}
