import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isAdmin } from "@/lib/questions.functions";
import { QuestionsTab } from "@/components/admin/QuestionsTab";
import { MediaTab } from "@/components/admin/MediaTab";
import { RankingTab } from "@/components/admin/RankingTab";
import { SettingsTab } from "@/components/admin/SettingsTab";
import { ArchiveTab } from "@/components/admin/ArchiveTab";

type TabKey = "questions" | "archive" | "media" | "ranking" | "settings";

const TABS: { key: TabKey; label: string }[] = [
  { key: "questions", label: "Fragen" },
  { key: "archive", label: "Archiv" },
  { key: "media", label: "Medien" },
  { key: "ranking", label: "Ranking" },
  { key: "settings", label: "Einstellungen" },
];

export const Route = createFileRoute("/admin/")({
  component: AdminEditor,
});

function AdminEditor() {
  const navigate = useNavigate();
  const fetchIsAdmin = useServerFn(isAdmin);

  const [authState, setAuthState] = useState<"loading" | "ok" | "no">("loading");
  const [tab, setTab] = useState<TabKey>("questions");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate({ to: "/admin/login" });
        return;
      }
      try {
        const adm = await fetchIsAdmin();
        setAuthState(adm.isAdmin ? "ok" : "no");
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Fehler");
        setAuthState("no");
      }
    })();
  }, [navigate, fetchIsAdmin]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  }

  if (authState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        Lädt…
      </div>
    );
  }

  if (authState === "no") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Kein Zugriff</h1>
          <p className="text-muted-foreground">
            {err ?? "Dieses Konto hat keine Admin-Rechte."}
          </p>
          <button
            onClick={handleLogout}
            className="h-10 px-4 rounded-md bg-primary text-primary-foreground"
          >
            Abmelden
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Admin</h1>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/news"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              News
            </Link>
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Zum Display
            </Link>
            <button
              onClick={handleLogout}
              className="h-9 px-4 rounded-md border border-border text-sm"
            >
              Abmelden
            </button>
          </div>
        </div>
        <nav className="max-w-4xl mx-auto px-6 flex gap-1 border-t border-border">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t.key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {tab === "questions" && <QuestionsTab />}
        {tab === "archive" && <ArchiveTab />}
        {tab === "media" && <MediaTab />}
        {tab === "ranking" && <RankingTab />}
        {tab === "settings" && <SettingsTab />}
      </div>
    </main>
  );
}
