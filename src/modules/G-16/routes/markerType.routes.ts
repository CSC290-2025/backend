import { Hono } from 'hono';
import { createMarkerType, getAllMarkerTypes, getMarkerTypeById, getMarkerTypeByTypes , getMarkerTypesByType, getMarkerTypesInBounds, updateMarkerType, deleteMarkerType} from "../controllers/markerType.controller";
const markerTypeRoutes = new Hono();

markerTypeRoutes.post('/', createMarkerType);
markerTypeRoutes.get('/', getAllMarkerTypes);
markerTypeRoutes.get('/:id', getMarkerTypeById);
markerTypeRoutes.get('/type/:markerTypeId', getMarkerTypesByType);
markerTypeRoutes.post('/filter', getMarkerTypeByTypes);
markerTypeRoutes.post('/bounds', getMarkerTypesInBounds);
markerTypeRoutes.put('/:id', updateMarkerType);
markerTypeRoutes.delete('/:id', deleteMarkerType);

markerTypeRoutes.get('/health', (c) => { // FIX: Use 'c' (Context) for Hono
    return c.json({                      // FIX: Use c.json() for Hono response
      success: true, 
      message: 'Server is running!',
      timestamp: new Date().toISOString() // Better date format
    });
});
export {markerTypeRoutes};

