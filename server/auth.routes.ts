import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-for-teams';

// ==========================================
// 1. VENDOR SUBSCRIPTION & TENANT PROVISIONING
// ==========================================
router.post('/subscribe-tenant', async (req, res) => {
  try {
    const {
      companyName,
      companyCode,
      ownerName,
      ownerEmail,
      ownerPhone,
      password,
      selectedModules,
      durationMonths = 1,
      amountPaid = 0,
      planType = 'CUSTOM'
    } = req.body;

    if (!companyName || !ownerEmail || !password) {
      return res.status(400).json({ error: 'Company Name, Owner Email and Password are required.' });
    }

    const cleanCode = (companyCode || companyName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)).toUpperCase();

    // Check if company code or email is already taken
    const existingCompany = await prisma.company.findFirst({
      where: {
        OR: [
          { companyCode: cleanCode },
          { ownerEmail: ownerEmail.toLowerCase() }
        ]
      }
    });

    if (existingCompany) {
      return res.status(400).json({ 
        error: existingCompany.companyCode === cleanCode 
          ? `Company Code "${cleanCode}" is already in use. Please pick another code.` 
          : `Email "${ownerEmail}" is already registered as a company owner.` 
      });
    }

    // Default modules if none specified
    const modules = Array.isArray(selectedModules) && selectedModules.length > 0 
      ? selectedModules 
      : ['crm', 'pos', 'hem', 'erp', 'ai-whatsapp'];

    const duration = Number(durationMonths) || 1;
    const validUntil = new Date(Date.now() + duration * 30 * 24 * 60 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Tenant in Database
    const company = await prisma.company.create({
      data: {
        companyCode: cleanCode,
        name: companyName,
        ownerName: ownerName || companyName,
        ownerEmail: ownerEmail.toLowerCase(),
        ownerPhone: ownerPhone || '',
        status: 'ACTIVE',
        planType: planType,
        activeModules: JSON.stringify(modules),
        durationMonths: duration,
        validUntil: validUntil,
        maxUsersAllowed: 15,
        amountPaid: Number(amountPaid) || 0
      }
    });

    // Create Primary Owner Account
    const ownerUser = await prisma.user.create({
      data: {
        companyId: company.id,
        employeeId: 'OWNER-01',
        username: cleanCode + '_admin',
        email: ownerEmail.toLowerCase(),
        password: hashedPassword,
        name: ownerName || companyName,
        role: 'CompanyAdmin',
        department: 'Executive',
        status: 'APPROVED'
      }
    });

    const token = jwt.sign(
      { 
        userId: ownerUser.id, 
        companyId: company.id, 
        companyCode: company.companyCode,
        role: ownerUser.role,
        activeModules: modules 
      }, 
      JWT_SECRET, 
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Company workspace successfully provisioned!',
      token,
      company: {
        id: company.id,
        companyCode: company.companyCode,
        name: company.name,
        activeModules: modules,
        validUntil: company.validUntil,
        planType: company.planType
      },
      user: {
        id: ownerUser.id,
        name: ownerUser.name,
        email: ownerUser.email,
        role: ownerUser.role,
        companyCode: company.companyCode
      }
    });

  } catch (error: any) {
    console.error('Subscription error:', error);
    return res.status(500).json({ error: error.message || 'Failed to provision company workspace.' });
  }
});

