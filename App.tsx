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

import { supabase } from './lib/supabase.ts';
import { GitHubService } from './services/github.ts';
import { GitHubIssue, TaskStatus, TaskPriority } from './types.ts';
import TableView from './components/TableView.tsx';
import KanbanView from './components/KanbanView.tsx';
import RoadmapView from './components/RoadmapView.tsx';

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
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

const DRAWER_WIDTH = 240;
const REPO_STORAGE_KEY = 'taskflow_repo';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [repo, setRepo] = useState<string>(localStorage.getItem(REPO_STORAGE_KEY) || '');
  const [isRepoDialogOpen, setIsRepoDialogOpen] = useState(!repo);
  const [activeTab, setActiveTab] = useState<'table' | 'kanban' | 'roadmap'>('kanban');
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    } catch (err: any) {
      console.error('TaskFlow [Issues]: Fetch failed', err);
      setError(err.message || "Failed to fetch issues. Verify repo path and token permissions.");
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
    if (!supabase) {
      setError("Supabase not initialized correctly.");
      return;
    }
    
    setLoading(true);
    setError(null);
    console.debug('TaskFlow [Auth]: Starting GitHub login...');

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          scopes: 'repo user',
          redirectTo: window.location.href // Redirect back to current URL
        }
      });
      
      if (error) {
        console.error('TaskFlow [Auth]: OAuth error response:', error);
        setError(`Login failed: ${error.message}`);
        setLoading(false);
      } else if (data?.url) {
        console.debug('TaskFlow [Auth]: Manual redirect to:', data.url);
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('TaskFlow [Auth]: Unexpected failure:', err);
      setError(`Auth system error: ${err.message || "Could not connect to Supabase"}`);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setIssues([]);
    setSession(null);
  };

  const handleRepoSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newRepo = formData.get('repo') as string;
    if (newRepo) {
      setRepo(newRepo);
      localStorage.setItem(REPO_STORAGE_KEY, newRepo);
      setIsRepoDialogOpen(false);
    }
  };

  const handleCreateIssue = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!githubService || !repo) return;
    
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const body = formData.get('body') as string;
    const status = formData.get('status') as string;
    const priority = formData.get('priority') as string;
    const assigneeInput = formData.get('assignees') as string;
    const assignees = assigneeInput ? assigneeInput.split(',').map(s => s.trim()) : [];

    setCreating(true);
    try {
      const newIssue = await githubService.createIssue(repo, {
        title,
        body,
        labels: [status, priority],
        assignees
      });
      setIssues(prev => [newIssue, ...prev]);
      setIsNewIssueOpen(false);
    } catch (err: any) {
      setError("Failed to create issue: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  const updateStatus = async (issueNumber: number, newStatus: TaskStatus) => {
    if (!githubService || !repo) return;
    
    const originalIssues = [...issues];
    setIssues(prev => prev.map(issue => {
      if (issue.number === issueNumber) {
        return { ...issue, status: newStatus };
      }
      return issue;
    }));

    try {
      const issue = issues.find(i => i.number === issueNumber);
      if (!issue) return;

      const otherLabels = issue.labels
        .filter(l => !Object.values(TaskStatus).includes(l.name as TaskStatus))
        .map(l => l.name);
      
      await githubService.updateIssueLabels(repo, issueNumber, [...otherLabels, newStatus]);
    } catch (err) {
      setIssues(originalIssues);
      setError("Sync failed: Verify your repository write permissions.");
    }
  };

  if (!supabase) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
          <Paper sx={{ p: 4, maxWidth: 500, borderRadius: 3, textAlign: 'center' }}>
            <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" fontWeight="700" gutterBottom>Fatal Error</Typography>
            <Typography variant="body1" color="text.secondary">
              The Supabase client could not be initialized. Check console for details.
            </Typography>
          </Paper>
        </Box>
      </ThemeProvider>
    );
  }

  if (!session) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Box sx={{ 
          height: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #020617 100%)'
        }}>
          <Box sx={{ 
            p: 5, 
            width: '100%', 
            maxWidth: 440, 
            bgcolor: 'background.paper', 
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center'
          }}>
            <Box sx={{ display: 'inline-flex', p: 1.5, bgcolor: 'primary.main', borderRadius: 2, mb: 3 }}>
              <GitHubIcon sx={{ fontSize: 40, color: 'black' }} />
            </Box>
            <Typography variant="h4" fontWeight="800" gutterBottom>TaskFlow</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              The high-performance project management interface for GitHub.
            </Typography>
            <Button 
              fullWidth 
              variant="contained" 
              size="large" 
              onClick={handleGitHubLogin}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <GitHubIcon />}
              sx={{ py: 1.5, fontWeight: 700, bgcolor: '#f8fafc', color: '#020617', '&:hover': { bgcolor: '#e2e8f0' } }}
            >
              {loading ? 'Connecting...' : 'Sign in with GitHub'}
            </Button>
            {error && <Alert severity="error" sx={{ mt: 3, textAlign: 'left' }}>{error}</Alert>}
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <AppBar position="fixed" sx={{ 
          width: `calc(100% - ${DRAWER_WIDTH}px)`, 
          ml: `${DRAWER_WIDTH}px`,
          bgcolor: 'rgba(2, 6, 23, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          boxShadow: 'none',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" noWrap component="div" fontWeight="600">
                {repo || 'Select Repository'}
              </Typography>
              {loading && <CircularProgress size={20} color="primary" />}
              <IconButton size="small" onClick={() => setIsRepoDialogOpen(true)}>
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => setIsNewIssueOpen(true)}
                disabled={!repo}
                sx={{ mr: 1 }}
              >
                New Issue
              </Button>
              <IconButton onClick={fetchIssues} color="inherit" disabled={!repo}>
                <RefreshIcon />
              </IconButton>
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 1 }}>
                <Avatar src={session.user.user_metadata.avatar_url} sx={{ width: 32, height: 32 }} />
                <IconButton onClick={handleLogout} color="inherit">
                  <LogoutIcon />
                </IconButton>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>
        
        <Drawer
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              bgcolor: '#020617',
              borderRight: '1px solid rgba(255,255,255,0.08)'
            },
          }}
          variant="permanent"
          anchor="left"
        >
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ p: 0.5, bgcolor: 'primary.main', borderRadius: 1, display: 'flex' }}>
                <GitHubIcon sx={{ fontSize: 20, color: 'black' }} />
              </Box>
              <Typography variant="h6" fontWeight="800">TaskFlow</Typography>
            </Box>
          </Toolbar>
          <Box sx={{ overflow: 'auto', px: 1, mt: 2 }}>
            <List>
              {[
                { id: 'kanban', text: 'Board', icon: <KanbanIcon /> },
                { id: 'table', text: 'Table', icon: <TableIcon /> },
                { id: 'roadmap', text: 'Roadmap', icon: <RoadmapIcon /> },
              ].map((item) => (
                <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton 
                    selected={activeTab === item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    sx={{ borderRadius: 2 }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: activeTab === item.id ? 'primary.main' : 'inherit' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        <Box component="main" sx={{ 
          flexGrow: 1, 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          pt: 8,
          bgcolor: 'background.default',
          overflow: 'hidden'
        }}>
          {error && <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>{error}</Alert>}
          {!repo && !loading ? (
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
               <Typography color="text.secondary">Connect a GitHub repository to get started.</Typography>
               <Button variant="outlined" onClick={() => setIsRepoDialogOpen(true)}>Select Repository</Button>
            </Box>
          ) : repo && (
            <Box sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {activeTab === 'table' && <TableView issues={issues} />}
              {activeTab === 'kanban' && <KanbanView issues={issues} onUpdateStatus={updateStatus} />}
              {activeTab === 'roadmap' && <RoadmapView issues={issues} />}
            </Box>
          )}
        </Box>

        <Dialog open={isRepoDialogOpen} onClose={() => repo && setIsRepoDialogOpen(false)} maxWidth="xs" fullWidth>
          <Box component="form" onSubmit={handleRepoSubmit}>
            <DialogTitle>Connect Repository</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                fullWidth
                required
                label="Repository Path (owner/repo)"
                name="repo"
                defaultValue={repo}
                placeholder="e.g. facebook/react"
                sx={{ mt: 1 }}
              />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              {repo && <Button onClick={() => setIsRepoDialogOpen(false)}>Cancel</Button>}
              <Button type="submit" variant="contained">Load Project</Button>
            </DialogActions>
          </Box>
        </Dialog>

        <Dialog open={isNewIssueOpen} onClose={() => !creating && setIsNewIssueOpen(false)} maxWidth="sm" fullWidth>
          <Box component="form" onSubmit={handleCreateIssue}>
            <DialogTitle>Create New Issue</DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                <TextField fullWidth required label="Title" name="title" />
                <TextField fullWidth multiline rows={4} label="Body" name="body" placeholder="Task description..." />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Status</InputLabel>
                    <Select name="status" label="Status" defaultValue={TaskStatus.NOT_STARTED}>
                      {Object.values(TaskStatus).map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth required>
                    <InputLabel>Priority</InputLabel>
                    <Select name="priority" label="Priority" defaultValue={TaskPriority.P2}>
                      {Object.values(TaskPriority).map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>
                <TextField fullWidth label="Assignees" name="assignees" placeholder="Comma-separated logins" />
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setIsNewIssueOpen(false)} disabled={creating}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={creating}>
                {creating ? <CircularProgress size={24} /> : 'Create'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default App;