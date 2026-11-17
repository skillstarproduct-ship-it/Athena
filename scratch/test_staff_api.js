import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function test() {
  const company = await p.company.findFirst();
  console.log('Testing with company:', company?.name, company?.companyCode);
  const staff = await p.user.findMany({
    where: { companyId: company?.id }
  });
  console.log('Staff count:', staff.length);
  staff.forEach(s => console.log(' - Staff:', s.name, s.role, s.email, s.employeeId));
}

test().catch(console.error).finally(() => p.$disconnect());
