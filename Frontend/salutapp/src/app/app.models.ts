export interface ApiPage<T> {
  data: T[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

export interface AppUser {
  id: number;
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

export interface ChatParticipant {
  id?: number;
  user_id?: number;
  user?: AppUser | null;
}

export interface ChatMessage {
  id: number;
  chat_id: number;
  sender_id: number;
  body?: string | null;
  created_at?: string | null;
  sender?: AppUser | null;
}

export interface ChatThread {
  id: number;
  participants?: ChatParticipant[];
  messages?: ChatMessage[];
  updated_at?: string | null;
}

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface VerificationRequest {
  id: number;
  user_id: number;
  role: 'health' | 'company';
  status: VerificationStatus;
  created_at?: string | null;
  user?: AppUser | null;
}

export type ReportStatus = 'open' | 'resolved' | 'dismissed';

export interface ModerationReport {
  id: number;
  reporter_id: number;
  target_type: string;
  target_id: number;
  reason: string;
  status: ReportStatus;
  created_at?: string | null;
  reporter?: AppUser | null;
}
