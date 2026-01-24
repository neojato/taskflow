
import React, { useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Paper, Typography, Avatar, LinearProgress, Tooltip } from '@mui/material';
import { GitHubIssue, TaskStatus, TaskPriority } from '../types';
import { STATUS_ORDER, STATUS_COLORS, PRIORITY_ICONS, PRIORITY_COLORS } from '../constants';

interface KanbanViewProps {
  issues: GitHubIssue[];
  onUpdateStatus: (issueNumber: number, newStatus: TaskStatus) => void;
}

const KanbanCard: React.FC<{ issue: GitHubIssue; isOverlay?: boolean }> = ({ issue, isOverlay }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: issue.id.toString(), data: { issue } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: isOverlay ? 'grabbing' : 'grab',
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        p: 2,
        mb: 1.5,
        borderRadius: 2,
        bgcolor: '#1e293b',
        border: '1px solid rgba(255,255,255,0.05)',
        '&:hover': {
          border: '1px solid rgba(56, 189, 248, 0.3)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
        <Typography variant="caption" color="text.disabled">#{issue.number}</Typography>
        <Box sx={{ display: 'flex', gap: 0.5, color: PRIORITY_COLORS[issue.priority] }}>
          {PRIORITY_ICONS[issue.priority]}
        </Box>
      </Box>
      <Typography variant="body2" fontWeight="600" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {issue.title}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box className="flex -space-x-1">
          {issue.assignees.map((a) => (
            <Avatar key={a.login} src={a.avatar_url} sx={{ width: 24, height: 24, border: '2px solid #1e293b' }} />
          ))}
        </Box>
        {issue.progress > 0 && (
          <Box sx={{ width: '60px' }}>
            <LinearProgress 
              variant="determinate" 
              value={issue.progress} 
              sx={{ height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)' }} 
            />
          </Box>
        )}
      </Box>
    </Paper>
  );
};

const KanbanColumn: React.FC<{ status: TaskStatus; issues: GitHubIssue[] }> = ({ status, issues }) => {
  const { setNodeRef } = useSortable({ id: status });

  return (
    <Box 
      ref={setNodeRef}
      sx={{ 
        width: 300, 
        minWidth: 300, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        mr: 2
      }}
    >
      <Box sx={{ mb: 2, px: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle2" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component="span" className={`w-2 h-2 rounded-full ${STATUS_COLORS[status].split(' ')[0].replace('text-', 'bg-')}`} />
          {status}
        </Typography>
        <Typography variant="caption" sx={{ bgcolor: 'rgba(255,255,255,0.05)', px: 1, py: 0.25, borderRadius: 1, color: 'text.secondary' }}>
          {issues.length}
        </Typography>
      </Box>
      
      <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        pb: 4,
        '&::-webkit-scrollbar': { display: 'none' } 
      }}>
        <SortableContext items={issues.map(i => i.id.toString())} strategy={verticalListSortingStrategy}>
          {issues.map((issue) => (
            <KanbanCard key={issue.id} issue={issue} />
          ))}
        </SortableContext>
        {issues.length === 0 && (
          <Box sx={{ 
            height: 100, 
            border: '2px dashed rgba(255,255,255,0.05)', 
            borderRadius: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Typography variant="caption" color="text.disabled">Drop items here</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

const KanbanView: React.FC<KanbanViewProps> = ({ issues, onUpdateStatus }) => {
  const [activeIssue, setActiveIssue] = useState<GitHubIssue | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const issue = issues.find(i => i.id.toString() === active.id);
    if (issue) setActiveIssue(issue);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Optional: add logic for temporary state transitions during hover
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveIssue(null);

    if (!over) return;

    const activeIssueId = active.id.toString();
    const overId = over.id.toString();

    // If dropped over a column or an item in a different column
    const draggedIssue = issues.find(i => i.id.toString() === activeIssueId);
    if (!draggedIssue) return;

    // Is overId a column name?
    if (Object.values(TaskStatus).includes(overId as TaskStatus)) {
      if (draggedIssue.status !== overId) {
        onUpdateStatus(draggedIssue.number, overId as TaskStatus);
      }
    } else {
      // Is overId an issue id?
      const targetIssue = issues.find(i => i.id.toString() === overId);
      if (targetIssue && targetIssue.status !== draggedIssue.status) {
        onUpdateStatus(draggedIssue.number, targetIssue.status);
      }
    }
  };

  return (
    <Box sx={{ height: '100%', overflowX: 'auto', display: 'flex', pb: 2 }}>
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCorners} 
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {STATUS_ORDER.map((status) => (
          <KanbanColumn 
            key={status} 
            status={status} 
            issues={issues.filter(i => i.status === status)} 
          />
        ))}
        
        <DragOverlay>
          {activeIssue ? <KanbanCard issue={activeIssue} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </Box>
  );
};

export default KanbanView;
