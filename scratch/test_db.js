import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRawUnsafe("SELECT name FROM sqlite_master WHERE type='table';");
  console.log("DB Tables:", tables);
}

main().catch(console.error).finally(() => prisma.$disconnect());
