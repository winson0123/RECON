-- CreateTable
CREATE TABLE "RecallIndex" (
    "indexId" SERIAL NOT NULL,
    "indexName" TEXT NOT NULL,

    CONSTRAINT "RecallIndex_pkey" PRIMARY KEY ("indexId")
);

-- CreateTable
CREATE TABLE "Capture" (
    "captureId" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "imageToken" TEXT NOT NULL,
    "appName" TEXT NOT NULL,
    "windowTitle" TEXT NOT NULL,
    "strings" TEXT,
    "windowsAppId" TEXT NOT NULL,
    "fallbackUri" TEXT,
    "path" TEXT NOT NULL,
    "indexId" INTEGER NOT NULL,

    CONSTRAINT "Capture_pkey" PRIMARY KEY ("captureId")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecallIndex_indexName_key" ON "RecallIndex"("indexName");

-- AddForeignKey
ALTER TABLE "Capture" ADD CONSTRAINT "Capture_indexId_fkey" FOREIGN KEY ("indexId") REFERENCES "RecallIndex"("indexId") ON DELETE CASCADE ON UPDATE CASCADE;
