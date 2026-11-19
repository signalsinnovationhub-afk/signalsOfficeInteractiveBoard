import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type QuizResult = {
  id: string;
  nickname: string;
  score: number;
  total: number;
  created_at: string;
};

const submitSchema = z.object({
  nickname: z.string().min(1).max(32),
  score: z.number().int().min(0).max(1000),
  total: z.number().int().min(1).max(1000),
});

export const submitResult = createServerFn({ method: "POST" })
  .inputValidator((input) => submitSchema.parse(input))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("quiz_results")
      .insert({
        nickname: data.nickname,
        score: data.score,
        total: data.total,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const getLeaderboard = createServerFn({ method: "GET" }).handler(
  async () => {
    const { data: top, error: e1 } = await supabaseAdmin
      .from("quiz_results")
      .select("id, nickname, score, total, created_at")
      .order("score", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(3);
    if (e1) throw new Error(e1.message);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const { data: today, error: e2 } = await supabaseAdmin
      .from("quiz_results")
      .select("id, nickname, score, total, created_at")
      .gte("created_at", startOfDay.toISOString())
      .order("score", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(1);
    if (e2) throw new Error(e2.message);

    return {
      top3: (top ?? []) as QuizResult[],
      todayBest: (today?.[0] ?? null) as QuizResult | null,
    };
  },
);

async function assertAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden: Admin role required");
}

export const listResults = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("quiz_results")
      .select("id, nickname, score, total, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return (data ?? []) as QuizResult[];
  });

export const deleteResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("quiz_results")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const resetResults = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("quiz_results")
      .delete()
      .gte("created_at", "1970-01-01");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getFullLeaderboard = createServerFn({ method: "GET" }).handler(
  async (): Promise<QuizResult[]> => {
    const { data, error } = await supabaseAdmin
      .from("quiz_results")
      .select("id, nickname, score, total, created_at")
      .order("score", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(1000);
    if (error) throw new Error("Failed to load leaderboard");
    return (data ?? []) as QuizResult[];
  },
);
