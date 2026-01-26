import React, { useState } from 'react';
import { DndContext, closestCorners, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Paper, Typography } from '@mui/material';
import { STATUS_ORDER, STATUS_STYLING } from '../constants.js';
import { TaskStatus } from '../types.js';

const h = React.createElement;

function KanbanCard({ issue }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: issue.id.toString() });
  const style = { transform: CSS.Translate.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return h(Paper, { 
    ref: setNodeRef, 
    style: style, 
    ...attributes, 
    ...listeners, 
    sx: { p: 2, mb: 1.5, cursor: 'grab', bgcolor: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' } 
  },
    h(Typography, { variant: "body2", fontWeight: "600", gutterBottom: true }, issue.title),
    h(Typography, { variant: "caption", color: "text.disabled" }, `#${issue.number}`)
  );
}

export default function KanbanView({ issues, onUpdateStatus }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    const draggedIssue = issues.find(i => i.id.toString() === active.id);
    const newStatus = Object.values(TaskStatus).includes(over.id) ? over.id : issues.find(i => i.id.toString() === over.id)?.status;
    if (draggedIssue && newStatus && draggedIssue.status !== newStatus) {
      onUpdateStatus(draggedIssue.number, newStatus);
    }
  };

  return h(Box, { sx: { display: 'flex', overflowX: 'auto', gap: 3, height: '100%', pb: 4 } },
    h(DndContext, { sensors: sensors, collisionDetection: closestCorners, onDragEnd: handleDragEnd },
      STATUS_ORDER.map(status => (
        h(Box, { key: status, sx: { minWidth: 300, width: 300, display: 'flex', flexDirection: 'column' } },
          h(Typography, { variant: "subtitle2", gutterBottom: true, sx: { color: STATUS_STYLING[status].color, fontWeight: 700, px: 1, mb: 2 } }, status),
          h(Box, { sx: { bgcolor: 'rgba(255,255,255,0.02)', p: 1.5, borderRadius: 3, minHeight: 400, flexGrow: 1 } },
            h(SortableContext, { items: issues.filter(i => i.status === status).map(i => i.id.toString()), strategy: verticalListSortingStrategy },
              issues.filter(i => i.status === status).map(issue => h(KanbanCard, { key: issue.id, issue: issue }))
            )
          )
        )
      ))
    )
  );
}