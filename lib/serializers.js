export const toApiEvent = (event, { admin = false } = {}) => ({
  id: event.id, title: event.title, person: event.person,
  ...(admin ? { email: event.email, reject_reason: event.rejectReason } : {}),
  activity_type: event.activityType, report_scope: event.reportScope, room: event.room,
  start_at: event.startAt.toISOString(), end_at: event.endAt.toISOString(),
  status: event.status, created_at: event.createdAt.toISOString(),
})

export const toApiTransaction = t => ({
  id: t.id, name: t.name, description: t.description,
  amount: Number(t.amount), kind: t.kind,
  occurred_on: t.occurredOn.toISOString().slice(0, 10),
  created_at: t.createdAt.toISOString(),
})

export const toTransactionData = ({ name, description, amount, kind, occurred_on }) =>
  ({ name, description, amount: BigInt(amount), kind, occurredOn: occurred_on })
