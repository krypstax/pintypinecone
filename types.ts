
export enum SEOIntensity {
  MINIMAL = 'Minimal',
  BALANCED = 'Balanced',
  AGGRESSIVE = 'Aggressive SEO'
}

export enum VisualStyle {
  MINIMAL = 'Minimal',
  LIFESTYLE = 'Lifestyle',
  LUXURY = 'Luxury',
  INFORMATIONAL = 'Informational'
}

export enum AudienceFocus {
  BUYERS = 'Buyers',
  BROWSERS = 'Browsers',
  DIY = 'DIY Users',
  PROFESSIONALS = 'Professionals'
}

export interface AppSettings {
  webResearch: boolean;
  verticalImageCount: number;
  seoIntensity: SEOIntensity;
  visualStyle: VisualStyle;
  audienceFocus: AudienceFocus;
}

export interface ImagePrompt {
  prompt: string;
  aspectRatio: "1:1" | "9:16" | "4:3";
  layoutType: string;
}

export interface ContentPack {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  altText: string;
  keywords: string[];
  prompt: string;
}

export interface ProcessState {
  step: 'idle' | 'locking_identity' | 'analyzing' | 'generating_prompts' | 'creating_images' | 'verifying_fidelity' | 'generating_metadata' | 'complete' | 'error';
  progress: number;
  subStatus?: string;
  error?: string;
}
