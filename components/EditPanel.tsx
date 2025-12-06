import React, { useState } from "react";
import {
  Asset,
  uploadStills,
  uploadVideo,
} from "../services/apiService";

interface Props {
  asset: Asset;
  onAssetUpdated: (asset: Asset) => void;
  close: () => void;
  onDelete: () => void;
}

const STATUS_OPTIONS = [
  "New",
  "Queued",
  "Generating",
  "Needs Fix",
  "Done",
  "Archived",
];

const EditPanel: React.FC<Props> = ({
  asset,
  onAssetUpdated,
  close,
  onDelete,
}) => {
  const [form, setForm] = useState<Asset>({ ...asset });
  const [stillsFiles, setStillsFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const updateField = (field: keyof Asset, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    try {
      let newStills = form.stills || [];
      let newVideo = form.video ?? null;

      if (stillsFiles.length > 0) {
        const uploaded = await uploadStills(stillsFiles);
        newStills = [...newStills, ...uploaded];
      }

      if (videoFile) newVideo = await uploadVideo(videoFile);

      onAssetUpdated({ ...form, stills: newStills, video: newVideo });
      close();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">

      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold">Edit Asset</h3>
        <button
          onClick={close}
          className="text-xs text-slate-400 hover:text-slate-100"
        >
          Close
        </button>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 gap-3 text-xs">

        {/* Project / Episode */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-slate-400">Project</label>
            <input
              className="w-full rounded-md border border-slate-700 bg-slate-900/70 px-2 py-1.5 text-xs focus:ring-purple-500 focus:ring-1"
              value={form.project}
              onChange={(e) => updateField("project", e.target.value)}
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400">Episode</label>
            <input
              className="w-full rounded-md border border-slate-700 bg-slate-900/70 px-2 py-1.5 text-xs focus:ring-purple-500 focus:ring-1"
              value={form.episode}
              onChange={(e) => updateField("episode", e.target.value)}
            />
          </div>
        </div>

        {/* Scene / Shot */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-slate-400">Scene</label>
            <input
              className="w-full rounded-md border border-slate-700 bg-slate-900/70 px-2 py-1.5 text-xs focus:ring-purple-500 focus:ring-1"
              value={form.scene}
              onChange={(e) => updateField("scene", e.target.value)}
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400">Shot</label>
            <input
              className="w-full rounded-md border border-slate-700 bg-slate-900/70 px-2 py-1.5 text-xs focus:ring-purple-500 focus:ring-1"
              value={form.shot}
              onChange={(e) => updateField("shot", e.target.value)}
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="text-[11px] text-slate-400">Status</label>
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900/70 px-2 py-2 text-xs focus:ring-purple-500 focus:ring-1"
            value={form.status}
            onChange={(e) => updateField("status", e.target.value)}
          >
            <option value="">Select status...</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="text-[11px] text-slate-400">Notes</label>
          <textarea
            className="w-full rounded-md border border-slate-700 bg-slate-900/70 px-2 py-2 h-28 text-xs resize-none focus:ring-purple-500 focus:ring-1"
            value={form.notes ?? ""}
            onChange={(e) => updateField("notes", e.target.value)}
          />
        </div>

        {/* Stills */}
        <div>
          <label className="text-[11px] text-slate-400">Upload Stills</label>
          <input
            type="file"
            multiple
            className="text-[11px] text-slate-300 file:bg-slate-800 file:border-0 file:px-3 file:py-1.5 file:rounded-md hover:file:bg-slate-700"
            onChange={(e) => {
              if (e.target.files) setStillsFiles(Array.from(e.target.files));
            }}
          />
        </div>

        {/* Video */}
        <div>
          <label className="text-[11px] text-slate-400">Upload Video</label>
          <input
            type="file"
            accept="video/*"
            className="text-[11px] text-slate-300 file:bg-slate-800 file:border-0 file:px-3 file:py-1.5 file:rounded-md hover:file:bg-slate-700"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setVideoFile(e.target.files[0]);
              }
            }}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-3 py-1.5 bg-slate-100 text-slate-900 rounded-md text-xs hover:bg-white"
          >
            Save
          </button>

          <button
            onClick={close}
            className="px-3 py-1.5 bg-slate-900/80 border border-slate-700 rounded-md text-xs hover:bg-slate-800"
          >
            Cancel
          </button>
        </div>

        <button
          onClick={onDelete}
          className="px-3 py-1.5 bg-red-600 rounded-md text-xs text-white hover:bg-red-500"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default EditPanel;
