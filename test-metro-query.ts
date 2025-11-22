import prisma from './src/config/client';

async function checkMetroCards() {
  try {
    const metroCards = await prisma.metro_cards.findMany({
      take: 5,
    });

    console.log('Metro cards in DB:', metroCards.length);
    console.log('Sample data:', JSON.stringify(metroCards, null, 2));

    // Test with a specific user
    if (metroCards.length > 0) {
      const userId = metroCards[0].user_id;
      console.log(`\nTesting getUserMetroCards for user_id: ${userId}`);
      const userCards = await prisma.metro_cards.findMany({
        where: { user_id: userId },
      });
      console.log('User cards found:', userCards.length);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMetroCards();
