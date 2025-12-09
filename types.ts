export enum Tone {
  CASUAL = 'Casual',
  PROFESSIONAL = 'Professional',
  FRIENDLY = 'Friendly',
  CONFIDENT = 'Confident',
  EMPATHETIC = 'Empathetic',
  ACADEMIC = 'Academic',
  WITTY = 'Witty',
  DRAMATIC = 'Dramatic'
}

export enum Strength {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  MAXIMUM = 'Maximum' // "Nuclear" option for bypass
}

export enum Purpose {
  GENERAL = 'General',
  ESSAY = 'Essay/Paper',
  EMAIL = 'Email',
  BLOG = 'Blog/Article',
  STORY = 'Creative Story',
  COVER_LETTER = 'Cover Letter',
  MARKETING = 'Marketing Copy'
}

export enum Readability {
  STANDARD = 'Standard',
  SIMPLE = 'Simple (5th Grade)',
  HIGH_SCHOOL = 'High School',
  UNIVERSITY = 'University',
  PHD = 'PhD / Technical'
}

export interface HumanizeOptions {
  tone: Tone;
  strength: Strength;
  purpose: Purpose;
  readability: Readability;
}

export interface StreamState {
  isStreaming: boolean;
  content: string;
  error: string | null;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  original: string;
  humanized: string;
  tone: Tone;
  strength: Strength;
}

export interface AIDetectionResult {
  score: number; // 0 to 100 (0 = Human, 100 = AI)
  verdict: 'Human' | 'Mixed' | 'AI-Generated';
  analysis: string;
}