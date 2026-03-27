import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const profs = await prisma.professional.findMany({
    include: {
      user: true,
      category: true
    }
  });
  console.dir(profs, { depth: null });
}

main().catch(console.error).finally(() => prisma.$disconnect());
