import React, { useEffect, useState } from "react";

import {
  Asset,
  loadLocalAssets,
  saveLocalAssets,
  loadFromSheets,
  copyToSheets,
} from "./services/apiService";

import EditPanel from "./components/EditPanel";
import AssetTable from "./components/AssetTable";

const App: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selected, setSelected] = useState<Asset | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" | null } | null>(null);

  // INITIAL LOAD
  useEffect(() => {
    const local = loadLocalAssets();
    if (local.length > 0) setAssets(local);
  }, []);

  const handleLocalLoad = () => {
    const local = loadLocalAssets();
    setAssets(local);
    setStatus("Loaded from local storage.");
  };

  const handleLoadFromSheets = async () => {
    try {
      setIsSyncing(true);
      const data = await loadFromSheets();
      setAssets(data);
      saveLocalAssets(data);
      setStatus("Loaded from Google Sheets.");
    } catch (err) {
      console.error(err);
      setStatus("Error loading from Sheets.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveToSheets = async () => {
    try {
      setIsSyncing(true);
      await copyToSheets(assets);
      setStatus("Saved to Google Sheets.");
    } catch (err) {
      console.error(err);
      setStatus("Error saving to Sheets.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAssetUpdated = (updated: Asset) => {
    const updatedList = assets.map((a, idx) => {
      if (a.id !== undefined && updated.id !== undefined) {
        return a.id === updated.id ? updated : a;
      }
      return idx === assets.indexOf(selected as Asset) ? updated : a;
    });

    setAssets(updatedList);
    saveLocalAssets(updatedList);
    setSelected(updated);
  };

  const handleNewEntry = () => {
    const newAsset: Asset = {
      id: Date.now(),
      project: "",
      episode: "",
      scene: "",
      shot: "",
      status: "",
      notes: "",
      stills: [],
      video: null,
    };
    setAssets((prev) => [...prev, newAsset]);
    setSelected(newAsset);
  };

  const handleDelete = async () => {
    if (!selected) return;

    const filtered = assets.filter((a) => a.id !== selected.id);
    setAssets(filtered);
    saveLocalAssets(filtered);
    setSelected(null);

    try {
      setIsSyncing(true);
      await copyToSheets(filtered);
      setStatus("Deleted and synced to Google Sheets.");
    } catch (err) {
      console.error(err);
      setStatus("Error syncing deletion to Sheets.");
    } finally {
      setIsSyncing(false);
    }
  };

  // SEARCH
  const filtered = assets.filter((a) => {
    const t = search.toLowerCase();
    return (
      a.project?.toLowerCase().includes(t) ||
      a.episode?.toLowerCase().includes(t) ||
      a.scene?.toLowerCase().includes(t) ||
      a.shot?.toLowerCase().includes(t) ||
      a.status?.toLowerCase().includes(t) ||
      a.notes?.toLowerCase().includes(t)
    );
  });

  // SORTING LOGIC
  const sortedAssets = React.useMemo(() => {
    if (!sortConfig || !sortConfig.key || !sortConfig.direction) return filtered;

    const sorted = [...filtered].sort((a: any, b: any) => {
      const valA = a[sortConfig.key] ?? "";
      const valB = b[sortConfig.key] ?? "";

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filtered, sortConfig]);

  const handleSort = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      setSortConfig({ key, direction: "asc" });
    } else if (sortConfig.direction === "asc") {
      setSortConfig({ key, direction: "desc" });
    } else {
      setSortConfig({ key: key, direction: null });
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-6">

        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">AnimTrack AI</h1>
            <p className="text-sm text-slate-400">GTI Shot & Scene Tracker</p>
          </div>
        </header>

        {status && (
          <div className="mt-4 border border-slate-800 bg-slate-950/70 px-3 py-2 rounded-lg text-xs">
            {status}
          </div>
        )}

        {/* LAYOUT */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[340px,1fr]">

          {/* LEFT PANEL */}
          <div className="space-y-4">

            {/* Controls */}
            <div className="p-4 rounded-xl border border-slate-800 bg-[#1a1d22] shadow-lg">
              <h2 className="text-sm font-semibold">Controls</h2>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={handleNewEntry}
                  className="col-span-2 rounded-lg bg-slate-100 text-slate-900 px-3 py-2 text-sm hover:bg-white"
                >
                  + Add Entry
                </button>

                <button
                  onClick={handleLocalLoad}
                  className="rounded-lg bg-slate-900/80 border border-slate-700 px-3 py-2 text-xs hover:bg-slate-800"
                >
                  Local Load
                </button>

                <button
                  onClick={handleSaveToSheets}
                  className="rounded-lg bg-slate-900/80 border border-slate-700 px-3 py-2 text-xs hover:bg-slate-800"
                >
                  Save Sheets
                </button>

                <button
                  onClick={handleLoadFromSheets}
                  className="col-span-2 rounded-lg bg-slate-900/80 border border-slate-700 px-3 py-2 text-xs hover:bg-slate-800"
                >
                  Load Sheets
                </button>
              </div>
            </div>

            {/* Edit Panel */}
            {selected && (
              <div className="p-4 rounded-xl border border-slate-800 bg-[#1a1d22] shadow-lg">
                <EditPanel
                  asset={selected}
                  onAssetUpdated={handleAssetUpdated}
                  close={() => setSelected(null)}
                  onDelete={handleDelete}
                />
              </div>
            )}

          </div>

          {/* RIGHT PANEL */}
          <div className="p-4 rounded-xl border border-slate-800 bg-[#1a1d22] shadow-lg">

            {/* Search */}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shots, scenes, notes…"
              className="w-full mb-4 rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500"
            />

            <AssetTable
              assets={sortedAssets}
              setSelected={setSelected}
              onSort={handleSort}
              sortConfig={sortConfig}
            />

          </div>
        </div>

      </div>
    </div>
  );
};

export default App;
