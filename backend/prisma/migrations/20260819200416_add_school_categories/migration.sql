/*
  Warnings:

  - You are about to drop the `contracts` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "SchoolType" AS ENUM ('PRIMARY', 'COLLEGE', 'LYCEE', 'UNIVERSITE');

-- DropForeignKey
ALTER TABLE "contracts" DROP CONSTRAINT "contracts_employeeId_fkey";

-- DropTable
DROP TABLE "contracts";

-- DropEnum
DROP TYPE "ContractStatus";

-- DropEnum
DROP TYPE "ContractType";

-- CreateTable
CREATE TABLE "school_types" (
    "id" TEXT NOT NULL,
    "code" "SchoolType" NOT NULL,
    "label" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "school_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_school_types" (
    "schoolId" TEXT NOT NULL,
    "schoolTypeId" TEXT NOT NULL,

    CONSTRAINT "school_school_types_pkey" PRIMARY KEY ("schoolId","schoolTypeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "school_types_code_key" ON "school_types"("code");

-- CreateIndex
CREATE INDEX "school_school_types_schoolTypeId_idx" ON "school_school_types"("schoolTypeId");

-- AddForeignKey
ALTER TABLE "school_school_types" ADD CONSTRAINT "school_school_types_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_school_types" ADD CONSTRAINT "school_school_types_schoolTypeId_fkey" FOREIGN KEY ("schoolTypeId") REFERENCES "school_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
