-- AlterTable
ALTER TABLE "App" ALTER COLUMN "Properties" DROP NOT NULL;

-- CreateTable
CREATE TABLE "AppDwellTime" (
    "Id" INTEGER NOT NULL,
    "WindowsAppId" TEXT NOT NULL,
    "HourOfDay" INTEGER NOT NULL,
    "DayOfWeek" INTEGER NOT NULL,
    "HourStartTimeStamp" INTEGER NOT NULL,
    "DwellTime" INTEGER NOT NULL,

    CONSTRAINT "AppDwellTime_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "File" (
    "Id" INTEGER NOT NULL,
    "Path" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Extension" TEXT NOT NULL,
    "Kind" TEXT NOT NULL,
    "Type" TEXT NOT NULL,
    "Properties" TEXT NOT NULL,
    "ObjectId" TEXT NOT NULL,
    "VolumeId" TEXT NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "IdTable" (
    "NextId" INTEGER NOT NULL,

    CONSTRAINT "IdTable_pkey" PRIMARY KEY ("NextId")
);

-- CreateTable
CREATE TABLE "ScreenRegion" (
    "Id" INTEGER NOT NULL,
    "RegionKind" INTEGER NOT NULL,
    "OcrText" TEXT,
    "Bounds" TEXT NOT NULL,
    "windowCaptureId" INTEGER NOT NULL,

    CONSTRAINT "ScreenRegion_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "Id" INTEGER NOT NULL,
    "Title" TEXT NOT NULL,
    "Properties" TEXT,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Web" (
    "Id" INTEGER NOT NULL,
    "Domain" TEXT NOT NULL,
    "Uri" TEXT NOT NULL,
    "IconUri" TEXT,
    "Properties" TEXT,

    CONSTRAINT "Web_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "WebDomainDwellTime" (
    "Id" INTEGER NOT NULL,
    "Domain" TEXT NOT NULL,
    "HourOfDay" INTEGER NOT NULL,
    "DayOfWeek" INTEGER NOT NULL,
    "HourStartTimeStamp" INTEGER NOT NULL,
    "DwellTime" INTEGER NOT NULL,

    CONSTRAINT "WebDomainDwellTime_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "WindowCapture" (
    "Id" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    "ImageToken" TEXT,
    "IsForeground" INTEGER,
    "WindowId" INTEGER,
    "WindowBounds" TEXT,
    "WindowTitle" TEXT,
    "Properties" TEXT,
    "TimeStamp" INTEGER,
    "IsProcessed" INTEGER,
    "ActivationUri" TEXT,
    "ActivityId" INTEGER,
    "FallbackUri" TEXT,

    CONSTRAINT "WindowCapture_pkey" PRIMARY KEY ("Id")
);

-- AddForeignKey
ALTER TABLE "ScreenRegion" ADD CONSTRAINT "ScreenRegion_windowCaptureId_fkey" FOREIGN KEY ("windowCaptureId") REFERENCES "WindowCapture"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
