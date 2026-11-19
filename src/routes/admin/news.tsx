import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isAdmin } from "@/lib/questions.functions";
import {
  createNews,
  deleteNews,
  listAdminNews,
  togglePublished,
  updateNews,
  type NewsItem,
} from "@/lib/news.functions";
import { getSettings, updateSettings } from "@/lib/settings.functions";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/news")({
  component: AdminNewsPage,
});

const DATE_FMT = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

type FormState = {
  id: string | null;
  title: string;
  full_text: string;
  article_url: string;
  source: string;
  published: boolean;
  created_at: string; // local datetime-input value (yyyy-MM-ddTHH:mm)
};

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function emptyForm(): FormState {
  return {
    id: null,
    title: "",
    full_text: "",
    article_url: "",
    source: "",
    published: true,
    created_at: toLocalInput(new Date().toISOString()),
  };
}

function AdminNewsPage() {
  const navigate = useNavigate();
  const fetchIsAdmin = useServerFn(isAdmin);
  const fetchNews = useServerFn(listAdminNews);
  const fetchSettings = useServerFn(getSettings);
  const saveSettings = useServerFn(updateSettings);
  const createFn = useServerFn(createNews);
  const updateFn = useServerFn(updateNews);
  const deleteFn = useServerFn(deleteNews);
  const toggleFn = useServerFn(togglePublished);
  const queryClient = useQueryClient();

  const [authState, setAuthState] = useState<"loading" | "ok" | "no">("loading");
  const [rotationSec, setRotationSec] = useState<number>(5);
  const [readerIdleSec, setReaderIdleSec] = useState<number>(30);
  const [perSource, setPerSource] = useState<number>(10);
  const [refreshTime, setRefreshTime] = useState<string>("08:05");

  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState<NewsItem | null>(null);

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
      } catch {
        setAuthState("no");
      }
    })();
  }, [navigate, fetchIsAdmin]);

  const { data: news, isLoading } = useQuery({
    queryKey: ["admin_news"],
    queryFn: () => fetchNews(),
    enabled: authState === "ok",
    refetchInterval: 30_000,
  });

  const { data: settings } = useQuery({
    queryKey: ["app_settings"],
    queryFn: () => fetchSettings(),
    enabled: authState === "ok",
    staleTime: 30_000,
  });

  useEffect(() => {
    if (settings) {
      setRotationSec(settings.news_rotation_sec);
      setReaderIdleSec(settings.news_reader_idle_sec);
      setPerSource(settings.news_per_source);
      setRefreshTime(settings.news_daily_refresh_time);
    }
  }, [settings]);

  const settingsMutation = useMutation({
    mutationFn: async () => {
      if (!settings) throw new Error("Einstellungen nicht geladen");
      await saveSettings({
        data: {
          ...settings,
          news_rotation_sec: rotationSec,
          news_reader_idle_sec: readerIdleSec,
          news_per_source: perSource,
          news_daily_refresh_time: refreshTime,
          news_retention_days: 7,
        },
      });
    },
    onSuccess: () => {
      toast.success("Einstellungen gespeichert");
      queryClient.invalidateQueries({ queryKey: ["app_settings"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Fehler"),
  });

  const saveMutation = useMutation({
    mutationFn: async (f: FormState) => {
      const payload = {
        title: f.title.trim(),
        full_text: f.full_text.trim() || null,
        article_url: f.article_url.trim(),
        source: f.source.trim(),
        published: f.published,
        created_at: new Date(f.created_at).toISOString(),
      };
      if (f.id) {
        await updateFn({ data: { id: f.id, ...payload } });
      } else {
        await createFn({ data: payload });
      }
    },
    onSuccess: () => {
      toast.success("Gespeichert");
      setEditorOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin_news"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard_news"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Fehler"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteFn({ data: { id } });
    },
    onSuccess: () => {
      toast.success("Gelöscht");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin_news"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard_news"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Fehler"),
  });

  async function handleToggle(item: NewsItem, next: boolean) {
    queryClient.setQueryData<NewsItem[]>(["admin_news"], (old) =>
      old?.map((n) => (n.id === item.id ? { ...n, published: next } : n)) ?? old,
    );
    try {
      await toggleFn({ data: { id: item.id, published: next } });
      queryClient.invalidateQueries({ queryKey: ["dashboard_news"] });
    } catch (e) {
      queryClient.setQueryData<NewsItem[]>(["admin_news"], (old) =>
        old?.map((n) => (n.id === item.id ? { ...n, published: !next } : n)) ?? old,
      );
      toast.error(e instanceof Error ? e.message : "Fehler");
    }
  }

  function openCreate() {
    setForm(emptyForm());
    setEditorOpen(true);
  }
  function openEdit(n: NewsItem) {
    setForm({
      id: n.id,
      title: n.title,
      full_text: n.full_text ?? "",
      article_url: n.article_url,
      source: n.source,
      published: n.published,
      created_at: toLocalInput(n.created_at),
    });
    setEditorOpen(true);
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
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        Kein Zugriff.
      </div>
    );
  }

  const list = news ?? [];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">News-Verwaltung</h1>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/admin" className="text-muted-foreground hover:text-foreground">
              ← Admin
            </Link>
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              Zum Display
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6 p-4 border border-border rounded-lg bg-muted/30 flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground block">
              Rotation (Sek.)
            </label>
            <input
              type="number"
              min={2}
              max={120}
              value={rotationSec}
              onChange={(e) => setRotationSec(Number(e.target.value))}
              className="w-24 h-9 px-3 rounded-md border border-input bg-background text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground block">
              Reader-Timeout (Sek.)
            </label>
            <input
              type="number"
              min={5}
              max={600}
              value={readerIdleSec}
              onChange={(e) => setReaderIdleSec(Number(e.target.value))}
              className="w-24 h-9 px-3 rounded-md border border-input bg-background text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground block">
              News pro Quelle
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={perSource}
              onChange={(e) => setPerSource(Number(e.target.value))}
              className="w-24 h-9 px-3 rounded-md border border-input bg-background text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground block">
              Tägl. Refresh (Berlin, HH:mm)
            </label>
            <input
              type="time"
              value={refreshTime}
              onChange={(e) => setRefreshTime(e.target.value)}
              className="w-28 h-9 px-3 rounded-md border border-input bg-background text-sm"
            />
          </div>
          <button
            onClick={() => settingsMutation.mutate()}
            disabled={settingsMutation.isPending || !settings}
            className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
          >
            {settingsMutation.isPending ? "Speichere…" : "Speichern"}
          </button>
          <p className="text-xs text-muted-foreground flex-1 min-w-[200px]">
            News älter als 7 Tage werden automatisch entfernt.
          </p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {list.length} News insgesamt. Nur aktive News, die maximal 7 Tage alt sind,
            erscheinen auf dem Dashboard.
          </p>
          <button
            onClick={openCreate}
            className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Neue News
          </button>
        </div>

        {isLoading ? (
          <div className="text-muted-foreground">Lädt…</div>
        ) : list.length === 0 ? (
          <div className="text-muted-foreground py-12 text-center border border-dashed border-border rounded-lg">
            Noch keine News vorhanden.
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-3 py-2 w-20">Aktiv</th>
                  <th className="px-3 py-2">Titel</th>
                  <th className="px-3 py-2 w-32">Quelle</th>
                  <th className="px-3 py-2 w-24">Link</th>
                  <th className="px-3 py-2 w-40">Datum</th>
                  <th className="px-3 py-2 w-28 text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {list.map((n: NewsItem) => (
                  <tr key={n.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-3 py-2">
                      <Switch
                        checked={n.published}
                        onCheckedChange={(v) => handleToggle(n, v)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => openEdit(n)}
                        className="font-medium hover:underline text-left"
                      >
                        {n.title}
                      </button>
                      {n.full_text && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {n.full_text}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{n.source}</td>
                    <td className="px-3 py-2">
                      <a
                        href={n.article_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                        title="Originalquelle öffnen"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground tabular-nums">
                      {DATE_FMT.format(new Date(n.created_at))}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => openEdit(n)}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-muted"
                          aria-label="Bearbeiten"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(n)}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-destructive/10 text-destructive"
                          aria-label="Löschen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "News bearbeiten" : "Neue News"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate(form);
            }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground block">
                Headline / Titel
              </label>
              <input
                type="text"
                required
                maxLength={500}
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground block">
                Volltext / Beschreibung
              </label>
              <textarea
                rows={8}
                maxLength={200000}
                value={form.full_text}
                onChange={(e) => setForm((f) => ({ ...f, full_text: e.target.value }))}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-y"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground block">
                  Originalquelle (URL)
                </label>
                <input
                  type="url"
                  required
                  maxLength={2000}
                  placeholder="https://…"
                  value={form.article_url}
                  onChange={(e) => setForm((f) => ({ ...f, article_url: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground block">
                  Quelle (Kurzname)
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={form.source}
                  onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground block">
                  Veröffentlichungsdatum
                </label>
                <input
                  type="datetime-local"
                  required
                  value={form.created_at}
                  onChange={(e) => setForm((f) => ({ ...f, created_at: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground block">
                  Status
                </label>
                <div className="flex items-center gap-2 h-10">
                  <Switch
                    checked={form.published}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, published: v }))}
                  />
                  <span className="text-sm">{form.published ? "Aktiv" : "Inaktiv"}</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="h-9 px-4 rounded-md border border-input bg-background text-sm"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
              >
                {saveMutation.isPending ? "Speichere…" : "Speichern"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>News löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              „{deleteTarget?.title}" wird endgültig entfernt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
