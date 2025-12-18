import type { OpenAPIHono } from '@hono/zod-openapi';
import { DepartmentSchemas } from '../schemas';
import * as DepartmentController from '../controllers/department.controller';

const setupDepartmentRoutes = (app: OpenAPIHono) => {
  app.openapi(
    DepartmentSchemas.listDepartmentsRoute,
    DepartmentController.listDepartments
  );
  app.openapi(
    DepartmentSchemas.getDepartmentRoute,
    DepartmentController.getDepartment
  );
  app.openapi(
    DepartmentSchemas.createDepartmentRoute,
    DepartmentController.createDepartment
  );
  app.openapi(
    DepartmentSchemas.updateDepartmentRoute,
    DepartmentController.updateDepartment
  );
  app.openapi(
    DepartmentSchemas.deleteDepartmentRoute,
    DepartmentController.deleteDepartment
  );
};

export { setupDepartmentRoutes };
