import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type NewsItem = {
  id: string;
  title: string;
  image_url: string | null;
  article_url: string;
  source: string;
  published: boolean;
  created_at: string;
  full_text: string | null;
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: Admin role required");
}

/**
 * News fürs Dashboard: nur aktive Einträge, max. 7 Tage alt.
 * Ruft vor dem Lesen `cleanup_old_news()` auf, damit alte Einträge
 * unabhängig vom Cron-Job entfernt werden.
 */
export const getDashboardNews = createServerFn({ method: "GET" }).handler(
  async (): Promise<NewsItem[]> => {
    // Best-effort cleanup (Fehler ignorieren)
    try {
      await supabaseAdmin.rpc("cleanup_old_news");
    } catch {
      /* noop */
    }

    const cutoff = new Date(Date.now() - SEVEN_DAYS_MS).toISOString();
    const { data, error } = await supabaseAdmin
      .from("ai_news")
      .select("id, title, image_url, article_url, source, published, created_at, full_text")
      .eq("published", true)
      .gte("created_at", cutoff)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (data ?? []) as NewsItem[];
  },
);

/** Alle News fürs Admin-Panel (inkl. inaktiver). */
export const listAdminNews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<NewsItem[]> => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("ai_news")
      .select("id, title, image_url, article_url, source, published, created_at, full_text")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return (data ?? []) as NewsItem[];
  });

const createSchema = z.object({
  title: z.string().trim().min(1).max(500),
  full_text: z.string().trim().max(200000).optional().nullable(),
  article_url: z.string().trim().url().max(2000),
  source: z.string().trim().min(1).max(100),
  published: z.boolean(),
  created_at: z.string().datetime().optional(),
});

export const createNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => createSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const insertRow = {
      title: data.title,
      full_text: data.full_text?.trim() ? data.full_text.trim() : null,
      article_url: data.article_url,
      source: data.source,
      published: data.published,
      image_url: null as string | null,
      ...(data.created_at ? { created_at: data.created_at } : {}),
    };
    const { data: row, error } = await supabaseAdmin
      .from("ai_news")
      .insert(insertRow)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

const updateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(500),
  full_text: z.string().trim().max(200000).optional().nullable(),
  article_url: z.string().trim().url().max(2000),
  source: z.string().trim().min(1).max(100),
  published: z.boolean(),
  created_at: z.string().datetime(),
});

export const updateNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => updateSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("ai_news")
      .update({
        title: data.title,
        full_text: data.full_text?.trim() ? data.full_text.trim() : null,
        article_url: data.article_url,
        source: data.source,
        published: data.published,
        created_at: data.created_at,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("ai_news").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const togglePublished = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), published: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("ai_news")
      .update({ published: data.published })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
