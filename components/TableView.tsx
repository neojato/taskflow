import React from 'react';
import { Box, Avatar, Tooltip, LinearProgress, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { GitHubIssue, TaskStatus, TaskPriority } from '../types';
import { STATUS_STYLING, STATUS_ICONS, PRIORITY_ICONS, PRIORITY_COLORS } from '../constants';

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
        const style = STATUS_STYLING[status];
        return (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              px: 1.5, 
              py: 0.5, 
              borderRadius: '9999px', 
              border: '1px solid',
              borderColor: style.borderColor,
              bgcolor: style.bgColor,
              color: style.color,
              fontSize: '0.75rem',
              fontWeight: 500
            }}>
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
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5, 
              fontWeight: 700,
              color: PRIORITY_COLORS[priority]
            }}>
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
            <Box sx={{ display: 'flex', marginLeft: '4px' }}>
              {assignees.map((a, idx) => (
                <Tooltip key={a.login} title={a.login}>
                  <Avatar 
                    src={a.avatar_url} 
                    sx={{ 
                      width: 24, 
                      height: 24, 
                      border: '2px solid #0f172a',
                      marginLeft: idx === 0 ? 0 : '-8px'
                    }} 
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
        autoHeight={false}
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell:focus': { outline: 'none' },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            color: 'text.secondary'
          },
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