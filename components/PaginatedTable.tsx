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
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import {visuallyHidden} from '@mui/utils';
import {HeadCell} from '@/types/HeadCell';
import {PaginatedResponse} from "@/types/PaginatedResponse";
import {useRouter} from "next/navigation";


function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

interface EnhancedTableHeadProps {
  numSelected: number;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  loading: boolean
  orderBy: string;
  rowCount: number;
  headCells: readonly HeadCell[];
}

function EnhancedTableHead(props: EnhancedTableHeadProps) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, headCells } =
      props;

  return (
      <TableHead>
        <TableRow>
          {headCells.map((headCell) => (
              <TableCell
                  key={headCell.id}
                  align={headCell.numeric ? 'right' : 'left'}
                  padding={headCell.disablePadding ? 'none' : 'normal'}
                  // sortDirection={orderBy === headCell.id ? order : false}
              >
                {headCell.label}
                {/*<TableSortLabel*/}
                {/*    active={orderBy === headCell.id}*/}
                {/*    direction={orderBy === headCell.id ? order : 'asc'}*/}
                {/*    onClick={createSortHandler(headCell.id)}*/}
                {/*>*/}
                {/*  {orderBy === headCell.id ? (*/}
                {/*      <Box component="span" sx={visuallyHidden}>*/}
                {/*        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}*/}
                {/*      </Box>*/}
                {/*  ) : null}*/}
                {/*</TableSortLabel>*/}
              </TableCell>
          ))}
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
        {/*{numSelected > 0 ? (*/}
        {/*    <Tooltip title="Delete">*/}
        {/*      <IconButton>*/}
        {/*        <DeleteIcon />*/}
        {/*      </IconButton>*/}
        {/*    </Tooltip>*/}
        {/*) : (*/}
        {/*    <Tooltip title="Filter list">*/}
        {/*      <IconButton>*/}
        {/*        <FilterListIcon />*/}
        {/*      </IconButton>*/}
        {/*    </Tooltip>*/}
        {/*)}*/}
      </Toolbar>
  );
}
interface EnhancedTableProps {
  paginatedData: PaginatedResponse<any>;
  headCells: readonly HeadCell[];
  title: string;
  orgRedirectPath: string;
  rowsPerPage: number;
  setPageNumber: (pageNumber: number) => void;
  setRowsPerPage: (rowsPerPage: number) => void;
}
export default function EnhancedTable(props: EnhancedTableProps) {
  const router = useRouter();
  const {paginatedData, headCells, title, rowsPerPage, setPageNumber, setRowsPerPage, orgRedirectPath, loading} = props
  const {totalItems, pageNumber, nextPage, previousPage, totalPages, items: rows} = paginatedData
  const page = pageNumber - 1
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<string>('name');
  const [selected, setSelected] = React.useState<readonly number[]>([]);
  const [dense, setDense] = React.useState(false);

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

  const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDense(event.target.checked);
  };

  return (
      <Box sx={{ width: '100%' }}>
        <Paper sx={{ width: '100%', mb: 2 }}>
          <EnhancedTableToolbar numSelected={selected.length} title={title} />
          <TableContainer>
            <Table
                sx={{ minWidth: 750 }}
                aria-labelledby="tableTitle"
                size={dense ? 'small' : 'medium'}
            >
              <EnhancedTableHead
                  numSelected={selected.length}
                  order={order}
                  orderBy={orderBy}
                  onSelectAllClick={handleSelectAllClick}
                  rowCount={rows.length}
                  headCells={headCells}
              />
              <TableBody>
                {rows.map((row, index) => {
                  const isItemSelected = selected.includes(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;
                  return (
                      <TableRow
                          hover
                          onClick={(event) => handleClick(event, row.id)}
                          role="checkbox"
                          aria-checked={isItemSelected}
                          tabIndex={-1}
                          key={index}
                          selected={isItemSelected}
                          sx={{ cursor: 'pointer' }}
                      >
                        {headCells.map((headCell) => {
                            return (
                                <TableCell key={headCell.id} align={headCell.numeric ? 'right' : 'left'}>
                                  {row[headCell.id]}
                                </TableCell>
                            )
                          })}
                      </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalItems}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
        <FormControlLabel
            control={<Switch checked={dense} onChange={handleChangeDense} />}
            label="Dense padding"
        />
      </Box>
  );
}
