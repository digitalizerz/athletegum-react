-- AlterTable
ALTER TABLE "Deal" ADD COLUMN "paidAt" DATETIME;
ALTER TABLE "Deal" ADD COLUMN "stripeCheckoutSessionId" TEXT;
ALTER TABLE "Deal" ADD COLUMN "stripePaymentIntentId" TEXT;