// ==========================================
// 2. UNIFIED MULTI-TENANT LOGIN (OWNER & STAFF)
// ==========================================
router.post('/staff-login', async (req, res) => {
  try {
    const { companyCode, identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username/Email and Password are required.' });
    }

    let company: any = null;
    let user: any = null;

    if (companyCode) {
      // Find company by company code
      company = await prisma.company.findUnique({
        where: { companyCode: companyCode.toUpperCase().trim() }
      });

      if (!company) {
        return res.status(404).json({ error: `Company with code "${companyCode}" not found.` });
      }

      if (company.status !== 'ACTIVE') {
        return res.status(403).json({ error: 'This company workspace is suspended or expired.' });
      }

      // Find user inside this company
      user = await prisma.user.findFirst({
        where: {
          companyId: company.id,
          OR: [
            { email: identifier.toLowerCase().trim() },
            { username: identifier.trim() },
            { employeeId: identifier.trim() }
          ]
        }
      });
    } else {
      // Direct login without company code (e.g. Global Admin or direct email lookup)
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: identifier.toLowerCase().trim() },
            { username: identifier.trim() }
          ]
        },
        include: { company: true }
      });

      if (user && user.company) {
        company = user.company;
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials for this workspace.' });
    }

    // Password validation (supports bcrypt or fallback plain match)
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch (e) {
      isPasswordValid = false;
    }
    if (!isPasswordValid && user.password === password) {
      isPasswordValid = true;
    }

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password. Please check and try again.' });
    }

    const activeModules = company && company.activeModules 
      ? JSON.parse(company.activeModules) 
      : ['crm', 'pos', 'hem', 'erp', 'ai-whatsapp'];

    const token = jwt.sign(
      {
        userId: user.id,
        companyId: company ? company.id : null,
        companyCode: company ? company.companyCode : null,
        role: user.role,
        activeModules
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        employeeId: user.employeeId,
        role: user.role,
        department: user.department,
        companyId: user.companyId
      },
      company: company ? {
        id: company.id,
        companyCode: company.companyCode,
        name: company.name,
        activeModules,
        validUntil: company.validUntil,
        planType: company.planType
      } : null
    });

  } catch (error: any) {
    console.error('Staff login error:', error);
    return res.status(500).json({ error: error.message || 'Login failed.' });
  }
});

// ==========================================
// 3. STAFF & EMPLOYEE MANAGEMENT (BY OWNER)
// ==========================================
router.get('/company-staff', async (req, res) => {
  try {
    const { companyCode, companyId, userEmail, userId } = req.query;

    let targetCompanyId = companyId as string;

    if (!targetCompanyId && companyCode) {
      const comp = await prisma.company.findUnique({
        where: { companyCode: (companyCode as string).toUpperCase() }
      });
      if (comp) targetCompanyId = comp.id;
    }

    if (!targetCompanyId && (userEmail || userId)) {
      const u = await prisma.user.findFirst({
        where: {
          OR: [
            userId ? { id: userId as string } : {},
            userEmail ? { email: (userEmail as string).toLowerCase().trim() } : {}
          ]
        }
      });
      if (u?.companyId) {
        targetCompanyId = u.companyId;
      }
    }

    if (!targetCompanyId) {
      return res.status(400).json({ error: 'Company identifier required.' });
    }

    const staff = await prisma.user.findMany({
      where: { companyId: targetCompanyId },
      select: {
        id: true,
        employeeId: true,
        name: true,
        username: true,
        email: true,
        role: true,
        department: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const company = await prisma.company.findUnique({
      where: { id: targetCompanyId },
      select: { id: true, maxUsersAllowed: true, activeModules: true, name: true, companyCode: true }
    });

    let activeModules: string[] = ['crm', 'pos'];
    if (company?.activeModules) {
      try {
        activeModules = typeof company.activeModules === 'string' ? JSON.parse(company.activeModules) : company.activeModules;
      } catch (e) {
        activeModules = ['crm', 'pos'];
      }
    }

    return res.json({ 
      staff, 
      company: company ? {
        id: company.id,
        name: company.name,
        companyCode: company.companyCode,
        maxUsersAllowed: company.maxUsersAllowed || 15,
        activeModules
      } : null 
    });
  } catch (error: any) {
    console.error('Fetch staff error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch staff.' });
  }
});

router.post('/add-staff', async (req, res) => {
  try {
    const { companyCode, companyId, name, username, email, password, role, department, employeeId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, Email, Password, and Role are required.' });
    }

    let targetCompany: any = null;
    if (companyId) {
      targetCompany = await prisma.company.findUnique({ where: { id: companyId } });
    } else if (companyCode) {
      targetCompany = await prisma.company.findUnique({ where: { companyCode: companyCode.toUpperCase() } });
    }

    if (!targetCompany) {
      return res.status(404).json({ error: 'Company not found.' });
    }

    // Check staff count
    const staffCount = await prisma.user.count({ where: { companyId: targetCompany.id } });
    if (staffCount >= targetCompany.maxUsersAllowed) {
      return res.status(403).json({ 
        error: `Staff user limit reached (${targetCompany.maxUsersAllowed} max). Please upgrade your subscription to add more staff.` 
      });
    }

    // Check uniqueness
    const existing = await prisma.user.findFirst({
      where: {
        companyId: targetCompany.id,
        OR: [
          { email: email.toLowerCase().trim() },
          { username: username ? username.trim() : email.toLowerCase().trim() }
        ]
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'A staff member with this email or username already exists in your company.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newStaff = await prisma.user.create({
      data: {
        companyId: targetCompany.id,
        employeeId: employeeId || `EMP-${staffCount + 1}`,
        name,
        username: username || email.split('@')[0],
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role, // e.g. "Cashier", "Sales", "HR", "Employee", "Manager"
        department: department || 'General',
        status: 'APPROVED'
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Staff member created successfully!',
      staff: {
        id: newStaff.id,
        employeeId: newStaff.employeeId,
        name: newStaff.name,
        username: newStaff.username,
        email: newStaff.email,
        role: newStaff.role,
        department: newStaff.department
      }
    });

  } catch (error: any) {
    console.error('Add staff error:', error);
    return res.status(500).json({ error: error.message || 'Failed to add staff member.' });
  }
});

router.delete('/delete-staff/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    return res.json({ success: true, message: 'Staff member deleted.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to delete staff member.' });
  }
});

// ==========================================
// 4. SUPER ADMIN (VENDOR PLATFORM COMMAND CENTER)
// ==========================================
router.get('/superadmin/tenants', async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true, employeeId: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalTenants = companies.length;
    const activeTenants = companies.filter(c => c.status === 'ACTIVE').length;
    const totalRevenue = companies.reduce((sum, c) => sum + (c.amountPaid || 0), 0);
    const totalStaff = companies.reduce((sum, c) => sum + (c.users?.length || 0), 0);

    const formatted = companies.map(c => {
      let modules = [];
      try {
        modules = JSON.parse(c.activeModules || '[]');
      } catch (e) {
        modules = ['crm'];
      }
      return {
        id: c.id,
        companyCode: c.companyCode,
        name: c.name,
        ownerName: c.ownerName,
        ownerEmail: c.ownerEmail,
        ownerPhone: c.ownerPhone,
        status: c.status,
        planType: c.planType,
        activeModules: modules,
        durationMonths: c.durationMonths,
        validUntil: c.validUntil,
        amountPaid: c.amountPaid,
        maxUsersAllowed: c.maxUsersAllowed,
        staffCount: c.users.length,
        users: c.users,
        createdAt: c.createdAt
      };
    });

    return res.json({
      success: true,
      stats: {
        totalTenants,
        activeTenants,
        totalRevenue,
        totalStaff
      },
      tenants: formatted
    });
  } catch (error: any) {
    console.error('Superadmin tenants fetch error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch platform tenants.' });
  }
});

