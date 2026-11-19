import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminExists, setupAdmin } from "@/lib/admin-setup.functions";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const checkExists = useServerFn(adminExists);
  const doSetup = useServerFn(setupAdmin);

  const [mode, setMode] = useState<"loading" | "login" | "setup">("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate({ to: "/admin" });
        return;
      }
      const res = await checkExists();
      if (!cancelled) setMode(res.exists ? "login" : "setup");
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, checkExists]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "setup") {
        await doSetup({ data: { email, password } });
      }
      const { error: signErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signErr) throw signErr;
      navigate({ to: "/admin" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }

  if (mode === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        Lädt…
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-card border border-border rounded-lg p-6 space-y-4 shadow-sm"
      >
        <h1 className="text-2xl font-bold text-foreground">
          {mode === "setup" ? "Admin-Konto anlegen" : "Admin Login"}
        </h1>
        {mode === "setup" && (
          <p className="text-sm text-muted-foreground">
            Noch kein Admin vorhanden. Lege jetzt dein Konto an.
          </p>
        )}
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">E-Mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Passwort</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete={mode === "setup" ? "new-password" : "current-password"}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full h-10 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-50"
        >
          {busy ? "…" : mode === "setup" ? "Anlegen & Einloggen" : "Einloggen"}
        </button>
        {mode === "login" && <ForgotPassword defaultEmail={email} />}
      </form>

    </main>
  );
}

function ForgotPassword({ defaultEmail }: { defaultEmail: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(defaultEmail);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });
      if (error) throw error;
      setMsg("Reset-Link gesendet. Prüfe dein Postfach (auch Spam).");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Senden fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          if (!email) setEmail(defaultEmail);
        }}
        className="w-full text-sm text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
      >
        Passwort vergessen?
      </button>
    );
  }

  return (
    <div className="space-y-2 border-t border-border pt-4">
      <label className="text-sm font-medium text-foreground">
        Reset-Link senden an
      </label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
      />
      {err && <p className="text-sm text-destructive">{err}</p>}
      {msg && <p className="text-sm text-green-600">{msg}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={send}
          disabled={busy || !email}
          className="flex-1 h-10 rounded-md border border-border text-sm font-medium disabled:opacity-50"
        >
          {busy ? "…" : "Link senden"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="h-10 px-3 rounded-md text-sm text-muted-foreground"
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
}

