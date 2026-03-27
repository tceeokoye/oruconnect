import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database...');

  // 1. Create Default Categories
  const categoriesUrl = [
    { name: 'Electrical', slug: 'electrical', description: 'All electrical repairs and installations' },
    { name: 'Plumbing', slug: 'plumbing', description: 'Pipes, leaks, and water systems' },
    { name: 'Cleaning', slug: 'cleaning', description: 'Home, office, and deep cleaning' },
    { name: 'Carpentry', slug: 'carpentry', description: 'Woodworking, furniture, and structural repairs' },
  ];

  for (const cat of categoriesUrl) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // 2. Create Default Super Admin
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@oruconnect.com' },
    update: {},
    create: {
      name: 'OruConnect Admin',
      email: 'admin@oruconnect.com',
      password: hashedAdminPassword,
      role: Role.SUPER_ADMIN,
    },
  });

  console.log('Database seeded successfully! 🌱');
  console.log(`Admin Login: ${admin.email} / admin123`);
  console.log(`Categories Created: ${categoriesUrl.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