router.post('/superadmin/toggle-status', async (req, res) => {
  try {
    const { companyId, status } = req.body;
    if (!companyId || !status) return res.status(400).json({ error: 'Company ID and status required.' });

    const updated = await prisma.company.update({
      where: { id: companyId },
      data: { status }
    });

    return res.json({ success: true, message: `Company status updated to ${status}.`, company: updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update status.' });
  }
});

router.post('/superadmin/extend-license', async (req, res) => {
  try {
    const { companyId, additionalMonths = 12 } = req.body;
    if (!companyId) return res.status(400).json({ error: 'Company ID required.' });

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) return res.status(404).json({ error: 'Company not found.' });

    const currentExpiry = new Date(company.validUntil) > new Date() ? new Date(company.validUntil) : new Date();
    const newExpiry = new Date(currentExpiry.getTime() + Number(additionalMonths) * 30 * 24 * 60 * 60 * 1000);

    const updated = await prisma.company.update({
      where: { id: companyId },
      data: {
        validUntil: newExpiry,
        status: 'ACTIVE'
      }
    });

    return res.json({ success: true, message: `License extended by ${additionalMonths} months.`, company: updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to extend license.' });
  }
});

router.delete('/superadmin/delete-tenant/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Delete all users belonging to this tenant first
    await prisma.user.deleteMany({ where: { companyId: id } });
    await prisma.company.delete({ where: { id } });
    return res.json({ success: true, message: 'Tenant company and all its users permanently deleted.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to delete tenant.' });
  }
});

export default router;
