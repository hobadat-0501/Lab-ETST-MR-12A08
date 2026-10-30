-- AlterTable
ALTER TABLE "events" ADD COLUMN "reject_reason" TEXT;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "transactions_occurred_on_idx" ON "transactions"("occurred_on");
