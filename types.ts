
export enum InputType {
  FILE = 'FILE',
  TEXT = 'TEXT'
}

export interface SceneSegment {
  time: string;
  script: string;
  visual: string;
  generatedImageUrl?: string;
  generatedVideoUrl?: string;
}

export interface VideoPlanResponse {
  styleGuide: string;
  scenes: SceneSegment[];
}

export enum FeatureMode {
  SCRIPT_EXTRACT = 'Trích Xuất Script',
  DEEP_ANALYSIS = 'Phân Tích Sâu',
  REMAKE_SCRIPT = 'Remake Kịch Bản',
  TIKTOK_SCRIPT = 'Tạo Script TikTok'
}

export type ImageQuality = '1K' | '2K' | '4K';
export type VideoQuality = '720p' | '1080p';
export type TransitionMode = 'Smooth' | 'KenBurns' | 'Dynamic';

export interface UploadedFileState {
  file: File | null;
  previewUrl: string | null;
  type: 'image' | 'video' | null;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  promptText: string;
  characters?: string[];
  settingPrompt?: string;
  musicFileName?: string;
  inputType: InputType;
  selectedFeature: FeatureMode;
  styleGuide: string;
  scenes: SceneSegment[];
}

export const DURATION_OPTIONS = [
  { label: '15 Giây (Shorts/Story)', value: '15 seconds' },
  { label: '30 Giây (TikTok/Reels)', value: '30 seconds' },
  { label: '60 Giây (Standard)', value: '60 seconds' },
  { label: '90 Giây (Long form)', value: '90 seconds' },
];