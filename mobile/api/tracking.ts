// mobile/api/tracking.ts
import client from "./client";
import type { TrackingRead, StopStatus, TripGeometry } from "../types";

export async function getLiveTrains(fromStationId: number, toStationId: number): Promise<TrackingRead[]> {
  const { data } = await client.get("/tracking/live", {
    params: { from_station_id: fromStationId, to_station_id: toStationId },
  });
  return data;
}

export async function getTripPath(tripId: number): Promise<StopStatus[]> {
  const { data } = await client.get(`/tracking/${tripId}/path`);
  return data;
}
export async function getTripGeometry(tripId: number): Promise<TripGeometry> {
  const { data } = await client.get(`/tracking/${tripId}/geometry`);
  return data;
}