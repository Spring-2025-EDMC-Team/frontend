import { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Container,
  CircularProgress,
} from "@mui/material";
import useSpecialAwardStore from "../store/map_stores/mapAwardToTeamStore";
import axios from "axios";

// Define Team interface
interface Team {
  id: number;
  team_name: string;
}

export default function AdminSpecialAwardsPage() {
  const {
    awards,
    isLoading,
    error,
    getAwardsByTeam,
    createAward,
    deleteAward,
  } = useSpecialAwardStore();

  const [teams, setTeams] = useState<Team[]>([]);
  const [teamId, setTeamId] = useState("");
  const [awardName, setAwardName] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");

  // Fetch teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const token = localStorage.getItem("token"); 
        const response = await axios.get("/api/team/getAllTeams/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setTeams(response.data.teams);
      } catch (error) {
        console.error("Failed to fetch teams", error);
      }
    };
  
    fetchTeams();
  }, []);

  // Fetch awards for team when selected team changes
  useEffect(() => {
    if (selectedTeamId) {
      getAwardsByTeam(Number(selectedTeamId));
    } else {
      // Clear awards when no team is selected
      awards.length && getAwardsByTeam(0); 
    }
  }, [selectedTeamId, getAwardsByTeam]);

  // Create award 
  const handleCreateAward = async () => {
    if (teamId && awardName) {
      await createAward({ teamid: Number(teamId), award_name: awardName });
      setAwardName("");
      setTeamId("");
    }
  };

  // Delete award
  const handleDeleteAward = async (teamid: number, award_name: string) => {
    await deleteAward(teamid, award_name);
  };

  return (
    <Container>
      <Typography variant="h1" sx={{ m: 5 }}>
        Special Awards Management
      </Typography>

      {/* Select Team Dropdown */}
    <FormControl fullWidth sx={{ mb: 2 }}>
    <InputLabel>Select Team</InputLabel>
    <Select
        value={selectedTeamId}
        onChange={(e) => {
        setSelectedTeamId(e.target.value);
        setTeamId(e.target.value); 
        }}
    >
        {teams.map((team) => (
        <MenuItem key={team.id} value={team.id}>
            {team.team_name || "Unnamed Team"}
        </MenuItem>
        ))}
    </Select>
    </FormControl>


      {/* Award Name Input */}
      <TextField
        label="Award Name"
        variant="outlined"
        fullWidth
        value={awardName}
        onChange={(e) => setAwardName(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Create Award Button */}
      <Button
        variant="contained"
        onClick={handleCreateAward}
        sx={{ mb: 2 }}
      >
        Create Award
      </Button>

      {/* Loading and Error States */}
      {isLoading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}

      {/* Awards List */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h4">Awards for Selected Team</Typography>
        {awards.map((award) => (
          <Box
            key={`${award.teamid}-${award.award_name}`}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              border: "1px solid #ddd",
              borderRadius: 2,
              mb: 1,
            }}
          >
            <Typography>{award.award_name}</Typography>
            <Button
              color="error"
              onClick={() => handleDeleteAward(award.teamid, award.award_name)}
            >
              Delete
            </Button>
          </Box>
        ))}
      </Box>
    </Container>
  );
}