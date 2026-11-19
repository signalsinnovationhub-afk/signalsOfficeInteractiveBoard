import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const adminExists = createServerFn({ method: "GET" }).handler(
  async () => {
    const { count, error } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if (error) throw new Error(error.message);
    return { exists: (count ?? 0) > 0 };
  },
);

const setupSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

export const setupAdmin = createServerFn({ method: "POST" })
  .inputValidator((input) => setupSchema.parse(input))
  .handler(async ({ data }) => {
    // Only allowed if no admin exists yet.
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) {
      throw new Error("Admin account already exists.");
    }

    const { data: created, error: createErr } =
      await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
      });
    if (createErr || !created.user) {
      throw new Error(createErr?.message ?? "Failed to create user");
    }

    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: created.user.id, role: "admin" });
    if (roleErr) {
      throw new Error(roleErr.message);
    }
    return { ok: true };
  });
