/*
  Warnings:

  - You are about to drop the column `expires_at` on the `FcmToken` table. All the data in the column will be lost.
  - Added the required column `update_at` to the `FcmToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."FcmToken" DROP COLUMN "expires_at",
ADD COLUMN     "update_at" TIMESTAMP(3) NOT NULL;
