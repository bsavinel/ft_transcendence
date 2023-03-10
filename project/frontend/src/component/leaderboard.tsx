import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableHead from '@mui/material/TableHead';
import TableFooter from '@mui/material/TableFooter';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ImportExportIcon from '@mui/icons-material/ImportExport';

// Variable const pour definir le theme des cellules et des lignes via la TableCell
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}))


interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number,
  ) => void;
}

// Fonction qui permet de choisir le nombre de lignes a afficher
function TablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

// Fonction pour creer un objet data a display sur le leaderboard
// Remplacer row par le tableau recu de prisma
// A besoin d'un tableau contenant toutes la data user(id, username, etc... obtenu avec prisma) pour renvoyer un objet complet avec le rank et le ratio calcule
function createData(id: number, name: string, rank:number, level: number, victory: number, defeat: number, achievement: number) {
  const ratioVD = victory / defeat;
  const ratio = ratioVD.toFixed(2);
  return {
	id,
    name,
    rank,
    level,
    victory,
    defeat,
    ratio,
    achievement,
    history: [
      {
        date: '2020-01-05',
        opponent: '11091700',
        score: 3,
        state: true,
      },
      {
        date: '2020-01-02',
        opponent: 'Anonymous',
        score: 1,
        state: false,
      },
      {
        date: '2020-01-05',
        opponent: '11091700',
        score: 3,
        state: false,
      },
      {
        date: '2020-01-02',
        opponent: 'Anonymous',
        score: 1,
        state: true,
      },
      {
        date: '2020-01-05',
        opponent: '11091700',
        score: 3,
        state: true,
      },
    ],
  };
}

// Fonction row pour display une ligne sur le leaderboard avec les informations de la data
function Row(props: { row: ReturnType<typeof createData> }) { //object props qui contient une propriete row (object createData)
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  console.log(row);
  return (
    <React.Fragment>
      <StyledTableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <StyledTableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </StyledTableCell>
        <StyledTableCell>{row.rank}</StyledTableCell>
        <StyledTableCell>{row.id}</StyledTableCell>
        <StyledTableCell component="th" scope="row">{row.name}</StyledTableCell>
        <StyledTableCell>{row.level}</StyledTableCell>
        <StyledTableCell align="right">{row.victory}</StyledTableCell>
        <StyledTableCell align="right">{row.defeat}</StyledTableCell>
        <StyledTableCell align="right">{row.ratio}</StyledTableCell>
        <StyledTableCell align="right">{row.achievement}</StyledTableCell>
      </StyledTableRow>
      <StyledTableRow>
        <StyledTableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Historique (5 derniers match)
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <StyledTableRow>
                    <StyledTableCell>Date</StyledTableCell>
                    <StyledTableCell>Opponent</StyledTableCell>
                    <StyledTableCell>Score</StyledTableCell>
                    <StyledTableCell align="right">State</StyledTableCell>
                  </StyledTableRow>
                </TableHead>
                <TableBody>
                  {row.history.map((historyRow) => (
                    <StyledTableRow key={historyRow.date}>
                      <StyledTableCell component="th" scope="row">
                        {historyRow.date}
                      </StyledTableCell>
                      <StyledTableCell>{historyRow.opponent}</StyledTableCell>
                      <StyledTableCell>{historyRow.score}</StyledTableCell>
                      <StyledTableCell align="right">{historyRow.state ? 'Victory' : 'Defeat'}</StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </StyledTableCell>
      </StyledTableRow>
    </React.Fragment>
  );
}

//ID, USERNAME, RANK, LEVEL, VICTORY, DEFEAT, ACHIEVEMENT
// Faire en sorte d'afficher les joueurs en fonctions du meilleur rang ou du meilleur score de victoire
// Lier la data via prisma pour l'affichage des joueurs avec createData
// Le rank doit etre calcule en fonction du ratio
const rows = [
  createData(1, 'Pierre', 3, 6.0, 24, 12, 20),
  createData(2, 'Patrick', 4, 9.0, 37, 23, 30),
  createData(3, 'Paul', 7, 16.0, 24, 4, 43),
  createData(4, 'John', 2, 3.7, 67, 11, 25),
  createData(5, 'Johnny', 14, 16.0, 22, 22, 22),
  createData(6, 'PAloo', 12, 6.0, 24, 12, 20),
  createData(7, 'Klawy', 1, 9.0, 37, 23, 30),
  createData(8, 'Lposjo62', 5, 16.0, 24, 4, 43),
  createData(9, 'Alberto435', 8, 3.7, 67, 11, 25),
  createData(10, 'Lodij', 6, 16.0, 22, 22, 22),
  createData(11, 'Kammen', 15, 6.0, 24, 12, 20),
  createData(12, 'Zeubi23', 13, 9.0, 37, 23, 30),
  createData(13, 'Popopo', 10, 16.0, 24, 4, 43),
  createData(14, 'CNDJ', 9, 3.7, 67, 11, 25),
  createData(15, 'asoupaso', 11, 16.0, 22, 22, 22),
];


// Fonction principal Leaderboard pour display le leaderboard complet
export default function Leaderboard() {
  const [page, setPage] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const rowssort = (open ? rows.sort((a, b) => (a.rank < b.rank ? 1 : -1)) : rows.sort((a, b) => (a.rank > b.rank ? 1 : -1)));
  const rpp = (rowsPerPage > 0 ? rowssort.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : rowssort );
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <StyledTableRow>
            <StyledTableCell>
              <IconButton
                aria-label="expand row"
                size="small"
                onClick={() => setOpen(!open)}
                color="inherit"
                >
                {open ? <ImportExportIcon /> : <ImportExportIcon />}
              </IconButton>
            </StyledTableCell>
            <StyledTableCell style={{ fontWeight: 'bold' }}>Rank</StyledTableCell>
			      <StyledTableCell style={{ fontWeight: 'bold' }}>Id</StyledTableCell>
            <StyledTableCell style={{ fontWeight: 'bold' }}>Username</StyledTableCell>
            <StyledTableCell style={{ fontWeight: 'bold' }}>Level</StyledTableCell>
            <StyledTableCell style={{ fontWeight: 'bold' }} align="right">Victory</StyledTableCell>
            <StyledTableCell style={{ fontWeight: 'bold' }} align="right">Defeat</StyledTableCell>
            <StyledTableCell style={{ fontWeight: 'bold' }} align="right">Ratio</StyledTableCell>
            <StyledTableCell style={{ fontWeight: 'bold' }} align="right">Achievement</StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {rpp.map((row) => (<Row key={row.name} row={row} />))}
          {emptyRows > 0 && ( <StyledTableRow style={{ height: 70 * emptyRows }}><StyledTableCell colSpan={10} /></StyledTableRow>)}
        </TableBody>
        <TableFooter>
          <StyledTableRow>
            <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                  colSpan={10}
                  count={rows.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  SelectProps={{
                    inputProps: {
                      'aria-label': 'rows per page',
                    },
                    native: true,
                  }}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                />
          </StyledTableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}