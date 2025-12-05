// components/EditPanel.tsx
import React, { useEffect, useState } from "react";
import {
  Asset,
  AssetStatus,
  uploadStills,
  uploadVideo,
} from "../services/apiService";

interface Props {
  initialAsset: Asset | null;
  onSave: (asset: Asset) => void;
  onCancel: () => void;
}

const statusOptions: AssetStatus[] = ["New", "In Progress", "Render", "Done"];

const EditPanel: React.FC<Props> = ({ initialAsset, onSave, onCancel }) => {
  const [asset, setAsset] = useState<Asset | null>(initialAsset);
  const [stillFiles, setStillFiles] = useState<FileList | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Keep local state in sync with props
  useEffect(() => {
    setAsset(initialAsset);
    setStillFiles(null);
    setVideoFile(null);
  }, [initialAsset]);

  if (!asset) {
    return (
      <div className="text-sm text-slate-400">
        Select an asset from the table or click &quot;Add Animation Entry&quot;
        to start.
      </div>
    );
  }

  const updateField = (field: keyof Asset, value: any) => {
    setAsset((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleStillInputChange: React.ChangeEventHandler<HTMLInputElement> = (
    e
  ) => {
    setStillFiles(e.target.files);
  };

  const handleVideoInputChange: React.ChangeEventHandler<HTMLInputElement> = (
    e
  ) => {
    setVideoFile(e.target.files?.[0] || null);
  };

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    if (!asset) return;

    try {
      setIsSaving(true);

      let newStillUrls: string[] = [];
      if (stillFiles && stillFiles.length > 0) {
        const files: File[] = Array.from(stillFiles);
        newStillUrls = await uploadStills(files);
      }

      let newVideoUrl: string | null = null;
      if (videoFile) {
        newVideoUrl = await uploadVideo(videoFile);
      }

      const merged: Asset = {
        ...asset,
        stills: [...(asset.stills || []), ...newStillUrls],
        video: newVideoUrl ?? asset.video,
      };

      onSave(merged);
    } catch (err: any) {
      console.error("Save error:", err);
      window.alert("Failed to save entry. Check backend/logs.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"
    >
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Project</label>
          <input
            type="text"
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
            value={asset.project}
            onChange={(e) => updateField("project", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Episode</label>
            <input
              type="text"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              value={asset.episode}
              onChange={(e) => updateField("episode", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Scene</label>
            <input
              type="text"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              value={asset.scene}
              onChange={(e) => updateField("scene", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Shot</label>
            <input
              type="text"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              value={asset.shot}
              onChange={(e) => updateField("shot", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Status</label>
            <select
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              value={asset.status}
              onChange={(e) =>
                updateField("status", e.target.value as AssetStatus)
              }
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Upload Stills</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleStillInputChange}
            className="block w-full text-xs text-slate-300"
          />
          <div className="mt-1 text-[11px] text-slate-500">
            Existing: {asset.stills?.length || 0} still(s)
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Upload Video</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoInputChange}
            className="block w-full text-xs text-slate-300"
          />
          <div className="mt-1 text-[11px] text-slate-500">
            Existing: {asset.video ? "Yes" : "No"}
          </div>
        </div>
      </div>

      <div className="flex flex-col h-full">
        <div className="flex-1">
          <label className="block text-xs text-slate-400 mb-1">Notes</label>
          <textarea
            className="w-full h-40 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm resize-none"
            value={asset.notes}
            onChange={(e) => updateField("notes", e.target.value)}
          />
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-700 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-full bg-indigo-500 px-4 py-2 text-xs font-medium text-white shadow hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default EditPanel;
