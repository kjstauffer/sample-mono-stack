import prisma from '../prisma.js';

async function main() {
  await prisma.user.create({
    data: {
      name: `Boba Fett`,
      email: `bobafett@sample-mono-stack.dev`,
      posts: {
        create: { title: `As you wish` },
      },
      profile: {
        create: { bio: `Bounty Hunter` },
      },
      username: `bfett`,
      password: `password`,
    },
  });

  const user = await prisma.user.findFirstOrThrow({
    where: {
      email: `bobafett@sample-mono-stack.dev`,
    },
    include: {
      posts: true,
      profile: true,
    },
  });

  console.log(`User created successfully.`);
  console.dir(user, { depth: null });
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
