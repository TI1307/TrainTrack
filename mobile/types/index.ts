export type Station = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  wilaya_id: number;
};

export type TripSearchResult = {
  trip_id: number;
  train_serial_number: string;
  status: string;
  departure_time: string;
  arrival_time: string;
  is_current: boolean;
};

export type Notice = {
  id: number;
  line_id: number | null;
  station_id: number | null;
  trip_id: number | null;
  message: string;
  created_at: string;
};

export type TrackingRead = {
  trip_id: number;
  status: string;
  from_station_id?: number;
  to_station_id?: number;
  progress_percent?: number;
  latitude: number;
  longitude: number;
};

export type StopStatus = {
  station_id: number;
  station_name: string;
  order: number;
  arrival_time: string;
  departure_time: string;
  stop_status: "passed" | "current" | "upcoming";
};

export type Stop = {
  name: string;
  time: string;
  passed: boolean;
};

export type Train = {
  id: string;
  trainNumber: string;
  departureTime: string;
  departureStation: string;
  arrivalTime: string;
  arrivalStation: string;
  duration: string;
  isCurrent: boolean;
  stops: Stop[];
};

export type TicketClass = {
  id: number;
  classtype: "first_class" | "economy" | "intra_wilaya";
  Rate_Per_Km: number;
};

export type PriceResponse = {
  distance_km: number;
  price: number;
};