import React, { useMemo } from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { STATUS_STYLING } from '../constants.js';

const h = React.createElement;

export default function RoadmapView({ issues, onIssueClick }) {
  const roadmapIssues = useMemo(() => [...issues].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)), [issues]);

  return h(Box, { sx: { bgcolor: '#020617', borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' } },
    roadmapIssues.map(issue => {
      const style = STATUS_STYLING[issue.status];
      return h(Box, { 
        key: issue.id, 
        onClick: () => onIssueClick(issue),
        sx: { 
          display: 'flex', 
          p: 2, 
          borderBottom: '1px solid rgba(255,255,255,0.05)', 
          alignItems: 'center',
          cursor: 'pointer',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }
        } 
      },
        h(Box, { sx: { width: 300, display: 'flex', alignItems: 'center', gap: 2 } },
          h(Avatar, { src: issue.user.avatar_url, sx: { width: 24, height: 24 } }),
          h(Typography, { variant: "body2", noWrap: true, fontWeight: 500 }, issue.title)
        ),
        h(Box, { sx: { flexGrow: 1, display: 'flex', alignItems: 'center', ml: 4 } },
          h(Box, { sx: { width: '100%', height: 12, bgcolor: style.color, borderRadius: 6, opacity: 0.6 } })
        )
      );
    })
  );
}