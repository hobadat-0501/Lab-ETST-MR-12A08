import { z } from 'zod'

const text = (label, min, max) => z.string({ error: `${label} không hợp lệ.` }).trim()
  .min(min, `${label} quá ngắn.`).max(max, `${label} quá dài.`)
const date = label => z.coerce.date({ error: `${label} không hợp lệ.` })

export const ACTIVITY_TYPES = ['Báo cáo', 'Làm việc']
export const TRANSACTION_KINDS = ['Thu', 'Chi']
export const EVENT_STATUSES = ['pending', 'confirmed', 'rejected']

const eventFields = {
  title: text('Tên hoạt động', 3, 160),
  person: text('Người đăng ký', 2, 120),
  room: text('Phòng', 2, 80),
  email: z.union([z.literal(''), z.string().trim().email('Email không hợp lệ.').max(200)]).nullish()
    .transform(value => value || null),
  activity_type: z.enum(ACTIVITY_TYPES, { error: 'Loại hoạt động không hợp lệ.' }),
  start_at: date('Giờ bắt đầu'),
  end_at: date('Giờ kết thúc'),
}

const endsAfterStart = { message: 'Giờ kết thúc phải sau giờ bắt đầu.', path: ['end_at'] }

export const eventInput = z.object(eventFields).refine(v => v.end_at > v.start_at, endsAfterStart)

export const eventStatusInput = z.object({
  status: z.enum(['confirmed', 'rejected'], { error: 'Trạng thái không hợp lệ.' }),
  reject_reason: z.string().trim().max(300, 'Lý do quá dài.').nullish().transform(value => value || null),
})

export const transactionInput = z.object({
  name: text('Nội dung', 2, 160),
  description: z.string().trim().max(500, 'Mô tả quá dài.').nullish().transform(value => value || null),
  amount: z.number({ error: 'Số tiền không hợp lệ.' }).int('Số tiền phải là số nguyên.')
    .positive('Số tiền phải lớn hơn 0.').max(Number.MAX_SAFE_INTEGER, 'Số tiền quá lớn.'),
  kind: z.enum(TRANSACTION_KINDS, { error: 'Loại giao dịch không hợp lệ.' }),
  occurred_on: z.string({ error: 'Ngày không hợp lệ.' }).regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ.')
    .transform(value => new Date(`${value}T00:00:00.000Z`))
    .refine(value => !Number.isNaN(+value), 'Ngày không hợp lệ.'),
})

export const loginInput = z.object({ username: z.string().max(200), password: z.string().max(500) })

export const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/
