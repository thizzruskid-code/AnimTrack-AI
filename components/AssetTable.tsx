import React from "react";
import { Asset } from "../services/apiService";

interface Props {
  assets: Asset[];
  setSelected: (asset: Asset) => void;
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: "asc" | "desc" | null } | null;
}

const statusColors: Record<string, string> = {
  new: "bg-blue-600",
  queued: "bg-purple-600",
  generating: "bg-yellow-500 text-black",
  "needs fix": "bg-amber-600",
  done: "bg-green-600",
  archived: "bg-slate-600",
};

const AssetTable: React.FC<Props> = ({
  assets,
  setSelected,
  onSort,
  sortConfig,
}) => {
  const getSortIcon = (column: string) => {
    if (!sortConfig || sortConfig.key !== column) return "⇅";
    if (sortConfig.direction === "asc") return "↑";
    if (sortConfig.direction === "desc") return "↓";
    return "⇅";
  };

  if (!assets || assets.length === 0) {
    return (
      <div className="px-6 py-10 text-sm text-slate-400 text-center">
        No tracked assets.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950/60">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400">
          <tr>
            {[
              ["project", "Project"],
              ["episode", "Episode"],
              ["scene", "Scene"],
              ["shot", "Shot"],
              ["status", "Status"],
            ].map(([key, label]) => (
              <th
                key={key}
                className="px-4 py-2 text-left cursor-pointer select-none"
                onClick={() => onSort(key)}
              >
                {label} <span className="opacity-70">{getSortIcon(key)}</span>
              </th>
            ))}

            <th className="px-4 py-2 text-left">Stills</th>
            <th className="px-4 py-2 text-left">Video</th>
          </tr>
        </thead>

        <tbody>
          {assets.map((asset) => {
            const statusColor =
              statusColors[asset.status?.toLowerCase()] ?? "bg-slate-700";

            const thumbs = (asset.stills ?? []).slice(0, 3);
            const more = (asset.stills ?? []).length - thumbs.length;

            return (
              <tr
                key={asset.id}
                className="border-b border-slate-800/60 hover:bg-slate-800/40 cursor-pointer"
                onClick={() => setSelected(asset)}
              >
                <td className="px-4 py-2 text-slate-100">{asset.project}</td>
                <td className="px-4 py-2 text-slate-100">{asset.episode}</td>
                <td className="px-4 py-2 text-slate-100">{asset.scene}</td>
                <td className="px-4 py-2 text-slate-100">{asset.shot}</td>

                <td className="px-4 py-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-[11px] text-white ${statusColor}`}
                  >
                    {asset.status || "—"}
                  </span>
                </td>

                <td className="px-4 py-2 flex gap-1 items-center">
                  {thumbs.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      className="w-8 h-8 rounded-md object-cover border border-slate-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(url, "_blank");
                      }}
                    />
                  ))}

                  {more > 0 && (
                    <span className="rounded-md bg-slate-800 px-2 py-1 text-[11px] text-slate-300">
                      +{more}
                    </span>
                  )}

                  {thumbs.length === 0 && (
                    <span className="text-slate-500 text-xs">—</span>
                  )}
                </td>

                <td className="px-4 py-2 text-xs text-slate-300">
                  {asset.video ? "Yes" : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AssetTable;
