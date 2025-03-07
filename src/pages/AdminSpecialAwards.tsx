import { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Box,
  TextField,
  Container,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import useSpecialAwardStore from "../store/map_stores/mapAwardToTeamStore";

export default function AdminSpecialAwardsPage() {
  const {
    awards,
    isLoading,
    error,
    getAllAwards,
    createAward,
    deleteAward,
  } = useSpecialAwardStore();

  // State variables
  const [awardName, setAwardName] = useState("");
  const [isJudge, setIsJudge] = useState(false); // New state for judge boolean

  useEffect(() => {
    getAllAwards();
  }, []);

  // Create a new award with isJudge option
  const handleCreateAward = async () => {
    if (awardName) {
      await createAward({ teamid: 0, award_name: awardName, isjudge: isJudge }); // Include isJudge
      setAwardName("");
      setIsJudge(false); // Reset checkbox
      getAllAwards(); // Refresh list
    }
  };

  // Delete an award
  const handleDeleteAward = async (teamid: number, award_name: string) => {
    await deleteAward(teamid, award_name);
    getAllAwards();
  };

  return (
    <Container>
      <Typography variant="h1" sx={{ m: 5 }}>
        Special Awards Management
      </Typography>

      {/* Award name input field */}
      <TextField
        label="Award Name"
        variant="outlined"
        fullWidth
        value={awardName}
        onChange={(e) => setAwardName(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Checkbox for Judge Assignment */}
      <FormControlLabel
        control={
          <Checkbox
            checked={isJudge}
            onChange={(e) => setIsJudge(e.target.checked)}
          />
        }
        label="Is this award assigned by a judge?"
      />

      {/* Create award button under the checkbox */}
      <Button variant="contained" onClick={handleCreateAward} sx={{ mb: 2, display: "block" }}>
        Create Award
      </Button>

      {isLoading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}

      {/* List of all awards */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h4">All Awards</Typography>
        {Array.isArray(awards) && awards.length > 0 ? (
          awards.map((award) => (
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
              {/* Button to delete the award */}
              <Button color="error" onClick={() => handleDeleteAward(award.teamid, award.award_name)}>
                Delete
              </Button>
            </Box>
          ))
        ) : (
          <Typography>No awards found.</Typography>
        )}
      </Box>
    </Container>
  );
}
