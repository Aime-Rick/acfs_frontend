export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Mission {
  id: string; // Changed from number to string for UUID
  name: string;
  context?: string;
  objectif?: string;
  problem?: string;
  created_at: string;
  user_id: string;
  form_url?: string;
  form_id?: string;
  contraintes?: string;
  kpis?: string;
  outils?: string;
}

export interface CreateMissionData {
  name: string;
  context?: string;
  objectif?: string;
  problem?: string;
  contraintes?: string;
  kpis?: string;
  outils?: string;
  user_id?: string; // Added user_id to CreateMissionData
}

export interface ScopeOutput {
  context: string;
  problematique: string;
  objectives: string[];
  kpis: string;
  contraintes: string[];
  outils: string;
}

export interface ApiKeys {
  SUPABASE_URL?: string;
  SUPABASE_API_KEY?: string;
  ALLOWED_ORIGINS?: string;
  RESEND_API_KEY?: string;
  TALLY_API_KEY?: string;
  OPENAI_API_KEY?: string;
  TAVILY_API_KEY?: string;
}
