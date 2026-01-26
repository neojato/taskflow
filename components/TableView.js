import React from 'react';
import { Box, Avatar, Tooltip, LinearProgress, Typography } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { STATUS_STYLING, STATUS_ICONS, PRIORITY_ICONS, PRIORITY_COLORS } from '../constants.js';

const h = React.createElement;

export default function TableView({ issues }) {
  const columns = [
    { field: 'number', headerName: '#', width: 80 },
    { field: 'title', headerName: 'Title', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => {
        const style = STATUS_STYLING[params.value];
        return h(Box, { 
          sx: { display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5, borderRadius: 2, border: '1px solid', borderColor: style.borderColor, bgcolor: style.bgColor, color: style.color } 
        },
          STATUS_ICONS[params.value],
          params.value
        );
      }
    },
    {
      field: 'progress',
      headerName: 'Progress',
      width: 150,
      renderCell: (params) => h(Box, { sx: { width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' } },
        h(LinearProgress, { variant: "determinate", value: params.value, sx: { height: 6, borderRadius: 3 } })
      )
    }
  ];

  return h(Box, { sx: { height: 'calc(100vh - 120px)', width: '100%' } },
    h(DataGrid, { 
      rows: issues, 
      columns: columns, 
      slots: { toolbar: GridToolbar }, 
      getRowId: r => r.id,
      sx: { border: 'none' }
    })
  );
}