// services/apiService.ts

// ----------------------
// Shared types
// ----------------------
export type AssetStatus = "New" | "planned" | "in-progress" | "done";

export interface Asset {
  id: string;
  project: string;
  episode: string;
  scene: string;
  shot: string;
  status: AssetStatus | string;
  notes: string;
  stills: string[];       // relative URLs or paths
  video?: string | null;  // relative URL or path
}

// ----------------------
// Local storage helpers
// ----------------------

const LOCAL_STORAGE_KEY = "animtrack-ai-assets-v1";

export function loadLocalAssets(): Asset[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    // Basic sanity check / normalization
    return parsed.map((item: any, index: number): Asset => ({
      id: String(item.id ?? `local-${index}`),
      project: String(item.project ?? ""),
      episode: String(item.episode ?? ""),
      scene: String(item.scene ?? ""),
      shot: String(item.shot ?? ""),
      status: (item.status as AssetStatus) ?? "New",
      notes: String(item.notes ?? ""),
      stills: Array.isArray(item.stills)
        ? item.stills.map((s: any) => String(s))
        : [],
      video:
        typeof item.video === "string" && item.video.length > 0
          ? item.video
          : null,
    }));
  } catch (err) {
    console.error("[apiService] Failed to load local assets", err);
    return [];
  }
}

export function saveLocalAssets(assets: Asset[]): void {
  try {
    window.localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(assets ?? [])
    );
  } catch (err) {
    console.error("[apiService] Failed to save local assets", err);
  }
}

// ----------------------
// Backend config
// ----------------------

const API_BASE = "http://localhost:3001";

async function handleJsonResponse<T>(res: Response, context: string): Promise<T> {
  let payload: any = null;
  try {
    payload = await res.json();
  } catch (err) {
    console.error(`[apiService] ${context}: failed to parse JSON`, err);
  }

  if (!res.ok) {
    const msg =
      payload && typeof payload.error === "string"
        ? payload.error
        : `${context} failed with status ${res.status}`;
    throw new Error(msg);
  }

  return payload as T;
}

// ----------------------
// Google Sheets sync
// ----------------------

// Load assets from Google Sheets via backend
export async function loadFromSheets(): Promise<Asset[]> {
  const res = await fetch(`${API_BASE}/sheets`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  const data = await handleJsonResponse<
    { success: boolean; assets?: any[]; rows?: any[]; error?: string }
  >(res, "Sheets load");

  if (!data.success) {
    throw new Error(data.error || "Sheets load failed");
  }

  const source = Array.isArray(data.assets)
    ? data.assets
    : Array.isArray(data.rows)
    ? data.rows
    : [];

  return source.map((row: any, index: number): Asset => ({
    id: String(row.id ?? row.rowIndex ?? `sheet-${index}`),
    project: String(row.project ?? row[0] ?? ""),
    episode: String(row.episode ?? row[1] ?? ""),
    scene: String(row.scene ?? row[2] ?? ""),
    shot: String(row.shot ?? row[3] ?? ""),
    status: (row.status as AssetStatus) ?? "planned",
    notes: String(row.notes ?? row[5] ?? ""),
    stills: Array.isArray(row.stills)
      ? row.stills.map((s: any) => String(s))
      : typeof row.stills === "string" && row.stills.length > 0
      ? [row.stills]
      : [],
    video:
      typeof row.video === "string" && row.video.length > 0
        ? row.video
        : null,
  }));
}

// Copy current assets to Google Sheets via backend
// (App.tsx should call this when the user clicks "Save to Sheets")
export async function copyToSheets(assets: Asset[]): Promise<void> {
  const res = await fetch(`${API_BASE}/sheets/upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ assets }),
  });

  const data = await handleJsonResponse<{ success: boolean; error?: string }>(
    res,
    "Sheets save"
  );

  if (!data.success) {
    throw new Error(data.error || "Sheets save failed");
  }
}

// ----------------------
// Upload services (stills & video)
// ----------------------

// Upload one or more still images.
// The backend is expected to return: { success: true, stills: string[] }
export async function uploadStills(files: File[]): Promise<string[]> {
  if (!files || files.length === 0) return [];

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("stills", file);
  });

  const res = await fetch(`${API_BASE}/upload/stills`, {
    method: "POST",
    body: formData,
  });

  const data = await handleJsonResponse<
    { success: boolean; stills?: string[]; error?: string }
  >(res, "Stills upload");

  if (!data.success) {
    throw new Error(data.error || "Stills upload failed");
  }

  return Array.isArray(data.stills) ? data.stills : [];
}

// Upload a single video file.
// Backend expected response: { success: true, video: string }
export async function uploadVideo(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("video", file);

  const res = await fetch(`${API_BASE}/upload/video`, {
    method: "POST",
    body: formData,
  });

  const data = await handleJsonResponse<
    { success: boolean; video?: string; error?: string }
  >(res, "Video upload");

  if (!data.success || typeof data.video !== "string") {
    throw new Error(data.error || "Video upload failed");
  }

  return data.video;
}
