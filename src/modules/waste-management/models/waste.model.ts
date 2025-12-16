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

  static async createWasteLog(
    wasteTypeName: string,
    weight: number,
    user_id: number
  ) {
    let wasteType = await prisma.waste_types.findFirst({
      where: {
        type_name: wasteTypeName,
      },
    });

    if (!wasteType) {
      wasteType = await prisma.waste_types.create({
        data: {
          type_name: wasteTypeName,
        },
      });
    }

    const wasteLog = await prisma.waste_logs.create({
      data: {
        user_id: user_id,
        waste_type_id: wasteType.id,
        log_date: new Date(),
        weight_kg: weight,
      },
      include: {
        waste_types: true,
      },
    });

    return wasteLog;
  }

  static async getWasteStatsByMonth(
    startDate: Date,
    endDate: Date,
    user_id: number
  ) {
    return await prisma.waste_logs.groupBy({
      by: ['waste_type_id'],
      where: {
        log_date: {
          gte: startDate,
          lte: endDate,
        },
        user_id: user_id,
      },
      _sum: {
        weight_kg: true,
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

  static async getWasteStatsByDay(user_id: number, targetDate: Date) {
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    return await prisma.waste_logs.groupBy({
      by: ['waste_type_id'],
      where: {
        log_date: {
          gte: dayStart,
          lte: dayEnd,
        },
        user_id: user_id,
      },
      _sum: {
        weight_kg: true,
      },
      _count: {
        id: true,
      },
    });
  }

  static async findLogByUserById(id: number) {
    return prisma.waste_logs.findUnique({
      where: { id: id },
    });
  }

  static async deleteLogById(id: number) {
    return prisma.waste_logs.delete({
      where: { id },
    });
  }
}
