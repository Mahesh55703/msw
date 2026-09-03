import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@labouraxis.com';
  const admin = await prisma.user.findUnique({ where: { email } });
  
  if (admin) {
    await prisma.user.update({
      where: { email },
      data: { role: 'SUPER_ADMIN' }
    });
    console.log(`Successfully updated ${email} to SUPER_ADMIN`);
  } else {
    console.log(`User ${email} not found.`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
