import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Check admins
    const admins = await prisma.admin.findMany({ select: { id: true, email: true, name: true } });
    console.log('ADMINS:', JSON.stringify(admins));

    // Seed admin if missing
    if (admins.length === 0) {
      console.log('No admin found — seeding...');
      const hash = await bcrypt.hash('ChangeThisPassword123!', 10);
      const admin = await prisma.admin.create({
        data: {
          name: 'Admin',
          email: 'admin@toletboardchennai.com',
          passwordHash: hash,
        },
      });
      console.log('Admin created:', admin.email);
    }

    // Check managers
    const managers = await prisma.manager.findMany({ select: { id: true, email: true, isActive: true } });
    console.log('MANAGERS:', JSON.stringify(managers));

    // User count
    const userCount = await prisma.user.count();
    console.log('USERS:', userCount);

    // SiteSettings
    const settings = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: {},
      create: { id: 'default' },
    });
    console.log('SITE_SETTINGS OK:', settings.id);

  } catch (e) {
    console.error('DB ERROR:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
