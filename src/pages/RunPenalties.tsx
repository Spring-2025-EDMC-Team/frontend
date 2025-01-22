import {
  Button,
  CircularProgress,
  Container,
  Link,
  Paper,
  Table,
  TableBody,
  TableContainer,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/primary_stores/authStore";
import { useParams, useNavigate } from "react-router-dom";
import { useTeamStore } from "../store/primary_stores/teamStore";
import theme from "../theme";
import useMapScoreSheetStore from "../store/map_stores/mapScoreSheetStore";
import { useScoreSheetStore } from "../store/primary_stores/scoreSheetStore";
import AreYouSureModal from "../components/Modals/AreYouSureModal";
import { runPenaltiesQuestions } from "../data/runPenaltiesQuestions";
import { ScoreSheet } from "../types";
import PenaltyCategory from "../components/PenaltyCategory";

export default function Penalties() {
  const { role } = useAuthStore();
  const { judgeId, teamId } = useParams();
  const { team, fetchTeamById } = useTeamStore();
  const { scoreSheetId, fetchScoreSheetId } = useMapScoreSheetStore();
  const {
    scoreSheet,
    fetchScoreSheetById,
    isLoadingScoreSheet,
    updateScores,
    editScoreSheet,
    scoreSheetError,
  } = useScoreSheetStore();
  const navigate = useNavigate();
  const parsedJudgeId = judgeId ? parseInt(judgeId, 10) : null;
  const parsedTeamId = teamId ? parseInt(teamId, 10) : null;
  const [openMachineOperationRound1, setOpenMachineOperationRound1] =
    useState(false);
  const [openMachineOperationRound2, setOpenMachineOperationRound2] =
    useState(false);
  const [openAreYouSure, setOpenAreYouSure] = useState(false);
  const [penaltyState, setPenaltyState] = useState<{
    [key: number]: number | string;
  }>([...Array(17)].reduce((acc, _, i) => ({ ...acc, [i + 1]: 0 }), {}));

  useEffect(() => {
    if (role?.user_type === 3 && parsedJudgeId !== role.user.id) {
      navigate(`/penalties/${role.user.id}/${parsedTeamId}/`);
    }
  }, [parsedJudgeId]);

  useEffect(() => {
    if (parsedTeamId) {
      fetchTeamById(parsedTeamId);
    }
  }, [parsedTeamId, fetchTeamById]);

  useEffect(() => {
    if (parsedJudgeId && parsedTeamId) {
      fetchScoreSheetId(parsedJudgeId, parsedTeamId, 4);
    }
  }, [parsedTeamId, parsedJudgeId, fetchScoreSheetId]);

  useEffect(() => {
    if (scoreSheetId) {
      fetchScoreSheetById(scoreSheetId);
    }
  }, [scoreSheetId, fetchScoreSheetById]);

  // fields are point values so to get number of occurrences we must divide by point value
  useEffect(() => {
    if (scoreSheet) {
      const newPenaltyState: { [key: number]: number | string } = {};
      for (let i = 1; i <= 17; i++) {
        const question = runPenaltiesQuestions.find((q) => q.id === i);

        if (question) {
          const fieldValue = Number(
            scoreSheet[question.field as keyof ScoreSheet]
          );
          const pointValue = question.pointValue;
          if (i === 9) {
            newPenaltyState[i] = "";
          } else if (pointValue != undefined) {
            newPenaltyState[i] = fieldValue === 0 ? 0 : fieldValue / pointValue;
          }
        } else {
          if (i === 9) {
            newPenaltyState[i] = "";
          } else {
            newPenaltyState[i] = 0;
          }
        }
      }

      setPenaltyState(newPenaltyState);
    } else {
      setPenaltyState({});
    }
  }, [scoreSheet, parsedJudgeId, parsedTeamId]);

  const calculatePenalties = () => {
    return runPenaltiesQuestions.reduce((acc, question) => {
      const fieldValue = penaltyState[question.id];

      if (question.id === 9) {
        acc[question.field] = "";
      } else if (fieldValue !== undefined) {
        acc[question.field] = Number(fieldValue) * question.pointValue;
      }

      return acc;
    }, {} as Record<string, number | string>);
  };

  const handleSavePenalties = async () => {
    if (scoreSheet) {
      const penalties = calculatePenalties();
      await updateScores({
        id: scoreSheet.id,
        ...penalties,
      });
    }
  };

  const handleSubmitPenalties = async () => {
    try {
      if (scoreSheet) {
        const penalties = calculatePenalties();
        await editScoreSheet({
          id: scoreSheet.id,
          sheetType: scoreSheet.sheetType,
          isSubmitted: true,
          ...penalties,
        });
      }
      setOpenAreYouSure(false);
      navigate(-1);
    } catch (error) {
      console.error(error);
    }
  };

  function handleCheckboxChange(field: number) {
    setPenaltyState((prevState) => ({
      ...prevState,
      [field]: prevState[field] === 1 ? 0 : 1,
    }));
  }

  function handleIncrement(field: number, upperBound: number) {
    setPenaltyState((prevState: any) => ({
      ...prevState,
      [field]: Math.min(prevState[field] + 1, upperBound),
    }));
  }

  function handleDecrement(field: number, lowerBound: number) {
    setPenaltyState((prevState: any) => ({
      ...prevState,
      [field]: Math.max(prevState[field] - 1, lowerBound),
    }));
  }

  const runOneQuestions = runPenaltiesQuestions.filter(
    (penalty) => penalty.penaltyType === "Machine Operation Run 1"
  );

  const runTwoQuestions = runPenaltiesQuestions.filter(
    (penalty) => penalty.penaltyType === "Machine Operation Run 2"
  );

  return isLoadingScoreSheet ? (
    <CircularProgress />
  ) : (
    <>
      <Link
        onClick={() => navigate(-1)}
        sx={{ textDecoration: "none" }}
        style={{ cursor: "pointer" }}
      >
        <Typography variant="body2" sx={{ m: 2 }}>
          {"<"} Back to Judging Dashboard{" "}
        </Typography>
      </Link>
      <Typography variant="h1" sx={{ ml: "2%", mr: 5, mt: 4, mb: 2 }}>
        Run Penalties
      </Typography>
      <Typography variant="body1" sx={{ ml: "2%", mr: 5, mb: 4 }}>
        {team?.team_name}
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
          textAlign: "center",
        }}
      >
        <Typography sx={{ mb: 3 }}>
          *Only enter penalty if penalty occurred
        </Typography>
        <Typography sx={{ mb: 3 }}>
          *Counters increment number of occurrences
        </Typography>
        <Button
          variant="contained"
          onClick={() => handleSavePenalties()}
          sx={{
            mb: 3,
            bgcolor: theme.palette.secondary.main,
            color: theme.palette.primary.main,
            width: 200,
            height: 45,
          }}
        >
          Save
        </Button>
        <TableContainer component={Paper}>
          <Table>
            <TableBody>
              <PenaltyCategory
                isOpen={openMachineOperationRound1}
                toggleOpen={() =>
                  setOpenMachineOperationRound1(!openMachineOperationRound1)
                }
                categoryTitle="Machine Operation Penalties Run 1"
                fields={runOneQuestions.map((penalty) => ({
                  fieldId: penalty.id,
                  text: penalty.questionText,
                  points: penalty.pointText,
                  disabled: false,
                  isIncrement: penalty.isIncrement,
                  incrementLowerBound: penalty.incrementLowerBound,
                  incrementUpperBound: penalty.incrementUpperBound,
                  yesOrNo: penalty.yesOrNo,
                }))}
                penaltyState={penaltyState}
                onCheckboxChange={handleCheckboxChange}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
              />
              <PenaltyCategory
                isOpen={openMachineOperationRound2}
                toggleOpen={() =>
                  setOpenMachineOperationRound2(!openMachineOperationRound2)
                }
                categoryTitle="Machine Operation Penalties Run 2"
                fields={runTwoQuestions.map((penalty) => ({
                  fieldId: penalty.id,
                  text: penalty.questionText,
                  points: penalty.pointText,
                  disabled: false,
                  isIncrement: penalty.isIncrement,
                  incrementLowerBound: penalty.incrementLowerBound,
                  incrementUpperBound: penalty.incrementUpperBound,
                  yesOrNo: penalty.yesOrNo,
                }))}
                penaltyState={penaltyState}
                onCheckboxChange={handleCheckboxChange}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
              />
            </TableBody>
          </Table>
        </TableContainer>
        <Button
          variant="contained"
          sx={{
            mt: 3,
            bgcolor: theme.palette.secondary.main,
            color: theme.palette.primary.main,
            width: 200,
            height: 45,
          }}
          onClick={() => setOpenAreYouSure(true)}
        >
          Submit
        </Button>
        <AreYouSureModal
          open={openAreYouSure}
          handleClose={() => setOpenAreYouSure(false)}
          title="Are you sure you want to submit?"
          handleSubmit={() => handleSubmitPenalties()}
          error={scoreSheetError}
        />
      </Container>
    </>
  );
}
