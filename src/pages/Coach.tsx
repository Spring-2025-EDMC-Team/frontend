import * as React from "react";
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
import { useAuthStore } from "../store/primary_stores/authStore";
import { useMapCoachToTeamStore } from "../store/map_stores/mapCoachToTeamStore";
import { useEffect } from "react";
import { useMapContestToTeamStore } from "../store/map_stores/mapContestToTeamStore";
import CoachTeamScoresTable from "../components/Tables/CoachTeamScoresTable";

export default function Coach() {
  const { role } = useAuthStore();
  const { teams, fetchTeamsByCoachId, clearTeams } = useMapCoachToTeamStore();
  const { contestsForTeams, fetchContestsByTeams, clearContests } =
    useMapContestToTeamStore();

  useEffect(() => {
    if (role?.user.id) {
      fetchTeamsByCoachId(role?.user.id);
    }
    return () => {
      clearTeams();
    };
  }, [role]);

  useEffect(() => {
    if (teams.length > 0) {
      fetchContestsByTeams(teams);
    }
    return () => {
      clearContests();
    };
  }, [teams]);

  useEffect(() => {
    const handlePageHide = () => {
      clearContests();
      clearTeams();
    };

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

  function createData(
    id: number,
    name: any,
    contest: any,
    isDisqualified: boolean
  ) {
    return {
      id,
      name,
      contest,
      isDisqualified,
    };
  }

  function Row(props: { row: ReturnType<typeof createData>; index: number }) {
    const { row, index } = props;
    const [open, setOpen] = React.useState(false);

    return (
      <React.Fragment>
        <TableRow
          sx={{ "& > *": { borderBottom: "none" } }}
          onClick={() => setOpen(!open)}
        >
          <TableCell>
            <IconButton aria-label="expand row" size="small">
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell component="th" scope="row">
            {row.name}
          </TableCell>
          <TableCell>{row.contest}</TableCell>
          {row.isDisqualified && (
            <TableCell sx={{ color: "red" }}>Disqualified</TableCell>
          )}
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <CoachTeamScoresTable team={teams[index]} />
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }
  const rows = teams.map((team) =>
    createData(
      team.id,
      team.team_name,
      contestsForTeams[team.id]?.name,
      team.organizer_disqualified
    )
  );

  return (
    <>
      <Typography variant="h1" sx={{ ml: "2%", mr: 5, mt: 4, mb: 4 }}>
        Coach Dashboard
      </Typography>
      <Container
        sx={{
          width: "90vw",
          height: "auto",
          padding: 3,
          bgcolor: theme.palette.secondary.light,
          ml: "2%",
          mr: 1,
          mb: 3,
          borderRadius: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
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
