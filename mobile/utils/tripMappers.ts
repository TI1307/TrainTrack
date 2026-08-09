import type { TripSearchResult, StopStatus, Train } from "../types";

function formatTime(t: string): string {
  return t.slice(0, 5); // "07:33:00" -> "07:33"
}

function computeDuration(depart: string, arrive: string): string {
  const [dh, dm] = depart.split(":").map(Number);
  const [ah, am] = arrive.split(":").map(Number);
  let minutes = ah * 60 + am - (dh * 60 + dm);
  if (minutes < 0) minutes += 24 * 60; // trip crosses midnight
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours === 0 ? `${mins} دقيقة` : `${hours} ساعة و${mins} دقائق`;
}

export function mapTripToTrainCard(
  trip: TripSearchResult,
  fromStationName: string,
  toStationName: string,
  path: StopStatus[] | undefined
): Train {
  return {
    id: String(trip.trip_id),
    isCurrent: trip.is_current,
    departureTime: formatTime(trip.departure_time),
    departureStation: fromStationName,
    arrivalTime: formatTime(trip.arrival_time),
    arrivalStation: toStationName,
    duration: computeDuration(trip.departure_time, trip.arrival_time),
    trainNumber: trip.train_serial_number,
    stops: (path ?? []).map((s) => ({
      name: s.station_name,
      time: formatTime(s.arrival_time),
      passed: s.stop_status === "passed",
    })),
  };
}