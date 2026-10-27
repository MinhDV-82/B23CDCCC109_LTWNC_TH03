export type UserRole = 'admin' | 'user';
export type Role = 'guest' | 'user' | 'admin';

export interface Subject {
  id: string;
  slug: string;
  name: string;
  code: string;
  description: string;
  lecturer?: string;
  credits?: number;
}

export interface Deadline {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  dueDate: string; // ISO 8601 (Asia/Ho_Chi_Minh)
  createdAt: string; // ISO 8601 (Asia/Ho_Chi_Minh)
  priority?: 'high' | 'medium' | 'low';
}

export interface Progress {
  userId: string;
  deadlineId: string;
  completedAt: string;
  isCompleted: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
}

export interface DeadlineWithSubject extends Deadline {
  subject?: Subject;
  isCompleted?: boolean;
  completedAt?: string;
}

