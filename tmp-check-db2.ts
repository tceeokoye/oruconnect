import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const profs = await prisma.professional.findMany({
    include: {
      user: true,
      category: true
    }
  });
  
  const cleanProfs = profs.map(p => ({
    id: p.id,
    businessName: p.name,
    ownerName: p.user.name,
    category: p.category?.name,
    state: p.state,
    nin: p.nin,
    isVerified: p.isVerified,
    createdAt: p.user.createdAt
  }));
  
  console.log(JSON.stringify(cleanProfs, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
