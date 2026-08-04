// frontend/src/types/index.ts

export type TripStatus = 'working' | 'not_working';
export type TripType = 'inter_Wilaya' | 'intra_Wilaya';
export type TicketClassType = 'first_class' | 'economy';

export interface Station {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  wilaya_id: number;
}

export interface Train {
  id: number;
  serial_number: string;
}

export interface Wilaya {
  id: number;
  name: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
}

export interface Line {
  id: number;
  name: string;
  length: number;
}

export interface LineStation {
  line_id: number;
  station_id: number;
  order: number;
  distance: number;
}

export interface LineGeometry {
  id: number;
  line_id: number;
  sequence: number;
  latitude: number;
  longitude: number;
}

export interface Trip {
  id: number;
  line_id: number;
  train_id: number;
  status: TripStatus;
  tripType: TripType;
}

export interface Scheduler {
  id: number;
  trip_id: number;
  station_id: number;
  order: number;
  arrival_time: string; // HH:MM:SS
  departure_time: string; // HH:MM:SS
}

export interface Notice {
  id: number;
  line_id?: number | null;
  station_id?: number | null;
  trip_id?: number | null;
  message: string;
  created_at: string;
}

export interface TicketClass {
  id: number;
  classtype: TicketClassType;
  Rate_Per_Km: number;
}

export interface PriceResponse {
  distance_km: number;
  price: number;
}
