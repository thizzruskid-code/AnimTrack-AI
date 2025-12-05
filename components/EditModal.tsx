// components/EditModal.tsx
// FULL FILE — Rich editor with stills + prompt + metadata

import React, { useState } from "react";
import { uploadVideoToServer, uploadImageToServer } from "../services/apiService";
import type { AnimationEntry } from "../types";

interface Props {
  entry: AnimationEntry;
  onSave: (updated: AnimationEntry) => void;
  onClose: () => void;
}

const EditModal: React.FC<Props> = ({ entry, onSave, onClose }) => {
  const [localEntry, setLocalEntry] = useState<AnimationEntry>({
    ...entry,
    stillUrls: entry.stillUrls || [],
  });
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const updateField = (key: keyof AnimationEntry, value: any) => {
    setLocalEntry({
      ...localEntry,
      [key]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleVideoPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    try {
      const uploaded = await uploadVideoToServer(file);
      updateField("videoUrl", uploaded.url);
    } catch (err) {
      console.error("Video upload failed:", err);
      alert("Failed to upload video.");
    }
    setUploadingVideo(false);
  };

  const handleStillsPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadingImages(true);

    try {
      const newUrls: string[] = [];
      for (const file of files) {
        const uploaded = await uploadImageToServer(file);
        newUrls.push(uploaded.url);
      }
      const existing = localEntry.stillUrls || [];
      updateField("stillUrls", [...existing, ...newUrls]);
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Failed to upload one or more images.");
    }

    setUploadingImages(false);
  };

  const handleSave = () => {
    onSave(localEntry);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit Asset</h2>

        <label>Cartoon / Project Name</label>
        <input
          value={localEntry.projectName}
          onChange={(e) => updateField("projectName", e.target.value)}
          placeholder="e.g. Space Bear & Her Kitty Cat Acolytes"
        />

        <label>Episode</label>
        <input
          value={localEntry.episode}
          onChange={(e) => updateField("episode", e.target.value)}
          placeholder="e.g. 101"
        />

        <label>Scene ID</label>
        <input
          value={localEntry.sceneId}
          onChange={(e) => updateField("sceneId", e.target.value)}
          placeholder="e.g. SC-01"
        />

        <label>Shot ID</label>
        <input
          value={localEntry.shotId}
          onChange={(e) => updateField("shotId", e.target.value)}
          placeholder="e.g. SH-01"
        />

        <label>Prompt</label>
        <textarea
          value={localEntry.prompt}
          onChange={(e) => updateField("prompt", e.target.value)}
          placeholder="Text prompt used to generate the animation"
        />

        <label>Notes & Context</label>
        <textarea
          value={localEntry.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          placeholder="Director notes, reshoot details, camera info, etc."
        />

        <label>Status</label>
        <select
          value={localEntry.status}
          onChange={(e) => updateField("status", e.target.value as any)}
        >
          <option value="new">New</option>
          <option value="in-progress">In Progress</option>
          <option value="needs-review">Needs Review</option>
          <option value="complete">Complete</option>
        </select>

        <label>Storyboard / Reference Stills</label>
        <input type="file" accept="image/*" multiple onChange={handleStillsPick} />
        {uploadingImages && <p>Uploading stills…</p>}

        {localEntry.stillUrls && localEntry.stillUrls.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            {localEntry.stillUrls.map((url) => (
              <img
                key={url}
                src={url}
                alt="still"
                style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 4 }}
              />
            ))}
          </div>
        )}

        <label>Video</label>
        <input type="file" accept="video/*" onChange={handleVideoPick} />
        {uploadingVideo && <p>Uploading video…</p>}

        {localEntry.videoUrl && !uploadingVideo && (
          <video
            src={localEntry.videoUrl}
            controls
            style={{ width: "100%", marginTop: 10 }}
          />
        )}

        <div className="modal-buttons">
          <button onClick={handleSave}>Save</button>
          <button className="cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
