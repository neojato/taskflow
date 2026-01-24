
import React from 'react';
import { Box, Chip, Avatar, Tooltip, LinearProgress, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { GitHubIssue, TaskStatus, TaskPriority } from '../types';
import { STATUS_COLORS, STATUS_ICONS, PRIORITY_ICONS, PRIORITY_COLORS } from '../constants';

interface TableViewProps {
  issues: GitHubIssue[];
}

const TableView: React.FC<TableViewProps> = ({ issues }) => {
  const columns: GridColDef[] = [
    { 
      field: 'number', 
      headerName: '#', 
      width: 80,
      renderCell: (params) => (
        <Typography color="text.secondary" variant="body2" sx={{ lineHeight: '52px' }}>#{params.value}</Typography>
      )
    },
    { 
      field: 'title', 
      headerName: 'Title', 
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="500" sx={{ lineHeight: '52px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => {
        const status = params.value as TaskStatus;
        const colorClass = STATUS_COLORS[status];
        return (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
            <Box className={`flex items-center gap-2 px-2 py-1 rounded-full border text-xs font-medium ${colorClass}`}>
              {STATUS_ICONS[status]}
              {status}
            </Box>
          </Box>
        );
      }
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      renderCell: (params) => {
        const priority = params.value as TaskPriority;
        return (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
            <Box className={`flex items-center gap-1 font-bold ${PRIORITY_COLORS[priority]}`}>
              {PRIORITY_ICONS[priority]}
              {priority}
            </Box>
          </Box>
        );
      }
    },
    {
      field: 'assignees',
      headerName: 'Assignee',
      width: 120,
      renderCell: (params) => {
        const assignees = params.value as any[];
        return (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
            <Box className="flex -space-x-2">
              {assignees.map((a) => (
                <Tooltip key={a.login} title={a.login}>
                  <Avatar 
                    src={a.avatar_url} 
                    sx={{ width: 24, height: 24, border: '2px solid #0f172a' }} 
                  />
                </Tooltip>
              ))}
              {assignees.length === 0 && <Typography variant="caption" color="text.disabled">Unassigned</Typography>}
            </Box>
          </Box>
        );
      }
    },
    {
      field: 'progress',
      headerName: 'Progress',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">{params.value}%</Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={params.value} 
            sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)' }}
          />
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ height: '100%', width: '100%', minHeight: 400 }}>
      <DataGrid
        rows={issues}
        columns={columns}
        getRowId={(row) => row.id}
        slots={{ toolbar: GridToolbar }}
        disableRowSelectionOnClick
        autoHeight={false} // Force standard height to avoid intrinsic size errors
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell:focus': { outline: 'none' },
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: 'rgba(255,255,255,0.02)',
            borderBottom: '1px solid rgba(255,255,255,0.08)'
          },
          '& .MuiDataGrid-row:hover': {
            bgcolor: 'rgba(255,255,255,0.02)'
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid rgba(255,255,255,0.08)'
          }
        }}
      />
    </Box>
  );
};

export default TableView;
