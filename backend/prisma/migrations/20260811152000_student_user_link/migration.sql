-- Link student records to login accounts so a connected STUDENT can be
-- scoped automatically to their class, subjects, timetable and own record.
ALTER TABLE "students" ADD COLUMN "userId" TEXT;

CREATE UNIQUE INDEX "students_userId_key" ON "students"("userId");
CREATE INDEX "students_userId_idx" ON "students"("userId");

ALTER TABLE "students"
ADD CONSTRAINT "students_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
