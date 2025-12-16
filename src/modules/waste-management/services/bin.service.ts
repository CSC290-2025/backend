import { NotFoundError, ValidationError } from '@/errors';
import { BinModel } from '../models';
import type {
  BinType,
  CreateBinRequest,
  UpdateBinRequest,
  BinFilters,
} from '../types/bin.types';

export class BinService {
  static async getAllBins(filters: BinFilters) {
    const { binType, lat, lng, radius } = filters;

    if (lat !== undefined && lng !== undefined && radius !== undefined) {
      const bins = await BinModel.findBinsInRadius(lat, lng, radius);

      let filteredBins = bins;
      if (binType) {
        filteredBins = filteredBins.filter((bin) => bin.bin_type === binType);
      }

      return filteredBins;
    }

    const bins = await BinModel.findAllBins({
      binType: binType as BinType,
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

    const existingBin = await BinModel.findBinById(id);
    if (!existingBin) {
      throw new NotFoundError(`Bin with ID ${id} not found`);
    }

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

    const existingBin = await BinModel.findBinById(id);
    if (!existingBin) {
      throw new NotFoundError(`Bin with ID ${id} not found`);
    }

    await BinModel.deleteBin(id);

    return {
      message: `Bin "${existingBin.bin_name}" deleted successfully`,
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

  static async getNearbyBins(
    lat: number,
    lng: number,
    binType?: BinType,
    search?: string
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

    const bins = await BinModel.findNearbyBins(lat, lng, binType, search);

    return bins;
  }
}
