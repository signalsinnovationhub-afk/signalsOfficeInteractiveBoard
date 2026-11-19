import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type MediaSlot = "welcome" | "bottom";

export type MediaTile = {
  slot: MediaSlot;
  source_type: "upload" | "url";
  storage_path: string | null;
  external_url: string | null;
  poster_url: string | null;
  /** Resolved playable URL, ready for <video src>. Empty if not configured. */
  resolved_url: string;
};

function publicUrl(path: string): string {
  const { data } = supabaseAdmin.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}

function resolve(row: {
  source_type: string;
  storage_path: string | null;
  external_url: string | null;
}): string {
  if (row.source_type === "upload" && row.storage_path) {
    return publicUrl(row.storage_path);
  }
  if (row.source_type === "url" && row.external_url) {
    return row.external_url;
  }
  return "";
}

export const getMediaTiles = createServerFn({ method: "GET" }).handler(
  async (): Promise<MediaTile[]> => {
    const { data, error } = await supabaseAdmin
      .from("media_tiles")
      .select("slot, source_type, storage_path, external_url, poster_url");
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      slot: r.slot as MediaSlot,
      source_type: r.source_type as "upload" | "url",
      storage_path: r.storage_path,
      external_url: r.external_url,
      poster_url: r.poster_url,
      resolved_url: resolve(r),
    }));
  },
);

const upsertSchema = z.object({
  slot: z.enum(["welcome", "bottom"]),
  source_type: z.enum(["upload", "url"]),
  storage_path: z.string().max(500).nullable(),
  external_url: z.string().max(2000).nullable(),
  poster_url: z.string().max(2000).nullable(),
});

export const upsertMediaTile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => upsertSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: role } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("Forbidden: Admin role required");

    const { error } = await supabaseAdmin
      .from("media_tiles")
      .upsert({
        slot: data.slot,
        source_type: data.source_type,
        storage_path: data.storage_path,
        external_url: data.external_url,
        poster_url: data.poster_url,
        updated_at: new Date().toISOString(),
      });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
