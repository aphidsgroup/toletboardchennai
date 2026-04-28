import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Check existing managers
  const existing = await prisma.manager.findUnique({ where: { email: 'manager@toletboardchennai.com' } });

  if (existing) {
    console.log('Manager already exists:', existing.email, '| Active:', existing.isActive);
    // Ensure active
    if (!existing.isActive) {
      await prisma.manager.update({ where: { id: existing.id }, data: { isActive: true } });
      console.log('Reactivated manager.');
    }
  } else {
    const hash = await bcrypt.hash('Manager@1234', 10);
    const manager = await prisma.manager.create({
      data: {
        name: 'Property Manager',
        email: 'manager@toletboardchennai.com',
        passwordHash: hash,
        isActive: true,
        permissions: JSON.stringify({
          viewLeads: true,
          viewUsers: true,
          viewProperties: true,
          addProperties: true,
          editProperties: true,
        }),
      },
    });
    console.log('✅ Manager created:', manager.email);
    console.log('   Password: Manager@1234');
  }

  // List all managers
  const all = await prisma.manager.findMany({ select: { email: true, name: true, isActive: true } });
  console.log('All managers:', JSON.stringify(all, null, 2));

  await prisma.$disconnect();
}
main();
