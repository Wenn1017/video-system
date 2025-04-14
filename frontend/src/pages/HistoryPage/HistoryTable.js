import * as React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Button,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const columns = [
  { id: 'title', label: 'Title', minWidth: 200 },
  { id: 'date', label: 'Date', minWidth: 150 },
  { id: 'view', label: 'View', minWidth: 100, align: 'center' },
  { id: 'download', label: 'Download', minWidth: 130, align: 'center' },
  { id: 'delete', label: 'Delete', minWidth: 100, align: 'center' },
];

export default function HistoryTable({ historyData, handleView, handleDownload, handleDelete, loading }) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const rows = historyData.map((item) => ({
    ...item,
    view: (
      <Button variant="outlined" color="info" size="small" onClick={() => handleView(item.id)}>
        👁 View
      </Button>
    ),
    download: (
      <Button variant="outlined" color="success" size="small" onClick={() => handleDownload(item.id)}>
        📄 Download
      </Button>
    ),
    delete: (
      <IconButton color="error" size="small" onClick={() => handleDelete(item.id)}>
        <DeleteIcon />
      </IconButton>
    ),
  }));

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', backgroundColor: '#343a40', color: '#fff' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="history table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{
                    minWidth: column.minWidth,
                    backgroundColor: '#495057',
                    color: '#fff',
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" style={{ color: '#fff' }}>
                  Loading history...
                </TableCell>
              </TableRow>
            ) : historyData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" style={{ color: '#fff' }}>
                  No history
                </TableCell>
              </TableRow>
            ) : (
              rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow hover key={index}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          style={{ color: '#fff', backgroundColor: '#343a40' }}
                        >
                          {value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={historyData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          color: '#fff',
          backgroundColor: '#343a40',
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            color: '#fff',
          },
        }}
      />
    </Paper>
  );
}
