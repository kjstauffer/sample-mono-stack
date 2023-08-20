import prisma from '../prisma.js';

async function main() {
  const post = await prisma.post.update({
    where: { id: 1 },
    data: { published: true },
  });

  console.log(post);

  const allUsers = await prisma.user.findMany({
    include: {
      posts: true,
      profile: true,
    },
  });

  console.dir(allUsers, { depth: null });
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
