import cron from 'node-cron';
import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';

export function startBookingCleanupJob() {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    try {
      await cancelExpiredBookings();
    } catch (error) {
      console.error('Booking cleanup job failed:', error);
    }
  });
}

async function cancelExpiredBookings() {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  try {
    const expiredBookings = await prisma.apartment_booking.updateMany({
      where: {
        booking_status: 'pending',
        created_at: {
          lte: threeDaysAgo,
        },
      },
      data: {
        booking_status: 'cancelled',
      },
    });

    // Update room status to available for cancelled bookings
    const cancelledBookingIds = await prisma.apartment_booking.findMany({
      where: {
        booking_status: 'cancelled',
        created_at: {
          lte: threeDaysAgo,
        },
        room_id: { not: null },
      },
      select: { room_id: true },
    });

    for (const booking of cancelledBookingIds) {
      if (booking.room_id !== null) {
        await prisma.room.update({
          where: { id: booking.room_id },
          data: { room_status: 'available' },
        });
      }
    }

    console.log(`Cancelled ${expiredBookings.count} expired bookings`);
  } catch (error) {
    throw handlePrismaError(error);
  }
}
