import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.admin.findUnique({ where: { email: 'admin@toletboardchennai.com' } });
  if (!admin) { console.log('NO ADMIN'); process.exit(1); }
  
  const testPass = 'ChangeThisPassword123!';
  const valid = await bcrypt.compare(testPass, admin.passwordHash);
  console.log('Admin password valid:', valid);
  
  // Also update password in case it was set differently
  if (!valid) {
    console.log('Resetting admin password...');
    const newHash = await bcrypt.hash(testPass, 10);
    await prisma.admin.update({ where: { id: admin.id }, data: { passwordHash: newHash } });
    console.log('Admin password reset to: ChangeThisPassword123!');
  }
  
  // Also ensure SiteSettings exists
  await prisma.siteSettings.upsert({
    where: { id: 'default' }, update: {}, create: { id: 'default' }
  });
  console.log('SiteSettings OK');

  await prisma.$disconnect();
}
main();
