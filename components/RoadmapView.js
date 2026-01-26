import React, { useMemo } from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { STATUS_STYLING } from '../constants.js';

export default function RoadmapView({ issues }) {
  const roadmapIssues = useMemo(() => [...issues].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)), [issues]);

  return (
    <Box sx={{ bgcolor: '#020617', borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
      {roadmapIssues.map(issue => {
        const style = STATUS_STYLING[issue.status];
        return (
          <Box key={issue.id} sx={{ display: 'flex', p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Box sx={{ width: 300, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar src={issue.user.avatar_url} sx={{ width: 24, height: 24 }} />
              <Typography variant="body2" noWrap>{issue.title}</Typography>
            </Box>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: '100%', height: 20, bgcolor: style.color, borderRadius: 1, opacity: 0.7 }} />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}