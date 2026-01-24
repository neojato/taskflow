
export enum TaskStatus {
  BACKLOG = 'Backlog',
  NOT_STARTED = 'Not Started',
  PLANNING = 'Planning',
  IN_PROGRESS = 'In-Progress',
  BLOCKED = 'Blocked',
  DONE = 'Done'
}

export enum TaskPriority {
  P0 = 'P0',
  P1 = 'P1',
  P2 = 'P2'
}

export interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface GitHubLabel {
  id: number;
  name: string;
  color: string;
  description?: string;
}

export interface GitHubMilestone {
  id: number;
  title: string;
  due_on: string | null;
  state: 'open' | 'closed';
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  user: GitHubUser;
  labels: GitHubLabel[];
  assignees: GitHubUser[];
  created_at: string;
  updated_at: string;
  milestone: GitHubMilestone | null;
  html_url: string;
  // Derived fields
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
}

export interface AppConfig {
  pat: string;
  repo: string; // owner/repo
}
