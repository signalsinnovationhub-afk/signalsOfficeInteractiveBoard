import { createServerFn } from "@tanstack/react-start";

export type Investment = {
  id: number;
  Kategorie: string | null;
  Unternehmen: string;
  Kurzbeschreibung: string | null;
  Beschreibung: string | null;
  Investiert_in: number | null;
  Fonds: string | null;
  Website_URL: string | null;
};

export const listInvestments = createServerFn({ method: "GET" }).handler(
  async (): Promise<Investment[]> => {
    const { supabaseAdmin: supabase } = await import("@/integrations/supabase/client.server");

    const { data, error } = await supabase
      .from("investments")
      .select(
        "id, Kategorie, Unternehmen, Kurzbeschreibung, Beschreibung, Investiert_in, Fonds, Website_URL",
      );

    if (error) throw new Error(error.message);
    return (data ?? []) as Investment[];
  },
);
