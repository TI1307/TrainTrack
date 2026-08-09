// mobile/api/passenger.ts
import client from "./client";
import type { TripSearchResult, Notice } from "../types";

export async function searchTrips(fromStationId: number, toStationId: number): Promise<TripSearchResult[]> {
  const { data } = await client.get("/passenger/search", {
    params: { from_station_id: fromStationId, to_station_id: toStationId },
  });
  return data;
}

export async function get_notices(fromStationId: number, toStationId: number): Promise<Notice[]> {
  const { data } = await client.get("/passenger/notices", {
    params: { from_station_id: fromStationId, to_station_id: toStationId },
  });
  return data;
}