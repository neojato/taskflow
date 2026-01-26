import React from 'react';
import { 
  Circle, 
  Clock, 
  PlayCircle, 
  PauseCircle, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Flag,
  Calendar
} from 'lucide-react';
import { TaskStatus, TaskPriority } from './types.js';

const h = React.createElement;

export const STATUS_ORDER = [
  TaskStatus.BACKLOG,
  TaskStatus.NOT_STARTED,
  TaskStatus.PLANNING,
  TaskStatus.IN_PROGRESS,
  TaskStatus.BLOCKED,
  TaskStatus.DONE
];

export const STATUS_STYLING = {
  [TaskStatus.BACKLOG]: { color: '#94a3b8', bgColor: 'rgba(148, 163, 184, 0.1)', borderColor: 'rgba(148, 163, 184, 0.2)' },
  [TaskStatus.NOT_STARTED]: { color: '#38bdf8', bgColor: 'rgba(56, 189, 248, 0.1)', borderColor: 'rgba(56, 189, 248, 0.2)' },
  [TaskStatus.PLANNING]: { color: '#c084fc', bgColor: 'rgba(192, 132, 252, 0.1)', borderColor: 'rgba(192, 132, 252, 0.2)' },
  [TaskStatus.IN_PROGRESS]: { color: '#fbbf24', bgColor: 'rgba(251, 191, 36, 0.1)', borderColor: 'rgba(251, 191, 36, 0.2)' },
  [TaskStatus.BLOCKED]: { color: '#fb7185', bgColor: 'rgba(251, 113, 133, 0.1)', borderColor: 'rgba(251, 113, 133, 0.2)' },
  [TaskStatus.DONE]: { color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' },
};

export const STATUS_ICONS = {
  [TaskStatus.BACKLOG]: h(Circle, { size: 16 }),
  [TaskStatus.NOT_STARTED]: h(Clock, { size: 16 }),
  [TaskStatus.PLANNING]: h(Calendar, { size: 16 }),
  [TaskStatus.IN_PROGRESS]: h(PlayCircle, { size: 16 }),
  [TaskStatus.BLOCKED]: h(AlertCircle, { size: 16 }),
  [TaskStatus.DONE]: h(CheckCircle2, { size: 16 }),
};

export const PRIORITY_COLORS = {
  [TaskPriority.P0]: '#f43f5e',
  [TaskPriority.P1]: '#f59e0b',
  [TaskPriority.P2]: '#3b82f6',
};

export const PRIORITY_ICONS = {
  [TaskPriority.P0]: h(Zap, { size: 16 }),
  [TaskPriority.P1]: h(Flag, { size: 16 }),
  [TaskPriority.P2]: h(Flag, { size: 16 }),
};