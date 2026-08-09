import  client  from "../../api/client";
import type { AdminUser } from "../types";

export const authService = {
  async login(username: string, password: string): Promise<{ access_token: string; token_type: string }> {
    const form = new URLSearchParams();
    form.append("username", username);
    form.append("password", password);
    const { data } = await client.post("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return data;
  },

  async me(token: string): Promise<AdminUser> {
    const { data } = await client.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  async logout(): Promise<void> {
    await client.post("/auth/logout");
  },
};