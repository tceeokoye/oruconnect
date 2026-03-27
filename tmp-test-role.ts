import { verifyRole } from './src/lib/auth-middleware';
import { prisma } from './src/lib/prisma';

async function test() {
  const users = await prisma.user.findMany({ take: 1 });
  if (users.length === 0) return console.log("No users in db");
  const user = users[0];
  console.log("Testing with user:", user.email, "role:", user.role);

  const res = await verifyRole(user.id, [
    "USER", "PROFESSIONAL", "SUPER_ADMIN", "OPERATIONS_ADMIN", "CATEGORY_ADMIN", "CONTENT_ADMIN", "SUPPORT_ADMIN"
  ]);

  console.log("verifyRole result:", res);
}

test().catch(console.error).finally(() => prisma.$disconnect());
