import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  TextField, 
  Button, 
  Avatar, 
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Paper
} from '@mui/material';
import { 
  TableChart as TableIcon, 
  ViewKanban as KanbanIcon, 
  Timeline as RoadmapIcon, 
  Logout as LogoutIcon,
  GitHub as GitHubIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  ErrorOutline as ErrorIcon
} from '@mui/icons-material';

import { supabase } from './lib/supabase.js';
import { GitHubService } from './services/github.js';
import { TaskStatus, TaskPriority } from './types.js';
import TableView from './components/TableView.js';
import KanbanView from './components/KanbanView.js';
import RoadmapView from './components/RoadmapView.js';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#020617',
      paper: '#0f172a',
    },
    primary: {
      main: '#38bdf8',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  }
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

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

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
    if (session && repo) {
      fetchIssues();
    }
  }, [session, repo, fetchIssues]);

  const handleGitHubLogin = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          scopes: 'repo user',
          redirectTo: window.location.href
        }
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

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!githubService || !repo) return;
    const formData = new FormData(e.currentTarget);
    setCreating(true);
    try {
      const newIssue = await githubService.createIssue(repo, {
        title: formData.get('title'),
        body: formData.get('body'),
        labels: [formData.get('status'), formData.get('priority')],
        assignees: formData.get('assignees')?.split(',').map(s => s.trim()).filter(Boolean) || []
      });
      setIssues(prev => [newIssue, ...prev]);
      setIsNewIssueOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const updateStatus = async (issueNumber, newStatus) => {
    if (!githubService || !repo) return;
    const originalIssues = [...issues];
    setIssues(prev => prev.map(i => i.number === issueNumber ? { ...i, status: newStatus } : i));
    try {
      const issue = issues.find(i => i.number === issueNumber);
      const otherLabels = issue.labels.filter(l => !Object.values(TaskStatus).includes(l.name)).map(l => l.name);
      await githubService.updateIssueLabels(repo, issueNumber, [...otherLabels, newStatus]);
    } catch (err) {
      setIssues(originalIssues);
      setError("Update failed.");
    }
  };

  if (!supabase) return <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="error">System Error</Typography></Box>;

  if (!session) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#020617' }}>
          <Box sx={{ p: 4, width: '100%', maxWidth: 400, bgcolor: 'background.paper', borderRadius: 4, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="800" gutterBottom>TaskFlow</Typography>
            <Button fullWidth variant="contained" onClick={handleGitHubLogin} disabled={loading} startIcon={<GitHubIcon />}>
              Sign in with GitHub
            </Button>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <AppBar position="fixed" sx={{ width: `calc(100% - ${DRAWER_WIDTH}px)`, ml: `${DRAWER_WIDTH}px`, bgcolor: 'background.default', borderBottom: '1px solid rgba(255,255,255,0.1)', boxShadow: 'none' }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6">{repo || 'TaskFlow'}</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsNewIssueOpen(true)} disabled={!repo}>New Issue</Button>
              <IconButton onClick={fetchIssues} disabled={!repo}><RefreshIcon /></IconButton>
              <IconButton onClick={handleLogout}><LogoutIcon /></IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, bgcolor: '#020617' } }}>
          <Toolbar><Typography variant="h6" fontWeight="800">TaskFlow</Typography></Toolbar>
          <List>
            {[{ id: 'kanban', text: 'Board', icon: <KanbanIcon /> }, { id: 'table', text: 'Table', icon: <TableIcon /> }, { id: 'roadmap', text: 'Roadmap', icon: <RoadmapIcon /> }].map(item => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton selected={activeTab === item.id} onClick={() => setActiveTab(item.id)}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 10, overflow: 'hidden' }}>
          {activeTab === 'table' && <TableView issues={issues} />}
          {activeTab === 'kanban' && <KanbanView issues={issues} onUpdateStatus={updateStatus} />}
          {activeTab === 'roadmap' && <RoadmapView issues={issues} />}
        </Box>
      </Box>

      <Dialog open={isRepoDialogOpen} onClose={() => repo && setIsRepoDialogOpen(false)} fullWidth maxWidth="xs">
        <Box component="form" onSubmit={handleRepoSubmit}>
          <DialogTitle>Connect Repository</DialogTitle>
          <DialogContent><TextField fullWidth required label="owner/repo" name="repo" defaultValue={repo} sx={{ mt: 1 }} /></DialogContent>
          <DialogActions><Button type="submit" variant="contained">Load</Button></DialogActions>
        </Box>
      </Dialog>
    </ThemeProvider>
  );
}