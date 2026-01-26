import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Divider, CircularProgress } from '@mui/material';
import { PlayCircle as PlayIcon, CheckCircle as PassIcon, Error as FailIcon } from '@mui/icons-material';
import { runTests } from '../tests/logic.js';

const h = React.createElement;

export default function TestRunner({ githubService, supabase }) {
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);

  const startTests = async () => {
    setRunning(true);
    const report = await runTests(githubService, supabase);
    setResults(report);
    setRunning(false);
  };

  return h(Box, { sx: { p: 2 } },
    h(Box, { sx: { display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' } },
      h(Typography, { variant: "h5", fontWeight: 700 }, "System Diagnostics"),
      h(Button, { 
        variant: "contained", 
        startIcon: running ? h(CircularProgress, { size: 16, color: "inherit" }) : h(PlayIcon),
        onClick: startTests,
        disabled: running
      }, "Run Suite")
    ),
    h(Paper, { sx: { bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' } },
      results.length === 0 ? 
        h(Box, { sx: { p: 4, textAlign: 'center', color: 'text.secondary' } }, "Click 'Run Suite' to verify application integrity.") :
        results.map((test, idx) => h(Box, { key: idx },
          h(Box, { sx: { p: 2, display: 'flex', alignItems: 'center', gap: 2 } },
            test.status === 'passed' ? h(PassIcon, { color: "success" }) : h(FailIcon, { color: "error" }),
            h(Box, { sx: { flexGrow: 1 } },
              h(Typography, { variant: "body2", fontWeight: 600 }, test.name),
              test.status === 'failed' && h(Typography, { variant: "caption", color: "error" }, test.message)
            ),
            h(Typography, { variant: "caption", sx: { color: test.status === 'passed' ? 'success.main' : 'error.main', textTransform: 'uppercase', fontWeight: 700 } }, test.status)
          ),
          idx < results.length - 1 && h(Divider)
        ))
    )
  );
}