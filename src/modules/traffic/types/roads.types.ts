import type { z } from 'zod';
import type { RoadSchemas } from '../schemas';

type Road = z.infer<typeof RoadSchemas.RoadSchema>;
type CreateRoadData = z.infer<typeof RoadSchemas.CreateRoadSchema>;
type UpdateRoadData = z.infer<typeof RoadSchemas.UpdateRoadSchema>;
type RoadFilterOptions = z.infer<typeof RoadSchemas.RoadFilterSchema>;
type PaginationOptions = z.infer<typeof RoadSchemas.PaginationSchema>;
type PaginatedRoads = z.infer<typeof RoadSchemas.PaginatedRoadsSchema>;

export type {
  Road,
  CreateRoadData,
  UpdateRoadData,
  RoadFilterOptions,
  PaginationOptions,
  PaginatedRoads,
};
