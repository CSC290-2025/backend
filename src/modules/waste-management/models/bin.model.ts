import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type {
  Prisma,
  bin as BinLocation,
  bin_type as PrismaBinType,
} from '@/generated/prisma';
import type {
  BinWithDistance,
  CreateBinRequest,
  UpdateBinRequest,
} from '../types/bin.types';

const EARTH_RADIUS_KM = 6371;
const DEGREE_LAT_KM = 111;

export class BinModel {
  static async findAllBins(filters: { binType?: PrismaBinType }) {
    const { binType } = filters;

    return prisma.bin.findMany({
      where: {
        ...(binType ? { bin_type: binType } : {}),
      },
      orderBy: {
        bin_name: 'asc',
      },
    });
  }

  static async findBinById(id: number) {
    return prisma.bin.findUnique({
      where: { id },
    });
  }

  static async createBin(data: CreateBinRequest, userId: number | null) {
    try {
      return await prisma.bin.create({
        data: {
          bin_name: data.bin_name,
          bin_type: data.bin_type,
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.address ?? null,
          capacity: data.capacity_kg ?? null,
          created_by_user_id: userId ?? undefined,
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  static async updateBin(id: number, data: UpdateBinRequest) {
    const updateData: Prisma.binUpdateInput = {};

    if (data.bin_name !== undefined) updateData.bin_name = data.bin_name;
    if (data.bin_type !== undefined) updateData.bin_type = data.bin_type;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.capacity_kg !== undefined) updateData.capacity = data.capacity_kg;

    return prisma.bin.update({
      where: { id },
      data: updateData,
    });
  }

  static async deleteBin(id: number) {
    return prisma.bin.delete({
      where: { id },
    });
  }

  static async findBinsByUserId(userId: number) {
    return prisma.bin.findMany({
      where: {
        created_by_user_id: userId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  static async findBinsInRadius(
    lat: number,
    lng: number,
    radiusKm: number
  ): Promise<BinWithDistance[]> {
    const bounds = this.getBoundingBox(lat, lng, radiusKm);

    const candidates = await prisma.bin.findMany({
      where: {
        latitude: {
          gte: bounds.minLat,
          lte: bounds.maxLat,
        },
        longitude: {
          gte: bounds.minLng,
          lte: bounds.maxLng,
        },
      },
    });

    return candidates
      .map((bin) => this.withDistance(bin, lat, lng))
      .filter((bin) => bin.numericDistance <= radiusKm)
      .sort((a, b) => a.numericDistance - b.numericDistance);
  }

  static async findNearestBins(
    lat: number,
    lng: number,
    binType?: PrismaBinType,
    limit: number = 5
  ): Promise<BinWithDistance[]> {
    const candidates = await prisma.bin.findMany({
      where: binType ? { bin_type: binType } : undefined,
    });

    return candidates
      .map((bin) => this.withDistance(bin, lat, lng))
      .sort((a, b) => a.numericDistance - b.numericDistance)
      .slice(0, limit);
  }

  static async findNearbyBins(
    lat: number,
    lng: number,
    binType?: PrismaBinType,
    search?: string
  ): Promise<BinWithDistance[]> {
    const where: Prisma.binWhereInput = {};

    if (binType) {
      where.bin_type = binType;
    }

    if (search) {
      where.OR = [
        {
          bin_name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          address: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const candidates = await prisma.bin.findMany({
      where,
    });

    return candidates
      .map((bin) => this.withDistance(bin, lat, lng))
      .sort((a, b) => a.numericDistance - b.numericDistance);
  }

  private static getBoundingBox(lat: number, lng: number, radiusKm: number) {
    const latDelta = radiusKm / DEGREE_LAT_KM;
    const lngDelta =
      radiusKm / (DEGREE_LAT_KM * Math.cos((lat * Math.PI) / 180)) || latDelta;

    return {
      minLat: lat - latDelta,
      maxLat: lat + latDelta,
      minLng: lng - lngDelta,
      maxLng: lng + lngDelta,
    };
  }

  private static withDistance(
    bin: BinLocation,
    lat: number,
    lng: number
  ): BinWithDistance {
    const numericLat = Number(bin.latitude);
    const numericLng = Number(bin.longitude);
    const numericDistance = this.calculateDistanceKm(
      lat,
      lng,
      numericLat,
      numericLng
    );

    return {
      ...bin,
      numericDistance,
      distance: this.formatDistance(numericDistance),
    };
  }

  private static calculateDistanceKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ) {
    const dLat = this.degToRad(lat2 - lat1);
    const dLng = this.degToRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degToRad(lat1)) *
        Math.cos(this.degToRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
  }

  private static degToRad(value: number) {
    return (value * Math.PI) / 180;
  }

  private static formatDistance(distanceKm: number) {
    if (distanceKm >= 1) {
      return `${distanceKm.toFixed(2)} km`;
    }
    return `${Math.round(distanceKm * 1000)} m`;
  }
}
