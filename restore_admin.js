const { PrismaClient } = require('@prisma/client');
const { hash } = require('@node-rs/argon2');
const prisma = new PrismaClient();

const ARGON2_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
  outputLen: 32,
};

async function main() {
  const adminEmail = 'admin@drs.com';
  const newPhone = '01277009687';
  
  const passwordHash = await hash('admin123456', ARGON2_OPTIONS);
  
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      phone: newPhone,
      phoneVerified: false,
      isAdmin: true,
      isSuperAdmin: true,
      passwordHash
    },
    create: {
      email: adminEmail,
      phone: newPhone,
      phoneVerified: false,
      passwordHash,
      fullName: 'Platform Admin',
      isAdmin: true,
      isSuperAdmin: true
    }
  });
  
  console.log('Restored admin@drs.com with phone:', newPhone);
}

main().catch(console.error).finally(() => prisma.$disconnect());
