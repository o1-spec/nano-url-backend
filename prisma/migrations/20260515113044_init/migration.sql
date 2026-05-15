-- CreateTable
CREATE TABLE "urls" (
    "id" BIGSERIAL NOT NULL,
    "long_url" TEXT NOT NULL,
    "short_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "urls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics" (
    "id" BIGSERIAL NOT NULL,
    "short_code" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "referrer" TEXT,
    "clicked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "urls_long_url_key" ON "urls"("long_url");

-- CreateIndex
CREATE UNIQUE INDEX "urls_short_code_key" ON "urls"("short_code");

-- CreateIndex
CREATE INDEX "analytics_short_code_idx" ON "analytics"("short_code");

-- AddForeignKey
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_short_code_fkey" FOREIGN KEY ("short_code") REFERENCES "urls"("short_code") ON DELETE CASCADE ON UPDATE CASCADE;
