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
      visibility: record.visibility || 'citizens',
      power_bi_report_type: record.type || 'summary',
    };

    return await prisma.reports_metadata.create({ data: payload });
  } catch (error) {
    handlePrismaError(error);
  }
};

const updateReportMetadata = async (
  reportId: number,
  record: {
    title?: string;
    description?: string | null;
    category?: string;
    embedUrl?: string | null;
    visibility?: 'citizens' | 'admin';
    type?: 'summary' | 'trends';
  }
) => {
  try {
    // Find category_id if category name is provided
    let categoryId: number | undefined = undefined;

    if (record.category) {
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
    }

    // Build update payload
    const updatePayload: {
      title_string?: string;
      description_string?: string | null;
      category_id?: number | null;
      power_bi_report_id_string?: string | null;
      visibility?: 'citizens' | 'admin' | 'official';
      power_bi_report_type?: 'summary' | 'trends';
      last_updated_datetime?: Date;
    } = {
      last_updated_datetime: new Date(),
    };

    if (record.title !== undefined) {
      updatePayload.title_string = record.title;
    }
    if (record.description !== undefined) {
      updatePayload.description_string = record.description;
    }
    if (categoryId !== undefined) {
      updatePayload.category_id = categoryId;
    }
    if (record.embedUrl !== undefined) {
      updatePayload.power_bi_report_id_string = record.embedUrl;
    }
    if (record.visibility !== undefined) {
      updatePayload.visibility = record.visibility;
    }
    if (record.type !== undefined) {
      updatePayload.power_bi_report_type = record.type;
    }

    return await prisma.reports_metadata.update({
      where: { report_id: reportId },
      data: updatePayload,
      include: {
        dim_category: true,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const deleteReportMetadata = async (reportId: number) => {
  try {
    return await prisma.reports_metadata.delete({
      where: { report_id: reportId },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

export {
  getReportsMetadata,
  getReportsMetadataWithCategory,
  createReportMetadata,
  updateReportMetadata,
  deleteReportMetadata,
};
