const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const result = await p.$queryRaw`SELECT sql FROM sqlite_master WHERE type='table' AND name='audit_logs'`;
  console.log(JSON.stringify(result, null, 2));
  await p.$disconnect();
  process.exit(0);
})();
