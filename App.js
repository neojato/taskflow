import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ThemeProvider, createTheme, CssBaseline, Box, Drawer, AppBar, Toolbar, 
  Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  IconButton, TextField, Button, Avatar, CircularProgress, Alert, Dialog, 
  DialogTitle, DialogContent, DialogActions, MenuItem, FormControl, 
  InputLabel, Select, Divider, Paper
} from '@mui/material';
import { 
  TableChart as TableIcon, ViewKanban as KanbanIcon, Timeline as RoadmapIcon, 
  Logout as LogoutIcon, GitHub as GitHubIcon, Refresh as RefreshIcon, 
  Add as AddIcon, Settings as SettingsIcon, ErrorOutline as ErrorIcon
} from '@mui/icons-material';

import { supabase } from './lib/supabase.js';
import { GitHubService } from './services/github.js';
import { TaskStatus, TaskPriority } from './types.js';
import TableView from './components/TableView.js';
import KanbanView from './components/KanbanView.js';
import RoadmapView from './components/RoadmapView.js';

const h = React.createElement;

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#020617', paper: '#0f172a' },
    primary: { main: '#38bdf8' },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  typography: { fontFamily: '"Inter", sans-serif' }
});

const DRAWER_WIDTH = 240;
const REPO_STORAGE_KEY = 'taskflow_repo';

export default function App() {
  const [session, setSession] = useState(null);
  const [repo, setRepo] = useState(localStorage.getItem(REPO_STORAGE_KEY) || '');
  const [isRepoDialogOpen, setIsRepoDialogOpen] = useState(!repo);
  const [activeTab, setActiveTab] = useState('kanban');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isNewIssueOpen, setIsNewIssueOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const githubService = useMemo(() => {
    const token = session?.provider_token;
    return token ? new GitHubService(token) : null;
  }, [session]);

  const fetchIssues = useCallback(async () => {
    if (!githubService || !repo) return;
    setLoading(true);
    setError(null);
    try {
      const data = await githubService.getIssues(repo);
      setIssues(data);
    } catch (err) {
      setError(err.message || "Failed to fetch issues.");
    } finally {
      setLoading(false);
    }
  }, [githubService, repo]);

  useEffect(() => {
    if (session && repo) fetchIssues();
  }, [session, repo, fetchIssues]);

  const handleGitHubLogin = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { scopes: 'repo user', redirectTo: window.location.href }
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setIssues([]);
    setSession(null);
  };

  const handleRepoSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newRepo = formData.get('repo');
    if (newRepo) {
      setRepo(newRepo);
      localStorage.setItem(REPO_STORAGE_KEY, newRepo);
      setIsRepoDialogOpen(false);
    }
  };

  if (!supabase) {
    return h(Box, { sx: { p: 4, textAlign: 'center' } }, 
      h(Typography, { color: "error" }, "System Error: Supabase connection failed.")
    );
  }

  if (!session) {
    return h(ThemeProvider, { theme: darkTheme },
      h(CssBaseline),
      h(Box, { sx: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#020617' } },
        h(Box, { sx: { p: 4, width: '100%', maxWidth: 400, bgcolor: 'background.paper', borderRadius: 4, textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' } },
          h(Typography, { variant: "h4", fontWeight: "800", gutterBottom: true }, "TaskFlow"),
          h(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 4 } }, "The high-performance project management interface for GitHub."),
          h(Button, { 
            fullWidth: true, variant: "contained", size: "large", onClick: handleGitHubLogin, disabled: loading,
            startIcon: h(GitHubIcon)
          }, loading ? "Connecting..." : "Sign in with GitHub")
        )
      )
    );
  }

  return h(ThemeProvider, { theme: darkTheme },
    h(CssBaseline),
    h(Box, { sx: { display: 'flex', height: '100vh' } },
      h(AppBar, { 
        position: "fixed", 
        sx: { width: `calc(100% - ${DRAWER_WIDTH}px)`, ml: `${DRAWER_WIDTH}px`, bgcolor: 'background.default', borderBottom: '1px solid rgba(255,255,255,0.1)', boxShadow: 'none', zIndex: (theme) => theme.zIndex.drawer + 1 } 
      },
        h(Toolbar, { sx: { justifyContent: 'space-between' } },
          h(Typography, { variant: "h6" }, repo || "Select Repository"),
          h(Box, { sx: { display: 'flex', gap: 1 } },
            h(Button, { variant: "contained", startIcon: h(AddIcon), onClick: () => setIsNewIssueOpen(true), disabled: !repo }, "New Issue"),
            h(IconButton, { onClick: fetchIssues, disabled: !repo }, h(RefreshIcon)),
            h(IconButton, { onClick: handleLogout }, h(LogoutIcon))
          )
        )
      ),
      h(Drawer, { 
        variant: "permanent", 
        sx: { width: DRAWER_WIDTH, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, bgcolor: '#020617', borderRight: '1px solid rgba(255,255,255,0.1)' } } 
      },
        h(Toolbar, null, 
          h(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 } },
            h(GitHubIcon, { sx: { color: 'primary.main' } }),
            h(Typography, { variant: "h6", fontWeight: "800" }, "TaskFlow")
          )
        ),
        h(List, null,
          [{ id: 'kanban', text: 'Board', icon: h(KanbanIcon) }, { id: 'table', text: 'Table', icon: h(TableIcon) }, { id: 'roadmap', text: 'Roadmap', icon: h(RoadmapIcon) }].map(item => (
            h(ListItem, { key: item.id, disablePadding: true },
              h(ListItemButton, { selected: activeTab === item.id, onClick: () => setActiveTab(item.id) },
                h(ListItemIcon, null, item.icon),
                h(ListItemText, { primary: item.text })
              )
            )
          ))
        )
      ),
      h(Box, { component: "main", sx: { flexGrow: 1, p: 3, pt: 10, overflow: 'hidden', bgcolor: 'background.default' } },
        error && h(Alert, { severity: "error", sx: { mb: 2 } }, error),
        activeTab === 'table' && h(TableView, { issues }),
        activeTab === 'kanban' && h(KanbanView, { issues, onUpdateStatus: updateStatus }),
        activeTab === 'roadmap' && h(RoadmapView, { issues })
      )
    ),
    h(Dialog, { open: isRepoDialogOpen, onClose: () => repo && setIsRepoDialogOpen(false), fullWidth: true, maxWidth: "xs" },
      h(Box, { component: "form", onSubmit: handleRepoSubmit },
        h(DialogTitle, null, "Connect Repository"),
        h(DialogContent, null, h(TextField, { fullWidth: true, required: true, label: "owner/repo", name: "repo", defaultValue: repo, sx: { mt: 1 } })),
        h(DialogActions, null, h(Button, { type: "submit", variant: "contained" }, "Load"))
      )
    )
  );
}