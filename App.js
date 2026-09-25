import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ThemeProvider, createTheme, CssBaseline, Box, Drawer, AppBar, Toolbar, 
  Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  IconButton, TextField, Button, Avatar, CircularProgress, Alert, Dialog, 
  DialogTitle, DialogContent, DialogActions, MenuItem, FormControl, 
  InputLabel, Select, Divider, Paper, InputAdornment
} from '@mui/material';
import { 
  TableChart as TableIcon, ViewKanban as KanbanIcon, Timeline as RoadmapIcon, 
  Logout as LogoutIcon, GitHub as GitHubIcon, Refresh as RefreshIcon, 
  Add as AddIcon, Settings as SettingsIcon, BugReport as TestIcon,
  Search as SearchIcon, Clear as ClearIcon
} from '@mui/icons-material';

import { supabase } from './lib/supabase.js';
import { GitHubService } from './services/github.js';
import { TaskStatus, TaskPriority } from './types.js';
import TableView from './components/TableView.js';
import KanbanView from './components/KanbanView.js';
import RoadmapView from './components/RoadmapView.js';
import TestRunner from './components/TestRunner.js';
import IssueDetails from './components/IssueDetails.js';

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
const REPO_STORAGE_KEY = 'taskflow_active_repo';

export default function App() {
  const [session, setSession] = useState(null);
  const [repo, setRepo] = useState(localStorage.getItem(REPO_STORAGE_KEY) || '');
  const [userRepos, setUserRepos] = useState([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [isRepoDialogOpen, setIsRepoDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('kanban');
  const [issues, setIssues] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isNewIssueOpen, setIsNewIssueOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

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

  const fetchRepos = useCallback(async () => {
    if (!githubService) return;
    setReposLoading(true);
    try {
      const repos = await githubService.getUserRepos();
      setUserRepos(repos);
      // If no repo is currently set, open the dialog
      if (!repo) {
        setIsRepoDialogOpen(true);
      }
    } catch (err) {
      console.error("Failed to fetch user repositories", err);
    } finally {
      setReposLoading(false);
    }
  }, [githubService, repo]);

  // Group and sort repositories for the dropdown
  const groupedRepos = useMemo(() => {
    if (!userRepos.length) return [];
    
    // Group by owner
    const groups = userRepos.reduce((acc, repo) => {
      const owner = repo.owner.login;
      if (!acc[owner]) acc[owner] = [];
      acc[owner].push(repo);
      return acc;
    }, {});

    // Sort owners A-Z
    const sortedOwners = Object.keys(groups).sort((a, b) => 
      a.toLowerCase().localeCompare(b.toLowerCase())
    );

    // Sort repos within groups A-Z and format
    return sortedOwners.map(owner => ({
      owner,
      repos: groups[owner].sort((a, b) => 
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      )
    }));
  }, [userRepos]);

  useEffect(() => {
    if (session) {
      fetchRepos();
    }
  }, [session, fetchRepos]);

  useEffect(() => {
    if (session && repo) fetchIssues();
  }, [session, repo, fetchIssues]);

  const signInWithGitHub = async () => {
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
    setRepo('');
    localStorage.removeItem(REPO_STORAGE_KEY);
  };

  const handleRepoChange = (newRepo) => {
    setRepo(newRepo);
    localStorage.setItem(REPO_STORAGE_KEY, newRepo);
    setIsRepoDialogOpen(false);
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

  const filteredIssues = useMemo(() => {
    if (!searchQuery.trim()) return issues;
    const q = searchQuery.toLowerCase().trim();
    return issues.filter(issue => 
      issue._searchTitle.includes(q) ||
      issue._searchNumber.includes(q)
    );
  }, [issues, searchQuery]);

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
            fullWidth: true, variant: "contained", size: "large", onClick: signInWithGitHub, disabled: loading,
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
        h(Toolbar, { sx: { justifyContent: 'space-between', gap: 2 } },
          h(Typography, { 
            variant: "h6", 
            sx: { 
              flexShrink: 0, 
              display: { xs: 'none', md: 'block' },
              cursor: 'pointer',
              '&:hover': { color: 'primary.main' }
            },
            onClick: () => setIsRepoDialogOpen(true)
          }, repo || "Select Repository"),
          
          h(Box, { sx: { flexGrow: 1, maxWidth: 600, display: 'flex', justifyContent: 'center' } },
            h(TextField, {
              size: "small",
              fullWidth: true,
              placeholder: "Search issues by title or #ID...",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              autoComplete: "off",
              InputProps: {
                startAdornment: h(InputAdornment, { position: "start" }, h(SearchIcon, { fontSize: "small", color: "action" })),
                endAdornment: searchQuery && h(InputAdornment, { position: "end" }, 
                  h(IconButton, { size: "small", onClick: () => setSearchQuery('') }, h(ClearIcon, { fontSize: "small" }))
                ),
                sx: { 
                  borderRadius: 2, 
                  bgcolor: 'rgba(255,255,255,0.05)', 
                  '& fieldset': { border: 'none' },
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                  '&.Mui-focused': { bgcolor: 'rgba(255,255,255,0.1)' }
                }
              }
            })
          ),

          h(Box, { sx: { display: 'flex', gap: 1, flexShrink: 0 } },
            h(Button, { variant: "contained", startIcon: h(AddIcon), onClick: () => setIsNewIssueOpen(true), disabled: !repo, sx: { display: { xs: 'none', sm: 'flex' } } }, "New Issue"),
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
          [
            { id: 'kanban', text: 'Board', icon: h(KanbanIcon) }, 
            { id: 'table', text: 'Table', icon: h(TableIcon) }, 
            { id: 'roadmap', text: 'Roadmap', icon: h(RoadmapIcon) },
            { id: 'tests', text: 'Diagnostics', icon: h(TestIcon) }
          ].map(item => (
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
        loading && !issues.length && h(Box, { sx: { display: 'flex', justifyContent: 'center', p: 4 } }, h(CircularProgress)),
        activeTab === 'table' && h(TableView, { issues: filteredIssues, onIssueClick: setSelectedIssue }),
        activeTab === 'kanban' && h(KanbanView, { issues: filteredIssues, onUpdateStatus: updateStatus, onIssueClick: setSelectedIssue }),
        activeTab === 'roadmap' && h(RoadmapView, { issues: filteredIssues, onIssueClick: setSelectedIssue }),
        activeTab === 'tests' && h(TestRunner, { githubService, supabase })
      )
    ),
    h(Dialog, { 
      open: isRepoDialogOpen, 
      onClose: () => repo && setIsRepoDialogOpen(false), 
      fullWidth: true, 
      maxWidth: "sm",
      PaperProps: { sx: { borderRadius: 3 } }
    },
      h(DialogTitle, null, "Connect Repository"),
      h(DialogContent, null,
        reposLoading ? h(Box, { sx: { display: 'flex', justifyContent: 'center', p: 3 } }, h(CircularProgress)) :
        h(FormControl, { fullWidth: true, sx: { mt: 1 } },
          h(InputLabel, { htmlFor: "repo-native-select", shrink: true }, "Select a Repository"),
          h(Select, {
            native: true,
            value: repo,
            onChange: (e) => handleRepoChange(e.target.value),
            label: "Select a Repository",
            inputProps: {
              name: 'repo',
              id: 'repo-native-select',
            },
          },
            h('option', { value: "", disabled: true }, "Choose a project..."),
            groupedRepos.map((group) => 
              h('optgroup', { key: group.owner, label: group.owner },
                group.repos.map((r) => 
                  h('option', { key: r.id, value: r.full_name }, r.name)
                )
              )
            )
          )
        )
      ),
      h(DialogActions, null, 
        repo && h(Button, { onClick: () => setIsRepoDialogOpen(false) }, "Cancel")
      )
    ),
    h(IssueDetails, { 
      issue: selectedIssue, 
      repo: repo, 
      githubService: githubService, 
      onClose: () => setSelectedIssue(null) 
    })
  );
}