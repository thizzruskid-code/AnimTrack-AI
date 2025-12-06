// services/apiService.ts
// Central API + local-storage helpers for AnimTrack AI frontend

console.log("API SERVICE — REAL FILE LOADED");

const BACKEND_URL = "http://localhost:3001";
const LOCAL_KEY = "animtrack-assets";

export interface Asset {
  id?: number;
  project: string;
  episode: string;
  scene: string;
  shot: string;
  status: string;
  notes?: string;
  stills: string[];
  video?: string | null;
  [key: string]: any;
}

// -----------------------------
// LOCAL STORAGE HELPERS
// -----------------------------

export function loadLocalAssets(): Asset[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Asset[];
  } catch (err) {
    console.error("loadLocalAssets error:", err);
    return [];
  }
}

export function saveLocalAssets(assets: Asset[]): void {
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(assets));
  } catch (err) {
    console.error("saveLocalAssets error:", err);
  }
}

// -----------------------------
// GOOGLE SHEETS HELPERS
// -----------------------------

export async function loadFromSheets(): Promise<Asset[]> {
  const res = await fetch(`${BACKEND_URL}/sheets`, { method: "GET" });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `loadFromSheets: HTTP ${res.status} ${res.statusText} - ${text}`
    );
  }

  const data = await res.json();
  if (!data || !data.success) {
    throw new Error(
      `loadFromSheets: backend failure: ${
        data && data.error ? data.error : "Unknown error"
      }`
    );
  }

  const assets = (data.assets || []) as Asset[];

  // Normalize stills/video fields
  return assets.map((a) => ({
    project: a.project ?? "",
    episode: a.episode ?? "",
    scene: a.scene ?? "",
    shot: a.shot ?? "",
    status: a.status ?? "",
    notes: a.notes ?? "",
    stills: Array.isArray(a.stills)
      ? a.stills
      : typeof a.stills === "string" && a.stills.length > 0
      ? a.stills.split("|").map((s: string) => s.trim()).filter(Boolean)
      : [],
    video: a.video ?? null,
    ...a,
  }));
}

export async function copyToSheets(assets: Asset[]): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/sheets/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assets }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `copyToSheets: HTTP ${res.status} ${res.statusText} - ${text}`
    );
  }

  const data = await res.json();
  if (!data || !data.success) {
    throw new Error(
      `copyToSheets: backend failure: ${
        data && data.error ? data.error : "Unknown error"
      }`
    );
  }
}

// -----------------------------
// UPLOAD HELPERS
// -----------------------------

// Upload multiple still images (field name "stills")
export async function uploadStills(files: File[]): Promise<string[]> {
  if (!files || files.length === 0) return [];

  const formData = new FormData();
  for (const file of files) {
    formData.append("stills", file);
  }

  const res = await fetch(`${BACKEND_URL}/upload/stills`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `uploadStills: HTTP ${res.status} ${res.statusText} - ${text}`
    );
  }

  const data = await res.json();
  if (!data || !data.success || !Array.isArray(data.stills)) {
    throw new Error(
      `uploadStills: backend failure: ${
        data && data.error ? data.error : "Unknown error"
      }`
    );
  }

  return data.stills as string[];
}

// Upload a single video (field name "video")
export async function uploadVideo(
  file: File | null
): Promise<string | null> {
  if (!file) return null;

  const formData = new FormData();
  formData.append("video", file);

  const res = await fetch(`${BACKEND_URL}/upload/video`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `uploadVideo: HTTP ${res.status} ${res.statusText} - ${text}`
    );
  }

  const data = await res.json();
  if (!data || !data.success || !data.video) {
    throw new Error(
      `uploadVideo: backend failure: ${
        data && data.error ? data.error : "Unknown error"
      }`
    );
  }

  return data.video as string;
}
