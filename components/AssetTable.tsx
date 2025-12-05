// components/AssetTable.tsx
import React from "react";
import { Asset } from "../services/apiService";

interface Props {
  assets: Asset[];
  onSelect: (asset: Asset) => void;
}

const AssetTable: React.FC<Props> = ({ assets, onSelect }) => {
  if (!assets || assets.length === 0) {
    return (
      <div className="px-6 py-10 text-sm text-slate-400 text-center">
        No animation assets tracked yet. Add a new entry on the left to get
        started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400">
          <tr>
            <th className="px-4 py-2 text-left font-medium">Project</th>
            <th className="px-4 py-2 text-left font-medium">Episode</th>
            <th className="px-4 py-2 text-left font-medium">Scene</th>
            <th className="px-4 py-2 text-left font-medium">Shot</th>
            <th className="px-4 py-2 text-left font-medium">Status</th>
            <th className="px-4 py-2 text-left font-medium">Stills</th>
            <th className="px-4 py-2 text-left font-medium">Video</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr
              key={asset.id}
              className="border-b border-slate-800/60 hover:bg-slate-800/40 cursor-pointer"
              onClick={() => onSelect(asset)}
            >
              <td className="px-4 py-2">{asset.project}</td>
              <td className="px-4 py-2">{asset.episode}</td>
              <td className="px-4 py-2">{asset.scene}</td>
              <td className="px-4 py-2">{asset.shot}</td>
              <td className="px-4 py-2 text-xs">
                <span className="inline-flex rounded-full bg-slate-800 px-2 py-1">
                  {asset.status}
                </span>
              </td>
              <td className="px-4 py-2 text-xs text-slate-300">
                {asset.stills && asset.stills.length > 0
                  ? `${asset.stills.length} stills`
                  : "—"}
              </td>
              <td className="px-4 py-2 text-xs text-slate-300">
                {asset.video ? "Yes" : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssetTable;
