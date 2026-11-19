import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import {
  getMediaTiles,
  upsertMediaTile,
  type MediaTile,
} from "@/lib/media.functions";

export function MediaTab() {
  const fetchTiles = useServerFn(getMediaTiles);
  const save = useServerFn(upsertMediaTile);

  const [tile, setTile] = useState<MediaTile | undefined>(undefined);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    fetchTiles()
      .then((rows) => {
        setTile(rows.find((r) => r.slot === "bottom"));
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Fehler"))
      .finally(() => setLoading(false));
  }

  useEffect(load, [fetchTiles]);

  if (loading) return <p className="text-muted-foreground">Lädt…</p>;

  return (
    <div className="space-y-6">
      {err && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">
          {err}
        </p>
      )}

      <div className="text-sm text-muted-foreground bg-muted/50 px-4 py-3 rounded border border-border">
        <strong>Empfehlung:</strong> 1080p MP4 (H.264 + AAC), 5–10 Mbit/s, max.
        ~200 MB. So läuft auch ein 5-Minuten-Loop flüssig. Beim Quizstart wird
        das Video automatisch pausiert.
      </div>

      <MediaSlotEditor
        label="Video (unten rechts)"
        tile={tile}
        onSave={async (patch) => {
          await save({
            data: {
              slot: "bottom",
              source_type: patch.source_type,
              storage_path: patch.storage_path,
              external_url: patch.external_url,
              poster_url: patch.poster_url,
            },
          });
          load();
        }}
      />
    </div>
  );
}

function MediaSlotEditor({
  label,
  tile,
  onSave,
}: {
  label: string;
  tile: MediaTile | undefined;
  onSave: (patch: {
    source_type: "upload" | "url";
    storage_path: string | null;
    external_url: string | null;
    poster_url: string | null;
  }) => Promise<void>;
}) {
  const [sourceType, setSourceType] = useState<"upload" | "url">(
    tile?.source_type ?? "url",
  );
  const [externalUrl, setExternalUrl] = useState(tile?.external_url ?? "");
  const [storagePath, setStoragePath] = useState<string | null>(
    tile?.storage_path ?? null,
  );
  const [posterUrl, setPosterUrl] = useState(tile?.poster_url ?? "");
  const [busy, setBusy] = useState(false);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [sizeWarn, setSizeWarn] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [removed, setRemoved] = useState(false);

  const hasVideo = Boolean(
    tile?.storage_path || tile?.external_url || storagePath || externalUrl.trim(),
  );

  async function handleFile(file: File) {
    setErr(null);
    setSizeWarn(
      file.size > 100 * 1024 * 1024
        ? `Achtung: Datei ist ${Math.round(file.size / 1024 / 1024)} MB groß. Auf dem Samsung-TV kann das Video nach kurzer Zeit schwarz werden. Empfohlen: 720p, ohne Ton, unter 100 MB.`
        : null,
    );
    setUploadPct(0);
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "mp4";
      const path = `tiles/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("media")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || "video/mp4",
        });
      if (error) throw error;
      setStoragePath(path);
      setSourceType("upload");
      setUploadPct(100);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload fehlgeschlagen");
    } finally {
      setBusy(false);
      setTimeout(() => setUploadPct(null), 1500);
    }
  }

  async function handleSave() {
    setErr(null);
    setOk(false);
    setBusy(true);
    try {
      await onSave({
        source_type: sourceType,
        storage_path: sourceType === "upload" ? storagePath : null,
        external_url: sourceType === "url" ? externalUrl.trim() || null : null,
        poster_url: posterUrl.trim() || null,
      });
      setOk(true);
      setTimeout(() => setOk(false), 2000);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Speichern fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    if (!window.confirm("Video wirklich entfernen?")) return;
    setErr(null);
    setRemoved(false);
    setBusy(true);
    try {
      // Best-effort: Datei aus dem Bucket löschen, falls vorhanden
      const pathToDelete = tile?.storage_path ?? storagePath;
      if (pathToDelete) {
        const { error: rmErr } = await supabase.storage
          .from("media")
          .remove([pathToDelete]);
        if (rmErr) {
          setErr(`Storage-Hinweis: ${rmErr.message}`);
        }
      }
      await onSave({
        source_type: sourceType,
        storage_path: null,
        external_url: null,
        poster_url: null,
      });
      setStoragePath(null);
      setExternalUrl("");
      setPosterUrl("");
      setRemoved(true);
      setTimeout(() => setRemoved(false), 2000);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Entfernen fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }

  const previewSrc =
    sourceType === "url"
      ? externalUrl
      : tile?.source_type === "upload" && tile.storage_path === storagePath
        ? tile.resolved_url
        : storagePath
          ? supabase.storage.from("media").getPublicUrl(storagePath).data.publicUrl
          : "";

  return (
    <section className="bg-card border border-border rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{label}</h2>
        <div className="flex items-center gap-3">
          {ok && <span className="text-sm text-green-600">Gespeichert ✓</span>}
          {removed && (
            <span className="text-sm text-green-600">Entfernt ✓</span>
          )}
          {hasVideo && (
            <button
              onClick={handleRemove}
              disabled={busy}
              className="h-9 px-4 rounded-md border border-destructive text-destructive text-sm font-medium disabled:opacity-50 hover:bg-destructive/10"
            >
              Video entfernen
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={busy}
            className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
          >
            Speichern
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={sourceType === "url"}
            onChange={() => setSourceType("url")}
          />
          Externe URL
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={sourceType === "upload"}
            onChange={() => setSourceType("upload")}
          />
          Datei-Upload
        </label>
      </div>

      {sourceType === "url" ? (
        <div className="space-y-1">
          <label className="text-sm font-medium">Video-URL (.mp4)</label>
          <input
            type="url"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="https://example.com/video.mp4"
            className="w-full h-10 px-3 rounded-md border border-input bg-background"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-sm font-medium">MP4-Datei hochladen</label>
          <input
            type="file"
            accept="video/mp4,video/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
            disabled={busy}
            className="block w-full text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Empfohlen für den Fernseher: 1280×720, ohne Ton, unter 100 MB.
          </p>
          {sizeWarn && <p className="text-xs font-medium text-destructive">{sizeWarn}</p>}
          {uploadPct !== null && (
            <p className="text-xs text-muted-foreground">
              Upload: {uploadPct}%
            </p>
          )}
          {storagePath && (
            <p className="text-xs text-muted-foreground break-all">
              Aktuelle Datei: {storagePath}
            </p>
          )}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium">
          Poster-Bild (optional, URL)
        </label>
        <input
          type="url"
          value={posterUrl}
          onChange={(e) => setPosterUrl(e.target.value)}
          placeholder="https://example.com/poster.jpg"
          className="w-full h-10 px-3 rounded-md border border-input bg-background"
        />
      </div>

      {previewSrc && (
        <div className="space-y-1">
          <label className="text-sm font-medium">Vorschau</label>
          <video
            src={previewSrc}
            controls
            muted
            className="w-full max-h-64 bg-black"
          />
        </div>
      )}

      {err && <p className="text-sm text-destructive">{err}</p>}
    </section>
  );
}
