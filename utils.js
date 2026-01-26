import { TaskStatus, TaskPriority } from './types.js';

export const parseProgress = (body) => {
  if (!body) return 0;
  const taskListRegex = /- \[(x| )\]/g;
  const matches = body.match(taskListRegex);
  if (!matches) return 0;
  const completed = matches.filter(m => m.includes('[x]')).length;
  return Math.round((completed / matches.length) * 100);
};

export const mapStatusFromLabels = (labels) => {
  const statusLabels = Object.values(TaskStatus);
  const found = labels.find(l => statusLabels.includes(l.name));
  return found?.name || TaskStatus.NOT_STARTED;
};

export const mapPriorityFromLabels = (labels) => {
  const priorityLabels = Object.values(TaskPriority);
  const found = labels.find(l => priorityLabels.includes(l.name));
  return found?.name || TaskPriority.P2;
};

export const processIssue = (issue) => {
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

export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};