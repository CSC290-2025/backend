import type { OpenAPIHono } from '@hono/zod-openapi';
import { MedicineInventoryController } from '../controllers';
import { MedicineInventorySchemas } from '../schemas';

const setupMedicineInventoryRoutes = (app: OpenAPIHono) => {
  app.openapi(
    MedicineInventorySchemas.listMedicineInventoryRoute,
    MedicineInventoryController.listMedicineInventory
  );
  app.openapi(
    MedicineInventorySchemas.createMedicineInventoryRoute,
    MedicineInventoryController.createMedicineInventory
  );
  app.openapi(
    MedicineInventorySchemas.getMedicineInventoryRoute,
    MedicineInventoryController.getMedicineInventory
  );
  app.openapi(
    MedicineInventorySchemas.updateMedicineInventoryRoute,
    MedicineInventoryController.updateMedicineInventory
  );
  app.openapi(
    MedicineInventorySchemas.deleteMedicineInventoryRoute,
    MedicineInventoryController.deleteMedicineInventory
  );
};

export { setupMedicineInventoryRoutes };
