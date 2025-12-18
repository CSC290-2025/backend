import { ForbiddenError, NotFoundError, ValidationError } from '@/errors';
import { WasteModel } from '../models';
import type { WasteLogInternal, WasteStats } from '../types';

export class WasteService {
  static async getWasteTypes() {
    const wasteTypes = await WasteModel.getAllWasteTypes();
    return wasteTypes;
  }

  static async logWaste(data: WasteLogInternal) {
    if (!data.waste_type_name || !data.weight) {
      throw new NotFoundError('waste_type_name and weight are required');
    }
    if (data.weight <= 0)
      throw new ValidationError('Weight must be greater than 0');

    const wasteLog = await WasteModel.createWasteLog(
      data.waste_type_name,
      data.weight,
      data.user_id
    );

    return {
      message: `Logged ${data.weight}kg of ${wasteLog.waste_types?.type_name} waste`,
      data: wasteLog,
    };
  }

  static async getMonthlyStatsByUser(
    user_id: number,
    month?: number,
    year?: number
  ): Promise<WasteStats> {
    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const stats = (await WasteModel.getWasteStatsByMonthByUser(
      startDate,
      endDate,
      user_id
    )) as Array<{
      waste_type_id: number;
      _sum: {
        weight_kg: number | null;
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
          total_weight: Number(stat._sum.weight_kg) || 0,
          entry_count: stat._count.id,
        };
      })
    );

    const totalWeight = stats.reduce(
      (sum, stat) => sum + (Number(stat._sum.weight_kg) || 0),
      0 as number
    );

    return {
      month: targetMonth,
      year: targetYear,
      total_weight_kg: totalWeight,
      by_type: statsWithNames,
    };
  }

  static async getDailyStats(user_id: number, date: Date) {
    const stats = (await WasteModel.getWasteStatsByDay(
      user_id,
      date
    )) as Array<{
      waste_type_id: number;
      _sum: {
        weight_kg: number | null;
      };
      _count: {
        id: number;
      };
    }>;

    const byType = await Promise.all(
      stats
        .filter((stat) => stat.waste_type_id !== null)
        .map(async (stat) => {
          const wasteType = await WasteModel.getWasteTypeById(
            stat.waste_type_id!
          );

          const totalWeightByType = Number(stat._sum.weight_kg) || 0;

          return {
            waste_type: wasteType?.type_name,
            total_weight: totalWeightByType,
            entry_count: stat._count.id,
          };
        })
    );

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

  static async getDailyLogs(user_id: number) {
    const today = new Date();
    const logs = await WasteModel.getWasteLogsByDay(user_id, today);

    return logs.map((stat) => ({
      waste_type: stat.waste_types?.type_name,
      log_id: stat.id,
      weight: stat.weight_kg,
    }));
  }

  static async deleteLogById(id: number, user_id: number) {
    if (!id || isNaN(id)) {
      throw new ValidationError('Valid log ID is required');
    }

    const existingLog = await WasteModel.findLogByUserById(id);
    if (!existingLog) {
      throw new NotFoundError(`Log with ID ${id} not found`);
    }

    if (existingLog.user_id != user_id) {
      throw new ForbiddenError(
        `This user does not have access to this waste log`
      );
    }

    await WasteModel.deleteLogById(id);

    return {
      message: `Waste log deleted successfully`,
    };
  }
}
