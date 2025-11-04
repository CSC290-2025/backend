import type { reports_metadata } from '@/generated/prisma';

// Extended type for report metadata that includes runtime fields
export type ReportMetadataWithEmbedUrl = reports_metadata & {
  embedUrl?: string | null;
};

// Type for create report metadata input
export type CreateReportMetadataInput = {
  title: string;
  description?: string | null;
  category: string;
  embedUrl?: string | null;
};

// Type for reports organized by category
export type ReportsByCategory = {
  [categoryName: string]: {
    categoryId: number;
    categoryName: string;
    categoryDescription: string | null;
    reports: ReportMetadataWithEmbedUrl[];
  };
};

// shared types
export const VALID_ROLES = ['citizen', 'official', 'admin'] as const;
export type UserRole = (typeof VALID_ROLES)[number];
