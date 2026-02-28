-- CreateEnum
CREATE TYPE "ImageGenerationMode" AS ENUM ('SCENE', 'ENHANCE', 'COMPOSE');

-- CreateEnum
CREATE TYPE "GenerationStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandModelProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Ola',
    "referenceImages" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandModelProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedImage" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "mode" "ImageGenerationMode" NOT NULL,
    "modelUsed" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "thumbnailPath" TEXT,
    "dimensions" JSONB,
    "tags" TEXT[],
    "linkedProductId" TEXT,
    "linkedCollectionSlug" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImageGenerationSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mode" "ImageGenerationMode" NOT NULL,
    "prompt" TEXT NOT NULL,
    "referenceImages" JSONB NOT NULL DEFAULT '[]',
    "modelUsed" TEXT NOT NULL,
    "status" "GenerationStatus" NOT NULL DEFAULT 'PENDING',
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImageGenerationSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");

-- CreateIndex
CREATE INDEX "GeneratedImage_mode_idx" ON "GeneratedImage"("mode");

-- CreateIndex
CREATE INDEX "GeneratedImage_linkedProductId_idx" ON "GeneratedImage"("linkedProductId");

-- CreateIndex
CREATE INDEX "GeneratedImage_isFavorite_idx" ON "GeneratedImage"("isFavorite");

-- CreateIndex
CREATE INDEX "GeneratedImage_createdAt_idx" ON "GeneratedImage"("createdAt");

-- CreateIndex
CREATE INDEX "ImageGenerationSession_userId_idx" ON "ImageGenerationSession"("userId");

-- CreateIndex
CREATE INDEX "ImageGenerationSession_status_idx" ON "ImageGenerationSession"("status");

-- AddForeignKey
ALTER TABLE "GeneratedImage" ADD CONSTRAINT "GeneratedImage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ImageGenerationSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageGenerationSession" ADD CONSTRAINT "ImageGenerationSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
