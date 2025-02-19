import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Typography, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import theme from "../theme";
import { useMapContestToTeamStore } from "../store/map_stores/mapContestToTeamStore";
import useSpecialAwardStore from "../store/map_stores/mapAwardToTeamStore";
import { useMapCoachToTeamStore } from "../store/map_stores/mapCoachToTeamStore";

export default function ContestScores() {
  const { contestId } = useParams<{ contestId: string }>();
  const contestIdNumber = contestId ? parseInt(contestId, 10) : null;

  const {
    teamsByContest,
    fetchTeamsByContest,
    clearTeamsByContest,
    clearContests
  } = useMapContestToTeamStore();

  // Zustand stores
  const { awards, AwardsByTeamTable } = useSpecialAwardStore();
  const { coachesByTeams, fetchCoachesByTeams } = useMapCoachToTeamStore();

  // Local state to store fetched coach name and awards
  const [coachNames, setCoachNames] = useState<{ [key: number]: string }>({});
  const [teamAwards, setTeamAwards] = useState<{ [key: number]: string }>({});

  // Fetch teams by contest
  useEffect(() => {
    if (contestIdNumber) {
      fetchTeamsByContest(contestIdNumber);
    }
    return () => {
      clearTeamsByContest();
      clearContests();
    };
  }, [contestIdNumber]);

  // Fetch coaches and awards 
  useEffect(() => {
    if (teamsByContest.length > 0) {
      // Format for fetching coaches 
      const teamData = teamsByContest.map((team) => ({ id: team.id }));
      fetchCoachesByTeams(teamData);
  
      // Format for fetching awards 
      teamsByContest.forEach((team) => {
        AwardsByTeamTable(team.id);
      });
    }
  }, [teamsByContest]);
  
  // update local state with coach names and team awards when data changes
  useEffect(() => {
    // map team id to coach names
    const newCoachNames = teamsByContest.reduce((acc, team) => {
      const teamCoachData = coachesByTeams[team.id];
      const fullName = teamCoachData ? `${teamCoachData.first_name || ""} ${teamCoachData.last_name || ""}`.trim() : "N/A";
      return { ...acc, [team.id]: fullName || "N/A" };
    }, {});
    
    // map team award to team id
    const newTeamAwards = teamsByContest.reduce((acc, team) => {
      const teamAwardsData = awards[team.id];
      let awardString = "N/A";
      if (Array.isArray(teamAwardsData)) {
        awardString = teamAwardsData.map((award) => award.award_name).join(", ") || "N/A";
      } else if (teamAwardsData) {
        awardString = teamAwardsData.award_name || "N/A";
      }
      return { ...acc, [team.id]: awardString };
    }, {});

    setCoachNames(newCoachNames);
    setTeamAwards(newTeamAwards);
  }, [awards, coachesByTeams, teamsByContest]);

  return (
    <>
      <Typography variant="h1" sx={{ ml: "2%", mt: 4, mb: 4 }}>
        Contest Results
      </Typography>

      <Link to="/contestPage/" style={{ textDecoration: "none", color: "inherit" }}>
        <Typography variant="body2" sx={{ ml: 2, mt: 2 }}>
          {"<"} Back to Contests {" "}
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
        <TableContainer component={Paper} elevation={3} sx={{ width: "100%", borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.primary.main }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Team Name</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Coach</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Rank</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Score</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Awards</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teamsByContest.map((team) => (
                <TableRow key={team.id} sx={{ "&:nth-of-type(odd)": { bgcolor: theme.palette.action.hover } }}>
                  <TableCell>{team.team_name}</TableCell>
                  <TableCell>{coachNames[team.id] || "N/A"}</TableCell>
                  <TableCell>{team.team_rank || 0}</TableCell>
                  <TableCell>{team.total_score}</TableCell>
                  <TableCell>{teamAwards[team.id] || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </>
  );
}