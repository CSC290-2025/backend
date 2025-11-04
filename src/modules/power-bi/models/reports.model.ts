import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { CreateReportMetadataInput } from '../types';

// Generic reports metadata across categories (admin-owned)
const getReportsMetadata = async () => {
  try {
    return await prisma.reports_metadata.findMany();
  } catch (error) {
    handlePrismaError(error);
  }
};

// Get reports metadata with category information
const getReportsMetadataWithCategory = async () => {
  try {
    return await prisma.reports_metadata.findMany({
      include: {
        dim_category: true,
      },
      orderBy: {
        category_id: 'asc',
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const createReportMetadata = async (record: CreateReportMetadataInput) => {
  try {
    // Find or get category_id from category name
    // For now, we'll need to find the category by name or create it
    // This is a simplified version - you may want to add category lookup logic
    let categoryId: number | null = null;

    if (record.category) {
      // Try to find category by name
      const category = await prisma.dim_category.findFirst({
        where: {
          category_name: {
            equals: record.category,
            mode: 'insensitive',
          },
        },
      });

      if (category) {
        categoryId = category.category_id;
      }
      // If category doesn't exist, you might want to create it or throw an error
      // For now, we'll leave categoryId as null if not found
    }

    // Get embed URL from embedUrl
    const embedUrl = record.embedUrl || null;

    // Get the next report_id by finding the max and adding 1
    const maxReport = await prisma.reports_metadata.findFirst({
      orderBy: { report_id: 'desc' },
      select: { report_id: true },
    });
    const nextReportId = maxReport ? maxReport.report_id + 1 : 1;

    const payload = {
      report_id: nextReportId,
      title_string: record.title,
      description_string: record.description ?? null,
      category_id: categoryId,
      power_bi_report_id_string: embedUrl,
    };

    return await prisma.reports_metadata.create({ data: payload });
  } catch (error) {
    handlePrismaError(error);
  }
};

export {
  getReportsMetadata,
  getReportsMetadataWithCategory,
  createReportMetadata,
};
