"use client"
import * as React from 'react';
import {alpha} from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import {HeadCell} from '@/types/HeadCell';
import {PaginatedResponse} from "@/types/PaginatedResponse";
import {useRouter} from "next/navigation";
import {Skeleton} from "@mui/material";

type Order = 'asc' | 'desc';

interface EnhancedTableHeadProps {
  numSelected: number;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  loading: boolean
  orderBy: string;
  rowCount: number;
  headCells: readonly HeadCell[];
  actions: boolean;
}

function EnhancedTableHead(props: EnhancedTableHeadProps) {
  const { headCells, actions } =
      props;

  return (
      <TableHead>
        <TableRow>
          {headCells.map((headCell) => (
              <TableCell
                  key={headCell.id}
                  align={headCell.numeric ? 'right' : 'left'}
                  padding={headCell.disablePadding ? 'none' : 'normal'}
              >
                {headCell.label}
              </TableCell>
          ))}
          {!!actions &&
          <TableCell
            >
            Actions
          </TableCell>
          }
        </TableRow>
      </TableHead>
  );
}
interface EnhancedTableToolbarProps {
  numSelected: number;
  title: string;
}
function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { numSelected, title } = props;
  return (
      <Toolbar
          sx={[
            {
              pl: { sm: 2 },
              pr: { xs: 1, sm: 1 },
            },
            numSelected > 0 && {
              bgcolor: (theme) =>
                  alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
            },
          ]}
      >
        {numSelected > 0 ? (
            <Typography
                sx={{ flex: '1 1 100%' }}
                color="inherit"
                variant="subtitle1"
                component="div"
            >
              {numSelected} selected
            </Typography>
        ) : (
            <Typography
                sx={{ flex: '1 1 100%' }}
                variant="h6"
                id="tableTitle"
                component="div"
            >
              {title}
            </Typography>
        )}
      </Toolbar>
  );
}
interface EnhancedTableProps {
  paginatedData: PaginatedResponse<any> | null;
  headCells: readonly HeadCell[];
  title: string;
  orgRedirectPath?: string;
  rowsPerPage: number;
  setPageNumber: (pageNumber: number) => void;
  setRowsPerPage: (rowsPerPage: number) => void;
  loading: boolean;
  rowClickable?: boolean;
  disablePagination?: boolean;
  renderRowActions?: (row: any) => React.ReactNode
}

export default function PaginatedTable(props: EnhancedTableProps) {
  const router = useRouter();
  const {
    paginatedData,
    headCells,
    title,
    rowsPerPage,
    setPageNumber,
    setRowsPerPage,
    orgRedirectPath = "",
    loading,
    rowClickable = true,
    disablePagination = false,
    renderRowActions
  } = props;

  const allRows = paginatedData?.items ?? [];
  const rows = disablePagination ? allRows : allRows.slice(0, rowsPerPage);
  const totalItems = paginatedData?.totalItems ?? allRows.length;
  const pageNumber = paginatedData?.pageNumber ?? 1;
  const page = pageNumber - 1;

  const [order] = React.useState<Order>('asc');
  const [orderBy] = React.useState<string>('name');
  const [selected, setSelected] = React.useState<readonly number[]>([]);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
    router.push(`${orgRedirectPath}/${id}`)
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPageNumber(newPage)
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageNumber(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  return (
      <Box sx={{ width: '100%' }}>
        <Paper sx={{ width: '100%', mb: 2 }}>
          <EnhancedTableToolbar numSelected={selected.length} title={title} />
          <TableContainer>
            <Table
                sx={{ minWidth: 750 }}
                aria-labelledby="tableTitle"
                size={'medium'}
            >
              <EnhancedTableHead
                  numSelected={selected.length}
                  order={order}
                  orderBy={orderBy}
                  onSelectAllClick={handleSelectAllClick}
                  rowCount={rows.length}
                  headCells={headCells}
                  loading={loading}
                  actions={renderRowActions != null}
              />
              <TableBody>
                {loading || !paginatedData ? (
                    [...Array(rowsPerPage)].map((_, index) => (
                        <TableRow key={index}>
                          {headCells.map((cell) => (
                              <TableCell key={cell.id}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Skeleton variant="text" width="80%" />
                                </Box>
                              </TableCell>
                          ))}
                        </TableRow>
                    ))
                ) : (
                    rows.map((row, index) => {
                      const isItemSelected = selected.includes(row.id);
                      return (
                          <TableRow
                              hover={rowClickable}
                              onClick={rowClickable ? (event) => handleClick(event, row.id) : undefined}
                              role="checkbox"
                              aria-checked={isItemSelected}
                              tabIndex={-1}
                              key={index}
                              selected={isItemSelected}
                              sx={{ cursor: rowClickable ? 'pointer' : 'default' }}
                          >
                            {headCells.map((headCell) => (
                                <TableCell key={headCell.id} align={headCell.numeric ? 'right' : 'left'} data-cy-test={headCell.id}>
                                  {row[headCell.id]}
                                </TableCell>
                            ))}

                            {renderRowActions != null &&
                                <TableCell align="right">
                                  {props.renderRowActions?.(row)}
                                </TableCell>
                            }
                          </TableRow>
                      );
                    })
                )}
              </TableBody>

            </Table>
          </TableContainer>
          {!disablePagination && (
              <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={totalItems}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  disabled={loading || !paginatedData}
              />
          )}


        </Paper>
      </Box>
  );
}
