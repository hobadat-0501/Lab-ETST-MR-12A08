import { NextResponse } from 'next/server'
import { isAdminRequest } from './auth'
import { SERVICE_ERROR } from './prisma'

export class ApiError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.status = status
  }
}

export const ok = (data, status = 200) => NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } })

export function assertAdmin(request) {
  if (!isAdminRequest(request)) throw new ApiError('Please sign in to the dashboard.', 401)
}

export async function readJson(request) {
  try { return await request.json() } catch { throw new ApiError('The submitted data is invalid.', 400) }
}

export function parse(schema, data) {
  const result = schema.safeParse(data)
  if (!result.success) throw new ApiError(result.error.issues[0]?.message || 'The submitted data is invalid.', 400)
  return result.data
}

// Wraps a handler: ApiError keeps its status, Prisma "not found" becomes 404, anything else is a 503.
export const route = handler => async (request, context) => {
  try {
    return await handler(request, context)
  } catch (error) {
    if (error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status })
    if (error?.code === 'P2025') return NextResponse.json({ error: 'Record not found.' }, { status: 404 })
    console.error(error)
    return NextResponse.json({ error: SERVICE_ERROR }, { status: 503 })
  }
}
