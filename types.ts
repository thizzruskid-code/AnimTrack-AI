// types.ts

export interface Asset {
  id: string;
  project: string;
  episode: string;
  sceneId: string;
  shotId: string;
  prompt: string;
  notes: string;
  status: string;
  stills: string[];
  video: string;
  updated: string;
}

export const StatusOption = [
  "New",
  "Queued",
  "Generating",
  "Needs Fix",
  "Done",
  "Archived",
];
