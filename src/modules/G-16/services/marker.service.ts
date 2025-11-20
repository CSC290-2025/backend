export type markerType = {
  id: string;
  lat: number;
  lng: number;
  title?: string | null;
  description?: string | null;
  marker_type_id?: number | null;
  confidence?: number;
  categories?: string[];
  created_at: string;
};

const markers: markerType[] = [];

let nextId = 1;
export function addMarker(
  m: Omit<markerType, 'id' | 'created_at'>
): markerType {
  const id = String(nextId++); // "1", "2", "3", ...
  const created_at = new Date().toISOString();
  const marker: markerType = { id, created_at, ...m };
  markers.push(marker);
  return marker;
}

// list marker
export function listMarkers(limit = 100): markerType[] {
  // reverse new on top
  return markers.slice(-limit).reverse();
}

export function clearMarkers() {
  markers.length = 0;
}
