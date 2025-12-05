// App.tsx
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

  // ------------------------------
  // INITIAL LOAD FROM LOCAL
  // ------------------------------
  useEffect(() => {
    const local = loadLocalAssets();
    if (local.length > 0) {
      setAssets(local);
      setStatus("Loaded assets from local storage.");
    } else {
      setStatus("Local load: no saved assets found.");
    }
  }, []);

  // ------------------------------
  // AUTO-SAVE TO LOCAL
  // ------------------------------
  useEffect(() => {
    saveLocalAssets(assets);
  }, [assets]);

  // ------------------------------
  // LOCAL LOAD BUTTON
  // ------------------------------
  const handleLocalLoad = () => {
    const local = loadLocalAssets();
    setAssets(local);
    setSelected(null);
    setStatus(
      local.length > 0
        ? `Local load successful: ${local.length} assets.`
        : "Local load: no saved assets found."
    );
  };

  // ------------------------------
  // LOAD FROM SHEETS
  // ------------------------------
  const handleLoadFromSheets = async () => {
    setIsSyncing(true);
    setStatus("Loading from Sheets...");
    try {
      const sheetAssets = await loadFromSheets();
      setAssets(sheetAssets);
      setSelected(null);
      setStatus(`Loaded ${sheetAssets.length} assets from Sheets.`);
    } catch (err: any) {
      console.error(err);
      setStatus(`Error loading from Sheets: ${err.message ?? "check console."}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // ------------------------------
  // SAVE TO SHEETS
  // ------------------------------
  const handleSaveToSheets = async () => {
    if (assets.length === 0) {
      setStatus("No assets to save.");
      return;
    }

    setIsSyncing(true);
    setStatus("Saving to Sheets...");
    try {
      await copyToSheets(assets);
      setStatus(`Saved ${assets.length} assets to Google Sheets.`);
    } catch (err: any) {
      console.error(err);
      setStatus(`Error saving to Sheets: ${err.message ?? "check console."}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // ------------------------------
  // CRUD HANDLERS
  // ------------------------------

  // C: Add new entry
  const handleAdd = () => {
    setSelected({
      id: undefined,
      project: "",
      episode: "",
      scene: "",
      shot: "",
      status: "New",
      notes: "",
      stills: [],
      video: null,
    });
  };

  // R: Select existing row
  const handleSelectAsset = (asset: Asset) => {
    setSelected(asset);
  };

  // U: Save (create or update)
  const handleSaveAsset = (updated: Asset) => {
    setAssets((prev) => {
      const id = updated.id ?? String(Date.now());
      const withId: Asset = { ...updated, id };

      const idx = prev.findIndex((a) => a.id === id);
      if (idx === -1) return [...prev, withId];

      const next = [...prev];
      next[idx] = withId;
      return next;
    });

    setSelected(null);
    setStatus("Asset saved locally. Use 'Save to Sheets' to sync.");
  };

  // D: Delete asset (local)
  const handleDeleteAsset = (asset: Asset) => {
    setAssets((prev) => prev.filter((a) => a.id !== asset.id));
    if (selected && selected.id === asset.id) {
      setSelected(null);
    }
    setStatus("Asset deleted locally. Use 'Save to Sheets' to sync.");
  };

  const handleCancelEdit = () => {
    setSelected(null);
  };

  // ------------------------------
  // RENDER
  // ------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          AnimTrack AI – Asset &amp; Sheet Sync
        </h1>

        <div className="flex gap-2 text-xs">
          <button
            onClick={handleAdd}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700"
          >
            Add Animation Entry
          </button>

          <button
            onClick={handleLocalLoad}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700"
          >
            Local Load
          </button>

          <button
            disabled={isSyncing}
            onClick={handleLoadFromSheets}
            className="px-3 py-1 rounded bg-sky-700 hover:bg-sky-600 disabled:opacity-50"
          >
            {isSyncing ? "Loading..." : "Load from Sheets"}
          </button>

          <button
            disabled={isSyncing}
            onClick={handleSaveToSheets}
            className="px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50"
          >
            {isSyncing ? "Saving..." : "Save to Sheets"}
          </button>
        </div>
      </header>

      {status && (
        <div className="px-4 py-2 border-b border-slate-800 text-xs bg-slate-900/70">
          {status}
        </div>
      )}

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 p-4">
        <section className="border border-slate-800 rounded-lg p-3 bg-slate-900/60">
          <h2 className="text-sm font-semibold mb-2">Edit Panel</h2>

          <EditPanel
            initialAsset={selected}
            onSave={handleSaveAsset}
            onCancel={handleCancelEdit}
          />
        </section>

        <section className="border border-slate-800 rounded-lg p-3 bg-slate-900/60 overflow-hidden">
          <h2 className="text-sm font-semibold mb-2">
            Assets ({assets.length})
          </h2>

          <AssetTable
            assets={assets}
            onSelect={handleSelectAsset}
            onDelete={handleDeleteAsset}
          />
        </section>
      </main>
    </div>
  );
};

export default App;
