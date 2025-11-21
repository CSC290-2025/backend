import prisma from '@/config/client';
import type { BinStatus, BinType } from '../types';

export class BinModel {
  static async findAllBins(filters?: {
    binType?: BinType;
    status?: BinStatus;
  }) {
    return await prisma.bin_locations.findMany({
      where: {
        bin_type: filters?.binType,
        status: filters?.status,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  static async findBinById(id: number) {
    return await prisma.bin_locations.findUnique({
      where: { id },
    });
  }

  static async createBin(data: {
    bin_name: string;
    bin_type: BinType;
    latitude: number;
    longitude: number;
    address?: string;
    capacity_kg?: number;
    status?: BinStatus;
  }) {
    return await prisma.bin_locations.create({
      data: {
        bin_name: data.bin_name,
        bin_type: data.bin_type,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        capacity_kg: data.capacity_kg,
        status: data.status || 'NORMAL',
        last_collected_at: new Date(),
      },
    });
  }

  static async updateBin(
    id: number,
    data: {
      bin_name?: string;
      bin_type?: BinType;
      latitude?: number;
      longitude?: number;
      address?: string;
      capacity_kg?: number;
      status?: BinStatus;
    }
  ) {
    return await prisma.bin_locations.update({
      where: { id },
      data,
    });
  }

  static async deleteBin(id: number) {
    return await prisma.bin_locations.delete({
      where: { id },
    });
  }

  static async updateBinStatus(id: number, status: BinStatus) {
    return await prisma.bin_locations.update({
      where: { id },
      data: { status },
    });
  }

  static async recordCollection(id: number, collectedWeight?: number) {
    const updateData: any = {
      last_collected_at: new Date(),
      status: 'NORMAL',
    };

    if (collectedWeight !== undefined) {
      updateData.total_collected_weight = {
        increment: collectedWeight,
      };
    }

    return await prisma.bin_locations.update({
      where: { id },
      data: updateData,
    });
  }

  static async getBinStats() {
    const totalBins = await prisma.bin_locations.count();

    const byType = await prisma.bin_locations.groupBy({
      by: ['bin_type'],
      _count: {
        id: true,
      },
    });

    const byStatus = await prisma.bin_locations.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const overflowBins = await prisma.bin_locations.count({
      where: {
        status: 'OVERFLOW',
      },
    });

    return {
      totalBins,
      byType,
      byStatus,
      overflowBins,
    };
  }

  // Helper function to calculate distance between two coordinates (Haversine formula)
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  static async findNearestBins(
    lat: number,
    lng: number,
    binType?: BinType,
    limit: number = 5
  ) {
    // Get all bins (with optional type filter)
    const bins = await prisma.bin_locations.findMany({
      where: binType ? { bin_type: binType } : undefined,
    });

    // Calculate distances and sort
    const binsWithDistance = bins
      .map((bin) => ({
        ...bin,
        distance_km: this.calculateDistance(
          lat,
          lng,
          Number(bin.latitude),
          Number(bin.longitude)
        ),
      }))
      .sort((a, b) => a.distance_km - b.distance_km)
      .slice(0, limit);

    return binsWithDistance;
  }

  static async findBinsInRadius(lat: number, lng: number, radiusKm: number) {
    const bins = await prisma.bin_locations.findMany();

    return bins.filter((bin) => {
      const distance = this.calculateDistance(
        lat,
        lng,
        Number(bin.latitude),
        Number(bin.longitude)
      );
      return distance <= radiusKm;
    });
  }
}
