import { z } from 'zod'
import { ACTIVITY_TYPES, EVENT_STATUSES, TRANSACTION_KINDS } from './constants'

const text = (label, min, max) => z.string({ error: `${label} is invalid.` }).trim()
  .min(min, `${label} is too short.`).max(max, `${label} is too long.`)

const date = label => z.coerce.date({ error: `${label} is invalid.` })

export const eventInput = z.object({
  title: text('Title', 3, 160),
  person: text('Name', 2, 120),
  email: z.union([z.literal(''), z.string().trim().email('Email is invalid.').max(200)]).nullish()
    .transform(value => value || null),
  activity_type: z.enum(ACTIVITY_TYPES, { error: 'Activity type is invalid.' }),
  start_at: date('Start time'),
  end_at: date('End time'),
}).refine(v => v.end_at > v.start_at, { message: 'End time must be after the start time.', path: ['end_at'] })

export const eventStatusInput = z.object({
  status: z.enum(EVENT_STATUSES.filter(s => s !== 'pending'), { error: 'Status is invalid.' }),
  reject_reason: z.string().trim().max(300, 'Reason is too long.').nullish().transform(value => value || null),
})

export const transactionInput = z.object({
  name: text('Title', 2, 160),
  description: z.string().trim().max(500, 'Description is too long.').nullish().transform(value => value || null),
  amount: z.number({ error: 'Amount is invalid.' }).int('Amount must be a whole number.')
    .positive('Amount must be greater than 0.').max(Number.MAX_SAFE_INTEGER, 'Amount is too large.'),
  kind: z.enum(TRANSACTION_KINDS, { error: 'Type is invalid.' }),
  occurred_on: z.string({ error: 'Date is invalid.' }).regex(/^\d{4}-\d{2}-\d{2}$/, 'Date is invalid.')
    .transform(value => new Date(`${value}T00:00:00.000Z`))
    .refine(value => !Number.isNaN(+value), 'Date is invalid.'),
})

export const loginInput = z.object({ username: z.string().max(200), password: z.string().max(500) })

export const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/
