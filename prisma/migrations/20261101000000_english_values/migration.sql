-- Store activity types and transaction kinds as English values.
ALTER TABLE "events" DROP CONSTRAINT "events_activity_type_check";
UPDATE "events" SET "activity_type" = CASE "activity_type" WHEN 'Báo cáo' THEN 'Report' ELSE 'Work' END;
ALTER TABLE "events" ADD CONSTRAINT "events_activity_type_check" CHECK ("activity_type" IN ('Report', 'Work'));

ALTER TABLE "transactions" DROP CONSTRAINT "transactions_kind_check";
UPDATE "transactions" SET "kind" = CASE "kind" WHEN 'Thu' THEN 'Income' ELSE 'Expense' END;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_kind_check" CHECK ("kind" IN ('Income', 'Expense'));
