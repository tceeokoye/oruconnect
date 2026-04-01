import { prisma } from './src/lib/prisma';

async function main() {
  const catCount = await prisma.category.count();
  const jobCount = await prisma.job.count();
  const profCount = await prisma.professional.count();
  
  console.log('Category Count:', catCount);
  console.log('Job Count:', jobCount);
  console.log('Professional Count:', profCount);

  const categories = await prisma.category.findMany();
  console.log('Categories:', categories);
}

main().finally(() => prisma.$disconnect());
