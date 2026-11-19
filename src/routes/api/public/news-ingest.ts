import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const newsItemSchema = z.object({
  title: z.string().trim().min(1).max(500),
  image_url: z.string().url().max(2000),
  article_url: z.string().url().max(2000),
  source: z.string().trim().min(1).max(100),
  full_text: z.string().trim().max(200000).optional(),
  description: z.string().trim().max(200000).optional(),
  summary: z.string().trim().max(200000).optional(),
  content: z.string().trim().max(200000).optional(),
});

const bodySchema = z.union([newsItemSchema, z.array(newsItemSchema).min(1).max(50)]);

type NewsItemInput = z.infer<typeof newsItemSchema>;

function pickBody(item: NewsItemInput): { key: string | null; value: string | null } {
  for (const key of ["full_text", "description", "summary", "content"] as const) {
    const v = item[key];
    if (typeof v === "string" && v.trim().length > 0) {
      return { key, value: v.trim() };
    }
  }
  return { key: null, value: null };
}


function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export const Route = createFileRoute("/api/public/news-ingest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.MAKE_WEBHOOK_SECRET;
        if (!secret) {
          return new Response("Webhook secret not configured", { status: 500 });
        }
        const provided = request.headers.get("x-webhook-secret") ?? "";
        if (!provided || !safeEqual(provided, secret)) {
          return new Response("Unauthorized", { status: 401 });
        }

        // Read raw body as text first so we can log exactly what Make sent.
        const rawText = await request.text();
        console.log("[news-ingest] content-type:", request.headers.get("content-type"));
        console.log("[news-ingest] content-encoding:", request.headers.get("content-encoding"));
        console.log("[news-ingest] raw body length:", rawText.length);
        console.log("[news-ingest] raw body (first 2000 chars):", rawText.slice(0, 2000));

        let raw: unknown;
        try {
          raw = JSON.parse(rawText);
        } catch (e) {
          console.log("[news-ingest] JSON parse failed:", e);
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        // Log the parsed keys so we can see if full_text actually arrived
        if (Array.isArray(raw)) {
          console.log("[news-ingest] parsed array, first item keys:", Object.keys(raw[0] ?? {}));
        } else if (raw && typeof raw === "object") {
          console.log("[news-ingest] parsed object keys:", Object.keys(raw));
          const ft = (raw as Record<string, unknown>).full_text;
          console.log("[news-ingest] full_text type:", typeof ft, "length:", typeof ft === "string" ? ft.length : "n/a");
        }

        const parsed = bodySchema.safeParse(raw);
        if (!parsed.success) {
          console.log("[news-ingest] validation failed:", JSON.stringify(parsed.error.flatten()));
          return Response.json(
            { error: "Validation failed", details: parsed.error.flatten() },
            { status: 400 },
          );
        }

        const items = Array.isArray(parsed.data) ? parsed.data : [parsed.data];

        const rows = items.map((item) => {
          const { key, value } = pickBody(item);
          console.log(
            `[news-ingest] "${item.title.slice(0, 80)}" body_key=${key ?? "none"} len=${value?.length ?? 0}`,
          );
          return {
            title: item.title,
            image_url: item.image_url,
            article_url: item.article_url,
            source: item.source,
            full_text: value,
            published: true,
          };
        });

        const { data, error } = await supabaseAdmin
          .from("ai_news")
          .insert(rows)
          .select("id");


        if (error) {
          return Response.json({ error: error.message }, { status: 500 });
        }

        return Response.json({ ok: true, inserted: data?.length ?? 0 });
      },
    },
  },
});
