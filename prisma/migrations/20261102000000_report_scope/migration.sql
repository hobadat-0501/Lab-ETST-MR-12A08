-- Reports are presented either by an individual or by a group (name or leader in "person").
ALTER TABLE "events" ADD COLUMN "report_scope" TEXT;
UPDATE "events" SET "report_scope" = 'Individual' WHERE "activity_type" = 'Report';
ALTER TABLE "events" ADD CONSTRAINT "events_report_scope_check" CHECK ("report_scope" IN ('Individual', 'Group'));
