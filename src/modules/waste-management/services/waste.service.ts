import { WasteModel } from '../models';
import type { WasteLogRequest, WasteStats } from '../types';
import type { Prisma } from '@/generated/prisma';

export class WasteService {
  static async getWasteTypes() {
    const wasteTypes = await WasteModel.getAllWasteTypes();
    return wasteTypes;
  }

  static async logWaste(data: WasteLogRequest) {
    if (!data.waste_type_name || !data.weight) {
      throw new Error('waste_type_name and weight are required');
    }
    if (data.weight <= 0) throw new Error('Weight must be greater than 0');

    const wasteLog = await WasteModel.createOrUpdateDailyWasteLog(
      data.waste_type_name,
      data.weight
    );

    return {
      message: `Logged ${data.weight}kg of ${wasteLog.waste_types?.type_name} waste`,
      data: wasteLog,
    };
  }

  static async getMonthlyStats(
    month?: number,
    year?: number
  ): Promise<WasteStats> {
    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const stats = (await WasteModel.getWasteStatsByMonth(
      startDate,
      endDate
    )) as Array<{
      waste_type_id: number;
      _sum: {
        total_collection_weight: number | null;
      };
      _count: {
        id: number;
      };
    }>;

    // Fetch waste type names
    const statsWithNames = await Promise.all(
      stats.map(async (stat) => {
        const wasteType = await WasteModel.getWasteTypeById(stat.waste_type_id);
        return {
          waste_type: wasteType?.type_name,
          total_weight: Number(stat._sum.total_collection_weight) || 0,
          entry_count: stat._count.id,
        };
      })
    );

    const totalWeight = stats.reduce(
      (sum, stat) => sum + (Number(stat._sum.total_collection_weight) || 0),
      0 as number
    );

    return {
      month: targetMonth,
      year: targetYear,
      total_weight_kg: totalWeight,
      by_type: statsWithNames,
    };
  }

  static async getDailyStats(date: Date) {
    const stats = await WasteModel.getWasteStatsByDay(date);

    const byType = stats.map((stat) => ({
      waste_type: stat.waste_types?.type_name,
      total_weight: Number(stat.total_collection_weight) || 0,
      log_id: stat.id,
    }));

    const totalWeight = byType.reduce(
      (sum, stat) => sum + stat.total_weight,
      0
    );

    return {
      date: date.toISOString().split('T')[0],
      total_weight_kg: totalWeight,
      by_type: byType,
    };
  }
}
