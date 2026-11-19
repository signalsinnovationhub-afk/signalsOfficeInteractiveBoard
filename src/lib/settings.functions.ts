import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AppSettings = {
  quiz_idle_timeout_sec: number;
  quiz_countdown_sec: number;
  quiz_finish_return_sec: number;
  quiz_shuffle_enabled: boolean;
  news_rotation_sec: number;
  news_reader_idle_sec: number;
  news_per_source: number;
  news_daily_refresh_time: string; // "HH:mm" Europe/Berlin
  news_retention_days: number;
};

const DEFAULTS: AppSettings = {
  quiz_idle_timeout_sec: 30,
  quiz_countdown_sec: 10,
  quiz_finish_return_sec: 8,
  quiz_shuffle_enabled: true,
  news_rotation_sec: 5,
  news_reader_idle_sec: 30,
  news_per_source: 10,
  news_daily_refresh_time: "08:05",
  news_retention_days: 30,
};

export const getSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<AppSettings> => {
    const { data, error } = await supabaseAdmin
      .from("app_settings")
      .select("key, value");
    if (error) throw new Error(error.message);
    const map = new Map((data ?? []).map((r) => [r.key, r.value]));
    const num = (k: keyof AppSettings) => Number(map.get(k) ?? DEFAULTS[k]);
    const str = (k: keyof AppSettings) => {
      const v = map.get(k);
      return (typeof v === "string" ? v : DEFAULTS[k]) as string;
    };
    const bool = (k: keyof AppSettings) => {
      const v = map.get(k);
      if (typeof v === "boolean") return v;
      if (typeof v === "string") return v === "true";
      return DEFAULTS[k] as boolean;
    };
    return {
      quiz_idle_timeout_sec: num("quiz_idle_timeout_sec"),
      quiz_countdown_sec: num("quiz_countdown_sec"),
      quiz_finish_return_sec: num("quiz_finish_return_sec"),
      quiz_shuffle_enabled: bool("quiz_shuffle_enabled"),
      news_rotation_sec: num("news_rotation_sec"),
      news_reader_idle_sec: num("news_reader_idle_sec"),
      news_per_source: num("news_per_source"),
      news_daily_refresh_time: str("news_daily_refresh_time"),
      news_retention_days: num("news_retention_days"),
    };
  },
);

const updateSchema = z.object({
  quiz_idle_timeout_sec: z.number().int().min(15).max(300),
  quiz_countdown_sec: z.number().int().min(3).max(60),
  quiz_finish_return_sec: z.number().int().min(3).max(60),
  quiz_shuffle_enabled: z.boolean(),
  news_rotation_sec: z.number().int().min(2).max(120),
  news_reader_idle_sec: z.number().int().min(5).max(600),
  news_per_source: z.number().int().min(1).max(50),
  news_daily_refresh_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  news_retention_days: z.number().int().min(1).max(365),
});


export const updateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => updateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: role } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("Forbidden: Admin role required");

    const rows = (Object.entries(data) as [keyof AppSettings, AppSettings[keyof AppSettings]][]).map(
      ([key, value]) => ({ key, value, updated_at: new Date().toISOString() }),
    );
    const { error } = await supabaseAdmin
      .from("app_settings")
      .upsert(rows);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
