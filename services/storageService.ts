// services/storageService.ts

const STORAGE_KEY = "animtrack-assets";

export function loadLocal() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw);
    } catch (err) {
        console.error("loadLocal failed:", err);
        return [];
    }
}

export function saveLocal(data: any[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
        console.error("saveLocal failed:", err);
    }
}
