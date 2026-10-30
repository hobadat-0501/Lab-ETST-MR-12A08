import { equalText } from '../../../../lib/auth'
import { purgeOldEvents } from '../../../../lib/events'
import { ApiError, ok, route } from '../../../../lib/http'

// Called daily by Vercel Cron (see vercel.json). Vercel sends `Authorization: Bearer $CRON_SECRET`.
export const GET = route(async request => {
  const secret = process.env.CRON_SECRET
  if (!secret || !equalText(request.headers.get('authorization'), `Bearer ${secret}`)) throw new ApiError('Unauthorized.', 401)
  return ok({ deleted: await purgeOldEvents() })
})
