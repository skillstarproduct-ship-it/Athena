import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function run() {
  const companies = await p.company.findMany();
  console.log('COMPANIES_COUNT:', companies.length);
  companies.forEach(c => {
    console.log(`- Company: "${c.name}" | Code: [${c.companyCode}] | Owner: ${c.ownerEmail} | Modules: ${c.activeModules}`);
  });
  const users = await p.user.findMany({
    select: { id: true, name: true, email: true, role: true, companyId: true, employeeId: true }
  });
  console.log('USERS_COUNT:', users.length);
  users.forEach(u => {
    console.log(`- User: "${u.name}" | Email: ${u.email} | Role: ${u.role} | CompanyId: ${u.companyId} | EmpID: ${u.employeeId}`);
  });
}

run().catch(console.error).finally(() => p.$disconnect());
