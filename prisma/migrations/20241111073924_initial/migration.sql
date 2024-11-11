-- CreateTable
CREATE TABLE "App" (
    "Id" INTEGER NOT NULL,
    "WindowsAppId" TEXT NOT NULL,
    "IconUri" TEXT,
    "Name" TEXT NOT NULL,
    "Path" TEXT NOT NULL,
    "Properties" TEXT NOT NULL,

    CONSTRAINT "App_pkey" PRIMARY KEY ("Id")
);
