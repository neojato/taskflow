
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
import { TaskStatus, TaskPriority } from './types';

export const STATUS_ORDER = [
  TaskStatus.BACKLOG,
  TaskStatus.NOT_STARTED,
  TaskStatus.PLANNING,
  TaskStatus.IN_PROGRESS,
  TaskStatus.BLOCKED,
  TaskStatus.DONE
];

export const STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
  [TaskStatus.NOT_STARTED]: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
  [TaskStatus.PLANNING]: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  [TaskStatus.IN_PROGRESS]: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  [TaskStatus.BLOCKED]: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  [TaskStatus.DONE]: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
};

export const STATUS_ICONS: Record<TaskStatus, React.ReactNode> = {
  [TaskStatus.BACKLOG]: <Circle className="w-4 h-4" />,
  [TaskStatus.NOT_STARTED]: <Clock className="w-4 h-4" />,
  [TaskStatus.PLANNING]: <Calendar className="w-4 h-4" />,
  [TaskStatus.IN_PROGRESS]: <PlayCircle className="w-4 h-4" />,
  [TaskStatus.BLOCKED]: <AlertCircle className="w-4 h-4" />,
  [TaskStatus.DONE]: <CheckCircle2 className="w-4 h-4" />,
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  [TaskPriority.P0]: 'text-rose-500',
  [TaskPriority.P1]: 'text-amber-500',
  [TaskPriority.P2]: 'text-blue-500',
};

export const PRIORITY_ICONS: Record<TaskPriority, React.ReactNode> = {
  [TaskPriority.P0]: <Zap className="w-4 h-4" />,
  [TaskPriority.P1]: <Flag className="w-4 h-4" />,
  [TaskPriority.P2]: <Flag className="w-4 h-4" />,
};
