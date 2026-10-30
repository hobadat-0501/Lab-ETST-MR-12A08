CREATE TABLE "events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "person" TEXT NOT NULL,
  "email" TEXT,
  "activity_type" TEXT NOT NULL,
  "room" TEXT NOT NULL,
  "start_at" TIMESTAMPTZ(6) NOT NULL,
  "end_at" TIMESTAMPTZ(6) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "events_title_length_check" CHECK (char_length("title") BETWEEN 3 AND 160),
  CONSTRAINT "events_activity_type_check" CHECK ("activity_type" IN ('Báo cáo', 'Làm việc')),
  CONSTRAINT "events_end_after_start_check" CHECK ("end_at" > "start_at"),
  CONSTRAINT "events_status_check" CHECK ("status" IN ('pending', 'confirmed', 'rejected'))
);

CREATE INDEX "events_start_at_idx" ON "events"("start_at");
CREATE INDEX "events_room_time_idx" ON "events"("room", "start_at", "end_at");

CREATE TABLE "transactions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "amount" BIGINT NOT NULL,
  "kind" TEXT NOT NULL,
  "occurred_on" DATE NOT NULL DEFAULT CURRENT_DATE,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "transactions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "transactions_amount_positive_check" CHECK ("amount" > 0),
  CONSTRAINT "transactions_kind_check" CHECK ("kind" IN ('Thu', 'Chi'))
);

ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "events" FROM anon, authenticated;
REVOKE ALL ON TABLE "transactions" FROM anon, authenticated;
