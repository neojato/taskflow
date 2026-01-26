
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
  DragEndEvent
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Paper, Typography, Avatar, LinearProgress } from '@mui/material';
import { GitHubIssue, TaskStatus, TaskPriority } from '../types';
import { STATUS_ORDER, STATUS_STYLING, PRIORITY_ICONS, PRIORITY_COLORS } from '../constants';

interface KanbanCardProps {
  issue: GitHubIssue;
  isOverlay?: boolean;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ issue, isOverlay }) => {
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
          borderColor: 'rgba(56, 189, 248, 0.3)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>#{issue.number}</Typography>
        <Box sx={{ display: 'flex', gap: 0.5, color: PRIORITY_COLORS[issue.priority] }}>
          {PRIORITY_ICONS[issue.priority]}
        </Box>
      </Box>
      <Typography variant="body2" sx={{ 
        mb: 2, 
        fontWeight: 600,
        display: '-webkit-box', 
        WebkitLineClamp: 2, 
        WebkitBoxOrient: 'vertical', 
        overflow: 'hidden' 
      }}>
        {issue.title}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', marginLeft: '4px' }}>
          {issue.assignees.map((a, idx) => (
            <Avatar 
              key={a.login} 
              src={a.avatar_url} 
              sx={{ 
                width: 24, 
                height: 24, 
                border: '2px solid #1e293b',
                marginLeft: idx === 0 ? 0 : '-8px'
              }} 
            />
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
        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: STATUS_STYLING[status].color }} />
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
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>Drop items here</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Added missing interface definition for KanbanViewProps
interface KanbanViewProps {
  issues: GitHubIssue[];
  onUpdateStatus: (issueNumber: number, newStatus: TaskStatus) => Promise<void>;
}

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveIssue(null);

    if (!over) return;

    const activeIssueId = active.id.toString();
    const overId = over.id.toString();

    const draggedIssue = issues.find(i => i.id.toString() === activeIssueId);
    if (!draggedIssue) return;

    if (Object.values(TaskStatus).includes(overId as TaskStatus)) {
      if (draggedIssue.status !== overId) {
        onUpdateStatus(draggedIssue.number, overId as TaskStatus);
      }
    } else {
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
