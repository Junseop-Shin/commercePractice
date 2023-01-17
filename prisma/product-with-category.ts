import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const sneakersData: Prisma.productsCreateInput[] = Array.apply(
  null,
  Array(10)
).map((_, index) => ({
  name: `Sneakers ${index + 1}`,
  contents: `"This is a White Sneakers ${index + 1}"`,
  category_id: 1,
  image_url: `https://picsum.photos/id/${
    (index + 1) % 10 === 0 ? 10 : (index + 1) % 10
  }/250/150/`,
  price: Math.floor(Math.random() * (100000 - 20000) + 20000),
}));

const tShirtData: Prisma.productsCreateInput[] = Array.apply(
  null,
  Array(10)
).map((_, index) => ({
  name: `T-Shirts ${index + 1}`,
  contents: `"This is a Navy T-Shirt ${index + 1}"`,
  category_id: 2,
  image_url: `https://picsum.photos/id/${
    (index + 1) % 10 === 0 ? 10 : ((index + 1) % 10) + 10
  }/250/150/`,
  price: Math.floor(Math.random() * (100000 - 20000) + 20000),
}));

const pantsData: Prisma.productsCreateInput[] = Array.apply(
  null,
  Array(10)
).map((_, index) => ({
  name: `Pants ${index + 1}`,
  contents: `"This is a Dark Jeans ${index + 1}"`,
  category_id: 3,
  image_url: `https://picsum.photos/id/${
    (index + 1) % 10 === 0 ? 10 : ((index + 1) % 10) + 20
  }/250/150/`,
  price: Math.floor(Math.random() * (100000 - 20000) + 20000),
}));

const capData: Prisma.productsCreateInput[] = Array.apply(null, Array(10)).map(
  (_, index) => ({
    name: `Cap ${index + 1}`,
    contents: `"This is a MLB cap ${index + 1}"`,
    category_id: 4,
    image_url: `https://picsum.photos/id/${
      (index + 1) % 10 === 0 ? 10 : ((index + 1) % 10) + 30
    }/250/150/`,
    price: Math.floor(Math.random() * (100000 - 20000) + 20000),
  })
);

const hoodieData: Prisma.productsCreateInput[] = Array.apply(
  null,
  Array(10)
).map((_, index) => ({
  name: `Hoodie ${index + 1}`,
  contents: `"This is a Nike hoodie ${index + 1}"`,
  category_id: 5,
  image_url: `https://picsum.photos/id/${
    (index + 1) % 10 === 0 ? 10 : ((index + 1) % 10) + 40
  }/250/150/`,
  price: Math.floor(Math.random() * (100000 - 20000) + 20000),
}));

async function main() {
  const CATEGORIES = ['SNEAKERS', 'T-SHIRTS', 'PANTS', 'CAP', 'HOODIE'];
  CATEGORIES.forEach(async (c, i) => {
    const categories = await prisma.categories.upsert({
      where: {
        id: i + 1,
      },
      update: {
        name: c,
      },
      create: {
        name: c,
      },
    });
    console.log(`Upserted Category id: ${categories.id}`);
  });

  await prisma.products.deleteMany();

  const productData = [
    ...sneakersData,
    ...tShirtData,
    ...pantsData,
    ...capData,
    ...hoodieData,
  ];
  for (const p of productData) {
    const product = await prisma.products.create({
      data: p,
    });
    console.log(`Created id: ${product.id}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
