require('dotenv/config');
const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();
(async () => {
  try {
    const products = await prisma.product.findMany({
      take: 10,
      include: { images: true }
    });
    console.log(JSON.stringify(products, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
