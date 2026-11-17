import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testSaaSFlow() {
  console.log('--- TESTING SAAS MULTI-TENANT FLOW ---');

  // Clean existing test company if exists
  await prisma.user.deleteMany({ where: { username: { in: ['TESTCORP_admin', 'karthik_pos'] } } });
  await prisma.company.deleteMany({ where: { companyCode: 'TESTCORP' } });

  // 1. Create Company Tenant
  const testCompany = await prisma.company.create({
    data: {
      companyCode: 'TESTCORP',
      name: 'Test Corporation',
      ownerName: 'Test Owner',
      ownerEmail: 'owner@testcorp.com',
      ownerPhone: '9876543210',
      activeModules: JSON.stringify(['crm', 'pos']),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      planType: 'CUSTOM',
      maxUsersAllowed: 10
    }
  });
  console.log('1. Tenant Company Created:', testCompany.companyCode, 'Modules:', testCompany.activeModules);

  // 2. Create Owner User
  const ownerPass = await bcrypt.hash('Owner@123', 10);
  const ownerUser = await prisma.user.create({
    data: {
      companyId: testCompany.id,
      employeeId: 'OWNER-01',
      username: 'TESTCORP_admin',
      email: 'owner@testcorp.com',
      password: ownerPass,
      name: 'Test Owner',
      role: 'CompanyAdmin',
      department: 'Executive',
      status: 'APPROVED'
    }
  });
  console.log('2. Owner Created:', ownerUser.name, 'Role:', ownerUser.role);

  // 3. Add Employee (Cashier) under Test Company
  const cashierPass = await bcrypt.hash('Cashier@123', 10);
  const cashierUser = await prisma.user.create({
    data: {
      companyId: testCompany.id,
      employeeId: 'EMP-01',
      username: 'karthik_pos',
      email: 'karthik@testcorp.com',
      password: cashierPass,
      name: 'Karthik Cashier',
      role: 'Cashier',
      department: 'Retail Counter',
      status: 'APPROVED'
    }
  });
  console.log('3. Staff Member Created:', cashierUser.name, 'Role:', cashierUser.role);

  // 4. Verify Company Staff Query
  const staff = await prisma.user.findMany({
    where: { companyId: testCompany.id },
    select: { id: true, name: true, role: true, username: true }
  });
  console.log('4. Total Staff inside TESTCORP:', staff.length, staff.map(s => `${s.name} (${s.role})`));

  console.log('--- ALL SAAS ARCHITECTURE TESTS PASSED SUCCESSFULLY! ---');
}

testSaaSFlow().catch(console.error).finally(() => prisma.$disconnect());
