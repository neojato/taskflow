import React, { useMemo } from 'react';
import { Box, Typography, Tooltip, Avatar } from '@mui/material';
import { GitHubIssue } from '../types';
import { STATUS_STYLING } from '../constants';

interface RoadmapViewProps {
  issues: GitHubIssue[];
}

const RoadmapView: React.FC<RoadmapViewProps> = ({ issues }) => {
  const daysToShow = 90;
  const startDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  }, []);

  const timelineDays = Array.from({ length: daysToShow }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d;
  });

  const getPosition = (dateStr: string) => {
    const date = new Date(dateStr);
    const diffTime = date.getTime() - startDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return (diffDays / daysToShow) * 100;
  };

  const roadmapIssues = useMemo(() => {
    return [...issues]
      .filter(i => i.state === 'open' || new Date(i.updated_at) > startDate)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [issues, startDate]);

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: '#020617', 
      borderRadius: 3, 
      overflow: 'hidden', 
      border: '1px solid rgba(255,255,255,0.05)' 
    }}>
      <Box sx={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(255,255,255,0.02)' }}>
        <Box sx={{ width: 300, minWidth: 300, p: 2, borderRight: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Issue</Typography>
        </Box>
        <Box sx={{ flexGrow: 1, position: 'relative', height: 60 }}>
          {timelineDays.filter(d => d.getDate() === 1).map((d, idx) => (
            <Box key={idx} sx={{ 
              position: 'absolute', 
              left: `${getPosition(d.toISOString())}%`, 
              top: 10,
              pl: 1,
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              height: 40
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>
                {d.toLocaleDateString(undefined, { month: 'short' })}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', '&::-webkit-scrollbar': { width: 4 } }}>
        {roadmapIssues.map((issue) => {
          const startPos = Math.max(0, getPosition(issue.created_at));
          const defaultDue = new Date(issue.created_at);
          defaultDue.setDate(defaultDue.getDate() + 14);
          const endPos = Math.min(100, getPosition(issue.milestone?.due_on || defaultDue.toISOString()));
          const width = Math.max(2, endPos - startPos);
          const style = STATUS_STYLING[issue.status];

          return (
            <Box key={issue.id} sx={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.03)', '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
              <Box sx={{ width: 300, minWidth: 300, p: 1.5, borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar src={issue.user.avatar_url} sx={{ width: 20, height: 20 }} />
                <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                  {issue.title}
                </Typography>
              </Box>
              <Box sx={{ flexGrow: 1, position: 'relative', height: 50, display: 'flex', alignItems: 'center' }}>
                <Tooltip title={`${issue.title} (${issue.status})`}>
                  <Box sx={{ 
                    position: 'absolute', 
                    left: `${startPos}%`, 
                    width: `${width}%`, 
                    height: 24, 
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    px: 1,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    bgcolor: style.color,
                    border: `1px solid ${style.borderColor}`,
                    opacity: 0.8,
                    '&:hover': { opacity: 1, transform: 'scaleY(1.1)', transition: 'all 0.1s' }
                  }}>
                    <Typography variant="caption" sx={{ color: 'white', whiteSpace: 'nowrap', fontSize: '0.65rem', fontWeight: 700 }}>
                      {issue.progress > 0 ? `${issue.progress}%` : ''}
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>
            </Box>
          );
        })}
        {roadmapIssues.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.disabled">No issues to display on roadmap.</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default RoadmapView;