const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== ALL USERS ===');
  const users = await prisma.user.findMany({
    select: { id: true, email: true }
  });
  console.log(users);

  console.log('\n=== ALL BOTS ===');
  const bots = await prisma.bot.findMany({
    select: { 
      id: true, 
      telegramBotUsername: true, 
      userId: true,
      createdAt: true 
    },
    orderBy: { createdAt: 'desc' }
  });
  console.log(bots);

  console.log('\n=== BOTS BY USER ===');
  for (const user of users) {
    const userBots = await prisma.bot.findMany({
      where: { userId: user.id },
      select: { id: true, telegramBotUsername: true }
    });
    console.log(`${user.email}: ${userBots.length} bots`, userBots);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
