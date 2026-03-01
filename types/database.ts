export type EventType = "appointment" | "milestone" | "personal";

export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  type: EventType;
  user_id: string;
  created_at: string;
}

export interface ImportantDate {
  id: string;
  title: string;
  description: string | null;
  date: string;
  user_id: string;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  week: number;
  title: string;
  content: string;
  mood: "happy" | "tired" | "emotional" | "excited";
  user_id: string;
  created_at: string;
}

export interface Memory {
  id: string;
  image_url: string;
  caption: string | null;
  user_id: string;
  created_at: string;
}

export interface WeightLog {
  id: string;
  week: number;
  weight: number;
  user_id: string;
  created_at: string;
}

export interface Kick {
  id: string;
  timestamp: string;
  user_id: string;
}

export interface Contraction {
  id: string;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  user_id: string;
  created_at: string;
}

export interface Letter {
  id: string;
  title: string;
  content: string;
  created_at: string;
}
