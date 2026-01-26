import React, { useState } from 'react';
import { DndContext, closestCorners, useSensor, useSensors, PointerSensor, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Paper, Typography, Avatar } from '@mui/material';
import { STATUS_ORDER, STATUS_STYLING } from '../constants.js';
import { TaskStatus } from '../types.js';

function KanbanCard({ issue }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: issue.id.toString() });
  const style = { transform: CSS.Translate.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <Paper ref={setNodeRef} style={style} {...attributes} {...listeners} sx={{ p: 2, mb: 1, cursor: 'grab', bgcolor: '#1e293b' }}>
      <Typography variant="body2" fontWeight="600">{issue.title}</Typography>
      <Typography variant="caption" color="text.secondary">#{issue.number}</Typography>
    </Paper>
  );
}

export default function KanbanView({ issues, onUpdateStatus }) {
  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    const draggedIssue = issues.find(i => i.id.toString() === active.id);
    const newStatus = Object.values(TaskStatus).includes(over.id) ? over.id : issues.find(i => i.id.toString() === over.id)?.status;
    if (draggedIssue && newStatus && draggedIssue.status !== newStatus) {
      onUpdateStatus(draggedIssue.number, newStatus);
    }
  };

  return (
    <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2, height: '100%' }}>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        {STATUS_ORDER.map(status => (
          <Box key={status} sx={{ minWidth: 280, width: 280 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: STATUS_STYLING[status].color }}>{status}</Typography>
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.02)', p: 1, borderRadius: 2, minHeight: 200 }}>
              <SortableContext items={issues.filter(i => i.status === status).map(i => i.id.toString())} strategy={verticalListSortingStrategy}>
                {issues.filter(i => i.status === status).map(issue => <KanbanCard key={issue.id} issue={issue} />)}
              </SortableContext>
            </Box>
          </Box>
        ))}
      </DndContext>
    </Box>
  );
}