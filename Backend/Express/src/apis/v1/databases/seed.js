import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  // Seed dữ liệu cho bảng User
  const users = [];
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.name.fullName(),
      },
    });
    users.push(user);
  }

  // Seed dữ liệu cho bảng Profile
  for (const user of users) {
    await prisma.profile.create({
      data: {
        bio: faker.lorem.sentence(),
        userId: user.id,
      },
    });
  }

  // Seed dữ liệu cho bảng Post
  for (const user of users) {
    for (let i = 0; i < 5; i++) {
      await prisma.post.create({
        data: {
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraph(1),
          published: faker.datatype.boolean(),
          authorId: user.id,
        },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
