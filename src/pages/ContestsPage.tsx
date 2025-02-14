import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { Container } from "@mui/material";
import theme from "../theme";
import { useContestStore } from "../store/primary_stores/contestStore";

export default function Contests() {
  const { allContests, fetchAllContests, isLoadingContest } = useContestStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllContests();
  }, []);

  function createData(id: number, name: string, date: string, is_open: boolean) {
    return { id, name, date, status: is_open ? "In Progress" : "Finalized" };
  }

  const handleRowClick = (contestId: number) => {
    navigate(`/contestresults/${contestId}`);
  };

  const rows = allContests.map((contest) => createData(contest.id, contest.name, contest.date, contest.is_open));

  return (
    <>
      <Typography variant="h1" sx={{ ml: "2%", mt: 4, mb: 4 }}>
        Contests
      </Typography>
      <Container
        sx={{
          width: "90vw",
          padding: 3,
          bgcolor: theme.palette.secondary.light,
          ml: "2%",
          borderRadius: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TableContainer component={Paper}>
          <Table aria-label="contest table">
            <TableBody>
              {isLoadingContest ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography>Loading contests...</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{ cursor: "pointer" }}
                    onClick={() => handleRowClick(row.id)}
                  >
                    <TableCell component="th" scope="row">{row.name}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell sx={{ color: row.status === "In Progress" ? "green" : "red" }}>
                      {row.status}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </>
  );
}
