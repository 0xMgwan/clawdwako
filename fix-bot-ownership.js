const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Get your user ID
  const user = await prisma.user.findUnique({
    where: { email: 'davidmachuche@gmail.com' }
  });
  
  if (!user) {
    console.log('❌ User not found');
    return;
  }
  
  console.log('✅ Found user:', user.email, 'ID:', user.id);
  
  // Transfer all bots from anonymous user to your user
  const result = await prisma.bot.updateMany({
    where: {
      userId: 'cmlo1s11p00003pk6r60ikxsn' // anonymous user ID
    },
    data: {
      userId: user.id
    }
  });
  
  console.log(`✅ Transferred ${result.count} bots to your account`);
  
  // Verify the transfer
  const yourBots = await prisma.bot.findMany({
    where: { userId: user.id },
    select: { id: true, telegramBotUsername: true }
  });
  
  console.log('Your bots now:', yourBots);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
