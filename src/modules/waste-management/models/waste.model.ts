import prisma from '@/config/client';

export class WasteModel {
  static async getAllWasteTypes() {
    return await prisma.waste_types.findMany({
      select: {
        id: true,
        type_name: true,
        typical_weight_kg: true,
      },
    });
  }

  static async createOrUpdateDailyWasteLog(
    wasteTypeName: string,
    weight: number
  ) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1️⃣ Find today's waste log with this type
    let wasteLog = await prisma.waste_event_statistics.findFirst({
      where: {
        collection_date: { gte: todayStart, lte: todayEnd },
        waste_types: { type_name: wasteTypeName },
        event_id: null,
      },
      include: { waste_types: true },
    });

    if (wasteLog) {
      // 2️⃣ If exists, update total_collection_weight
      wasteLog = await prisma.waste_event_statistics.update({
        where: { id: wasteLog.id },
        data: { total_collection_weight: { increment: weight } },
        include: { waste_types: true },
      });
    } else {
      // 3️⃣ If not, create new waste type and log
      const wasteType = await prisma.waste_types.create({
        data: { type_name: wasteTypeName },
      });

      wasteLog = await prisma.waste_event_statistics.create({
        data: {
          waste_type_id: wasteType.id,
          total_collection_weight: weight,
          collection_date: new Date(),
          event_id: null,
        },
        include: { waste_types: true },
      });
    }

    return wasteLog;
  }

  static async getWasteStatsByMonth(startDate: Date, endDate: Date) {
    return await prisma.waste_event_statistics.groupBy({
      by: ['waste_type_id'],
      where: {
        collection_date: {
          gte: startDate,
          lte: endDate,
        },
        event_id: null,
      },
      _sum: {
        total_collection_weight: true,
      },
      _count: {
        id: true,
      },
    });
  }

  static async getWasteTypeById(id: number) {
    return await prisma.waste_types.findUnique({
      where: { id },
      select: { type_name: true },
    });
  }

  static async getWasteStatsByDay(targetDate: Date) {
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    return await prisma.waste_event_statistics.findMany({
      where: {
        collection_date: {
          gte: dayStart,
          lte: dayEnd,
        },
        event_id: null,
      },
      include: {
        waste_types: {
          select: {
            type_name: true,
          },
        },
      },
    });
  }
}
