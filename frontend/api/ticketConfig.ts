import client from "./client";
import type { TicketClass, TicketClassType, PriceResponse } from "../src/types";

export type TicketClassInput = { classtype: TicketClassType; Rate_Per_Km: number };
export type PriceRequest = { from_station_id: number; to_station_id: number; ticket_class_id: number };

export async function getTicketClasses(): Promise<TicketClass[]> {
  const { data } = await client.get("/ticket-config/");
  return data;
}

export async function createTicketClass(payload: TicketClassInput): Promise<TicketClass> {
  const { data } = await client.post("/ticket-config/", payload);
  return data;
}

export async function updateTicketClass(id: number, payload: TicketClassInput): Promise<TicketClass> {
  const { data } = await client.put(`/ticket-config/${id}`, payload);
  return data;
}

export async function deleteTicketClass(id: number): Promise<void> {
  await client.delete(`/ticket-config/${id}`);
}

export async function calculatePrice(payload: PriceRequest): Promise<PriceResponse> {
  const { data } = await client.post("/ticket-config/price", payload);
  return data;
}