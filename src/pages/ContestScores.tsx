import * as React from "react";
import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Container } from "@mui/material";
import theme from "../theme";
import { useMapContestToTeamStore } from "../store/map_stores/mapContestToTeamStore";
import ContestTeamScoresTable from "../components/Tables/ContestTeamScoresTable";

export default function ContestScores() {
  const { contestId } = useParams<{ contestId: string }>();
  const contestIdNumber = contestId ? parseInt(contestId, 10) : null;

  const {
    teamsByContest,
    fetchTeamsByContest,
    clearTeamsByContest,
    contestsForTeams,
    fetchContestsByTeams,
    clearContests,
  } = useMapContestToTeamStore();

  useEffect(() => {
    if (contestIdNumber) {
      fetchTeamsByContest(contestIdNumber);
    }
    return () => {
      clearTeamsByContest();
      clearContests();
    };
  }, [contestIdNumber]);

  useEffect(() => {
    if (teamsByContest.length > 0) {
      fetchContestsByTeams(teamsByContest);
    }
  }, [teamsByContest]);

  useEffect(() => {
    const handlePageHide = () => {
      clearTeamsByContest();
      clearContests();
    };

    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

  function createData(id: number, name: string, contest: string, isDisqualified: boolean) {
    return { id, name, contest, isDisqualified };
  }

  function Row(props: { row: ReturnType<typeof createData>; index: number }) {
    const { row, index } = props;
    const [open, setOpen] = React.useState(false);

    return (
      <>
        <TableRow
          sx={{ "& > *": { borderBottom: "none" } }}
          onClick={() => setOpen(!open)}
        >
          <TableCell>
            <IconButton aria-label="expand row" size="small">
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell>{row.name}</TableCell>
          <TableCell>
            Score: {teamsByContest[index]?.total_score ?? "N/A"}
            </TableCell>
          {row.isDisqualified && (
            <TableCell sx={{ color: "red" }}>Disqualified</TableCell>
          )}
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <ContestTeamScoresTable team={teamsByContest[index]} />
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  }

  const rows = teamsByContest.map((team) =>
    createData(
      team.id,
      team.team_name,
      contestsForTeams[team.id]?.name || "N/A",
      team.organizer_disqualified
    )
  );

  return (
    <>
      <Typography variant="h1" sx={{ ml: "2%", mt: 4, mb: 4 }}>
        Contest Results
      </Typography>
      
      <Link to="/contestPage/" style={{ textDecoration: "none", color: "inherit" }}>
        <Typography variant="body2" sx={{ ml: 2, mt: 2 }}>
          {"<"} Back to Contests{" "}
        </Typography>
      </Link>

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
        }}
      >
        <TableContainer component={Paper}>
          <Table aria-label="collapsible table">
            <TableBody>
              {rows.map((row, index) => (
                <Row key={row.id} row={row} index={index} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </>
  );
}
