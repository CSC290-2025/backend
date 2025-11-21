import { NotFoundError, ValidationError } from '@/errors';
import { BinModel } from '../models';
import type {
  BinType,
  BinStatus,
  CreateBinRequest,
  UpdateBinRequest,
  BinFilters,
} from '../types/bin.types';

export class BinService {
  static async getAllBins(filters: BinFilters) {
    const { binType, status, lat, lng, radius } = filters;

    // If location and radius are provided, find bins within radius
    if (lat !== undefined && lng !== undefined && radius !== undefined) {
      const bins = await BinModel.findBinsInRadius(lat, lng, radius);

      // Apply additional filters if provided
      let filteredBins = bins;
      if (binType) {
        filteredBins = filteredBins.filter((bin) => bin.bin_type === binType);
      }
      if (status) {
        filteredBins = filteredBins.filter((bin) => bin.status === status);
      }

      return filteredBins;
    }

    // Otherwise, get all bins with type/status filters
    const bins = await BinModel.findAllBins({
      binType: binType as BinType,
      status: status as BinStatus,
    });

    return bins;
  }

  static async getBinById(id: number) {
    if (!id || isNaN(id)) {
      throw new ValidationError('Valid bin ID is required');
    }

    const bin = await BinModel.findBinById(id);

    if (!bin) {
      throw new NotFoundError(`Bin with ID ${id} not found`);
    }

    return bin;
  }

  static async createBin(data: CreateBinRequest) {
    // Validation
    if (!data.bin_name || !data.bin_type) {
      throw new ValidationError('Bin name and type are required');
    }

    if (
      data.latitude === undefined ||
      data.longitude === undefined ||
      data.latitude < -90 ||
      data.latitude > 90 ||
      data.longitude < -180 ||
      data.longitude > 180
    ) {
      throw new ValidationError('Valid latitude and longitude are required');
    }

    const bin = await BinModel.createBin(data);

    return {
      message: `Bin "${data.bin_name}" created successfully`,
      data: bin,
    };
  }

  static async updateBin(id: number, data: UpdateBinRequest) {
    if (!id || isNaN(id)) {
      throw new ValidationError('Valid bin ID is required');
    }

    // Check if bin exists
    const existingBin = await BinModel.findBinById(id);
    if (!existingBin) {
      throw new NotFoundError(`Bin with ID ${id} not found`);
    }

    // Validate coordinates if provided
    if (data.latitude !== undefined || data.longitude !== undefined) {
      const lat = data.latitude ?? Number(existingBin.latitude);
      const lng = data.longitude ?? Number(existingBin.longitude);

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new ValidationError('Invalid latitude or longitude values');
      }
    }

    const updatedBin = await BinModel.updateBin(id, data);

    return {
      message: `Bin updated successfully`,
      data: updatedBin,
    };
  }

  static async deleteBin(id: number) {
    if (!id || isNaN(id)) {
      throw new ValidationError('Valid bin ID is required');
    }

    // Check if bin exists
    const existingBin = await BinModel.findBinById(id);
    if (!existingBin) {
      throw new NotFoundError(`Bin with ID ${id} not found`);
    }

    await BinModel.deleteBin(id);

    return {
      message: `Bin "${existingBin.bin_name}" deleted successfully`,
    };
  }

  static async updateBinStatus(id: number, status: BinStatus) {
    if (!id || isNaN(id)) {
      throw new ValidationError('Valid bin ID is required');
    }

    if (!status) {
      throw new ValidationError('Status is required');
    }

    // Check if bin exists
    const existingBin = await BinModel.findBinById(id);
    if (!existingBin) {
      throw new NotFoundError(`Bin with ID ${id} not found`);
    }

    const updatedBin = await BinModel.updateBinStatus(id, status);

    return {
      message: `Bin status updated to ${status}`,
      data: updatedBin,
    };
  }

  static async recordCollection(id: number, collectedWeight?: number) {
    if (!id || isNaN(id)) {
      throw new ValidationError('Valid bin ID is required');
    }

    if (collectedWeight !== undefined && collectedWeight <= 0) {
      throw new ValidationError('Collected weight must be greater than 0');
    }

    // Check if bin exists
    const existingBin = await BinModel.findBinById(id);
    if (!existingBin) {
      throw new NotFoundError(`Bin with ID ${id} not found`);
    }

    const updatedBin = await BinModel.recordCollection(id, collectedWeight);

    return {
      message: collectedWeight
        ? `Recorded collection of ${collectedWeight}kg from bin "${existingBin.bin_name}"`
        : `Recorded collection from bin "${existingBin.bin_name}"`,
      data: updatedBin,
    };
  }

  static async getNearestBins(
    lat: number,
    lng: number,
    binType?: BinType,
    limit: number = 5
  ) {
    if (
      lat === undefined ||
      lng === undefined ||
      isNaN(lat) ||
      isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      throw new ValidationError('Valid latitude and longitude are required');
    }

    if (limit < 1 || limit > 50) {
      throw new ValidationError('Limit must be between 1 and 50');
    }

    const bins = await BinModel.findNearestBins(lat, lng, binType, limit);

    return bins;
  }

  static async getBinStats() {
    const stats = await BinModel.getBinStats();
    return stats;
  }
}
