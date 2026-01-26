import { GitHubIssue, TaskStatus, TaskPriority, GitHubLabel } from './types.ts';

export const parseProgress = (body: string | null): number => {
  if (!body) return 0;
  const taskListRegex = /- \[(x| )\]/g;
  const matches = body.match(taskListRegex);
  if (!matches) return 0;
  const completed = matches.filter(m => m.includes('[x]')).length;
  return Math.round((completed / matches.length) * 100);
};

export const mapStatusFromLabels = (labels: GitHubLabel[]): TaskStatus => {
  const statusLabels = Object.values(TaskStatus);
  const found = labels.find(l => statusLabels.includes(l.name as TaskStatus));
  return (found?.name as TaskStatus) || TaskStatus.NOT_STARTED;
};

export const mapPriorityFromLabels = (labels: GitHubLabel[]): TaskPriority => {
  const priorityLabels = Object.values(TaskPriority);
  const found = labels.find(l => priorityLabels.includes(l.name as TaskPriority));
  return (found?.name as TaskPriority) || TaskPriority.P2;
};

export const processIssue = (issue: any): GitHubIssue => {
  const status = mapStatusFromLabels(issue.labels);
  const priority = mapPriorityFromLabels(issue.labels);
  const progress = parseProgress(issue.body);

  return {
    ...issue,
    status,
    priority,
    progress
  };
};

export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};