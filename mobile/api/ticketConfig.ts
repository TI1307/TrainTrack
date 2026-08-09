import client from "./client";
import type { TicketClass, PriceResponse } from "../types";

export async function getTicketClasses(): Promise<TicketClass[]> {
  const { data } = await client.get("/ticket-config/");
  return data;
}

export async function calculatePrice(
  fromStationId: number,
  toStationId: number,
  ticketClassId: number
): Promise<PriceResponse> {
  const { data } = await client.post("/ticket-config/price", {
    from_station_id: fromStationId,
    to_station_id: toStationId,
    ticket_class_id: ticketClassId,
  });
  return data;
}