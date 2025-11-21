import type { reports_metadata } from '@/generated/prisma';

// Extended type for report metadata that includes runtime fields
export type ReportMetadataWithEmbedUrl = reports_metadata & {
  embedUrl?: string | null;
};

export type CreateReportMetadataInput = {
  title: string;
  description?: string | null;
  category: string;
  embedUrl?: string | null;
  visibility?: 'citizens' | 'admin';
  type?: 'summary' | 'trends';
};

export type UpdateReportMetadataInput = {
  title?: string;
  description?: string | null;
  category?: string;
  embedUrl?: string | null;
  visibility?: 'citizens' | 'admin';
  type?: 'summary' | 'trends';
};

export type ReportsByCategory = {
  [categoryName: string]: {
    categoryId: number;
    categoryName: string;
    categoryDescription: string | null;
    reports: ReportMetadataWithEmbedUrl[];
  };
};

// shared types
// Runtime list used by services to validate the role query param
export const VALID_ROLES = ['citizens', 'admin'] as const;
export type UserRole = (typeof VALID_ROLES)[number];
