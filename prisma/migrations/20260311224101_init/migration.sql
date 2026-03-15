-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "search_hash" TEXT NOT NULL,
    "verification_hash" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "users_search_hash_key" ON "users"("search_hash");

-- CreateIndex
CREATE UNIQUE INDEX "users_verification_hash_key" ON "users"("verification_hash");
