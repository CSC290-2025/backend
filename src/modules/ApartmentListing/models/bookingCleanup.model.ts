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
  const BOOKING_EXPIRY_DAYS = 3;
  threeDaysAgo.setDate(threeDaysAgo.getDate() - BOOKING_EXPIRY_DAYS);

  try {
    // Find expired pending bookings with room_id
    const expiredPendingBookings = await prisma.apartment_booking.findMany({
      where: {
        booking_status: 'pending',
        created_at: {
          lte: threeDaysAgo,
        },
        room_id: { not: null },
      },
      select: { id: true, room_id: true },
    });
    // Cancel those bookings
    const expiredBookingIds = expiredPendingBookings.map((b) => b.id);
    const expiredRoomIds = expiredPendingBookings
      .map((b) => b.room_id)
      .filter((roomId) => roomId !== null);

    if (expiredBookingIds.length > 0) {
      // Use transaction to ensure atomicity between booking and room updates
      await prisma.$transaction(async (tx) => {
        // Cancel expired bookings
        await tx.apartment_booking.updateMany({
          where: {
            id: { in: expiredBookingIds },
          },
          data: {
            booking_status: 'cancelled',
          },
        });

        // Update room status to available for rooms of just-cancelled bookings
        await tx.room.updateMany({
          where: { id: { in: expiredRoomIds } },
          data: { room_status: 'available' },
        });
      });
    }
    console.log(`Cancelled ${expiredBookingIds.length} expired bookings`);
  } catch (error) {
    throw handlePrismaError(error);
  }
}
