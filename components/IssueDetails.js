import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Dialog, DialogTitle, DialogContent, 
  IconButton, Chip, Divider, Avatar, List, ListItem, 
  ListItemAvatar, ListItemText, Tab, Tabs, CircularProgress,
  Paper
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Comment as CommentIcon, 
  History as HistoryIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { STATUS_STYLING, STATUS_ICONS, PRIORITY_COLORS } from '../constants.js';

const h = React.createElement;

export default function IssueDetails({ issue, repo, githubService, onClose }) {
  const [tab, setTab] = useState(0);
  const [comments, setComments] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!issue || !githubService || !repo) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [commentsData, eventsData] = await Promise.all([
          githubService.getIssueComments(repo, issue.number),
          githubService.getIssueEvents(repo, issue.number)
        ]);
        setComments(commentsData || []);
        setEvents(eventsData || []);
      } catch (err) {
        console.error("Failed to fetch issue details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [issue, repo, githubService]);

  if (!issue) return null;

  const statusStyle = STATUS_STYLING[issue.status] || { color: '#fff' };

  return h(Dialog, { 
    open: !!issue, 
    onClose: onClose, 
    fullWidth: true, 
    maxWidth: "md",
    PaperProps: {
      sx: { bgcolor: '#0f172a', borderRadius: 3, minHeight: '60vh' }
    }
  },
    h(DialogTitle, { sx: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 } },
      h(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 } },
        h(Typography, { variant: "h6", fontWeight: 700 }, `#${issue.number} ${issue.title}`),
        h(Chip, { 
          label: issue.status, 
          size: "small",
          sx: { bgcolor: statusStyle.bgColor, color: statusStyle.color, borderColor: statusStyle.borderColor, border: '1px solid' } 
        })
      ),
      h(IconButton, { onClick: onClose }, h(CloseIcon))
    ),
    h(DialogContent, { sx: { p: 0 } },
      h(Box, { sx: { borderBottom: 1, borderColor: 'divider', px: 3 } },
        h(Tabs, { value: tab, onChange: (_, v) => setTab(v), textColor: "primary", indicatorColor: "primary" },
          h(Tab, { label: "Description", icon: h(DescriptionIcon, { sx: { fontSize: 18 } }), iconPosition: "start" }),
          h(Tab, { label: `Comments (${comments.length})`, icon: h(CommentIcon, { sx: { fontSize: 18 } }), iconPosition: "start" }),
          h(Tab, { label: "Activity", icon: h(HistoryIcon, { sx: { fontSize: 18 } }), iconPosition: "start" })
        )
      ),
      h(Box, { sx: { p: 3, maxHeight: '60vh', overflowY: 'auto' } },
        tab === 0 && h(Box, null,
          h(Typography, { variant: "body2", sx: { whiteSpace: 'pre-wrap', color: 'text.secondary', lineHeight: 1.6 } }, 
            issue.body || "No description provided."
          )
        ),
        tab === 1 && h(Box, null,
          loading ? h(Box, { sx: { display: 'flex', justifyContent: 'center', p: 4 } }, h(CircularProgress)) :
          comments.length === 0 ? h(Typography, { color: 'text.disabled', textAlign: 'center', p: 4 }, "No comments yet.") :
          h(List, { sx: { width: '100%' } },
            comments.map((comment, idx) => h(React.Fragment, { key: comment.id },
              h(ListItem, { alignItems: "flex-start", sx: { px: 0 } },
                h(ListItemAvatar, null, h(Avatar, { src: comment.user?.avatar_url })),
                h(ListItemText, {
                  primary: h(Box, { sx: { display: 'flex', gap: 1, alignItems: 'center' } },
                    h(Typography, { variant: "subtitle2", fontWeight: 700 }, comment.user?.login),
                    h(Typography, { variant: "caption", color: "text.disabled" }, new Date(comment.created_at).toLocaleString())
                  ),
                  secondary: h(Typography, { variant: "body2", color: "text.primary", sx: { mt: 1, whiteSpace: 'pre-wrap' } }, comment.body)
                })
              ),
              idx < comments.length - 1 && h(Divider, { variant: "inset", component: "li" })
            ))
          )
        ),
        tab === 2 && h(Box, null,
          loading ? h(Box, { sx: { display: 'flex', justifyContent: 'center', p: 4 } }, h(CircularProgress)) :
          h(List, { dense: true },
            events.map((event) => h(ListItem, { key: event.id, sx: { px: 0 } },
              h(ListItemAvatar, { sx: { minWidth: 40 } }, h(Avatar, { src: event.actor?.avatar_url, sx: { width: 24, height: 24 } })),
              h(ListItemText, {
                primary: h(Typography, { variant: "body2" }, 
                  h("b", null, event.actor?.login), 
                  ` ${event.event} this issue`,
                  event.label && h(Chip, { label: event.label.name, size: "small", sx: { ml: 1, height: 20, fontSize: '0.7rem' } })
                ),
                secondary: new Date(event.created_at).toLocaleString()
              })
            ))
          )
        )
      )
    )
  );
}