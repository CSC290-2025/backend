export interface Fare {
  value: number;
  currency: string;
  text: string;
}

export interface OverviewPolyline {
  points: string;
}

export interface DetailedStep {
  instruction: string;
  travel_mode: string;
  duration: string;
  vehicle_type?: string;
  line_name?: string;
  departure_stop_type?: string;
  arrival_stop_type?: string;
  num_stops?: number;
  departure_stop?: string;
  arrival_stop?: string;
}

export interface RouteSummary {
  start_address: string;
  end_address: string;
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  detailedSteps: DetailedStep[];
  fare: Fare | null;
  overview_polyline: OverviewPolyline | null;
}

export interface GetRoutesResult {
  allRoutesSummarized: RouteSummary[];
  fastestRouteSummary: RouteSummary;
}
