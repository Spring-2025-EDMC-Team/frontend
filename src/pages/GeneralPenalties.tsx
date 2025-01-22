import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  Container,
  IconButton,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/primary_stores/authStore";
import { useParams, useNavigate } from "react-router-dom";
import { useTeamStore } from "../store/primary_stores/teamStore";
import theme from "../theme";
import React from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import useMapScoreSheetStore from "../store/map_stores/mapScoreSheetStore";
import { useScoreSheetStore } from "../store/primary_stores/scoreSheetStore";
import AreYouSureModal from "../components/Modals/AreYouSureModal";
import { generalPenaltiesQuestions } from "../data/generalPenaltiesQuestions";
import PenaltyCategory from "../components/PenaltyCategory";
import { ScoreSheet } from "../types";
import { useJudgeStore } from "../store/primary_stores/judgeStore";

export default function GeneralPenalties() {
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
  const { judgeDisqualifyTeam, judgeError } = useJudgeStore();
  const navigate = useNavigate();
  const parsedJudgeId = judgeId ? parseInt(judgeId, 10) : null;
  const parsedTeamId = teamId ? parseInt(teamId, 10) : null;
  const [openPresentation, setOpenPresentation] = useState(false);
  const [openJournal, setOpenJournal] = useState(false);
  const [openMachineSpecifications, setOpenMachineSpecifications] =
    useState(false);
  const [openDisqualifications, setOpenDisqualifications] = useState(false);
  const [openAreYouSure, setOpenAreYouSure] = useState(false);
  const [openConfirmDisqualification, setOpenConfirmDisqualification] =
    useState(false);
  const [penaltyState, setPenaltyState] = useState<{ [key: number]: number }>(
    Object.fromEntries(Array.from({ length: 7 }, (_, i) => [i + 1, 0]))
  );

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
      fetchScoreSheetId(parsedJudgeId, parsedTeamId, 5);
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
      const newPenaltyState: { [key: number]: number } = {};

      generalPenaltiesQuestions.forEach((question) => {
        const fieldValue = Number(
          scoreSheet[question.field as keyof ScoreSheet]
        );
        const pointValue = question.pointValue;
        newPenaltyState[question.id] =
          fieldValue === 0 ? 0 : fieldValue / pointValue;
      });

      setPenaltyState(newPenaltyState);
    } else {
      setPenaltyState({});
    }
  }, [scoreSheet, parsedJudgeId, parsedTeamId]);

  // Function to calculate penalties based on generalPenaltiesQuestions
  const calculatePenalties = () => {
    return generalPenaltiesQuestions.reduce((acc, question) => {
      const fieldValue = penaltyState[question.id];
      if (fieldValue !== undefined) {
        acc[question.field] = fieldValue * question.pointValue;
      }
      return acc;
    }, {} as Record<string, number>);
  };

  const handleSavePenalties = async () => {
    if (scoreSheet) {
      const penalties = calculatePenalties(); // Calculate penalties dynamically
      await updateScores({
        id: scoreSheet.id,
        ...penalties, // Spread the penalty fields dynamically
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

  async function handleDisqualify() {
    if (parsedTeamId) {
      await judgeDisqualifyTeam(parsedTeamId, true);
      fetchTeamById(parsedTeamId);
      handleSubmitPenalties();
    }
  }

  const journalPenalties = generalPenaltiesQuestions.filter(
    (penalty) => penalty.penaltyType === "Journal"
  );

  const presentationPenalties = generalPenaltiesQuestions.filter(
    (penalty) => penalty.penaltyType === "Presentation"
  );

  const machineSpecificationPenalties = generalPenaltiesQuestions.filter(
    (penalty) => penalty.penaltyType === "Machine Specification"
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
        General Penalties
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
                isOpen={openJournal}
                toggleOpen={() => setOpenJournal(!openJournal)}
                categoryTitle="Journal Penalties"
                fields={journalPenalties.map((penalty) => ({
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
                isOpen={openPresentation}
                toggleOpen={() => setOpenPresentation(!openPresentation)}
                categoryTitle="Presentation Penalties"
                fields={presentationPenalties.map((penalty) => ({
                  fieldId: penalty.id,
                  text: penalty.questionText,
                  points: penalty.pointText,
                  disabled:
                    (penalty.id == 2 && penaltyState[3] == 1) ||
                    (penalty.id == 3 && penaltyState[2] == 1),
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
                isOpen={openMachineSpecifications}
                toggleOpen={() =>
                  setOpenMachineSpecifications(!openMachineSpecifications)
                }
                categoryTitle="Machine Specification Penalties"
                fields={machineSpecificationPenalties.map((penalty) => ({
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
              <React.Fragment>
                <TableRow
                  sx={{
                    "& > *": { borderBottom: "unset" },
                    boxShadow: openDisqualifications
                      ? "0 2px 8px rgba(0, 0, 0, 0.15)"
                      : "none",
                    transition: "box-shadow 0.3s ease",
                  }}
                  onClick={() =>
                    setOpenDisqualifications(!openDisqualifications)
                  }
                >
                  <TableCell>
                    <IconButton aria-label="expand row" size="small">
                      {openDisqualifications ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )}
                    </IconButton>
                  </TableCell>
                  <TableCell component="th" scope="row">
                    <Typography>Disqualification</Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    style={{ paddingBottom: 0, paddingTop: 0 }}
                    colSpan={6}
                  >
                    <Collapse
                      in={openDisqualifications}
                      timeout="auto"
                      unmountOnExit
                    >
                      <Box
                        sx={{
                          pt: 1,
                          pb: 1,
                          pl: 0.75,
                          pr: 0.75,
                          flexDirection: "column",
                        }}
                      >
                        <Box component="ul" sx={{ pl: 2, mb: 1 }}>
                          <Typography component="li" sx={{ mb: 1.5 }}>
                            Corporate logos without written permission. If
                            permission to use a logo is granted, a written
                            letter of permission must be provided and be kept
                            with the machine.
                          </Typography>
                          <Typography component="li" sx={{ mb: 1.5 }}>
                            Safety issues as deemed by the Judging Committee.
                          </Typography>
                          <Typography component="li" sx={{ mb: 1.5 }}>
                            Use of live animals, hazardous material (toxic,
                            noxious, dangerous), explosives, or flames.
                          </Typography>
                          <Typography component="li" sx={{ mb: 1.5 }}>
                            Use of profane, indecent or lewd expressions,
                            offensive symbols, graphics, or language.
                          </Typography>
                          <Typography component="li" sx={{ mb: 1.5 }}>
                            Any device requiring a combustion engine.
                          </Typography>
                          <Typography component="li" sx={{ mb: 1.5 }}>
                            Unsafe machine or intentionally causing loose/flying
                            objects to go outside set boundaries of the machine.
                          </Typography>
                          <Typography component="li">
                            Damaging another team’s machine.
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mb: 2,
                          mt: 1,
                        }}
                      >
                        <Button
                          variant="contained"
                          onClick={() => setOpenConfirmDisqualification(true)}
                        >
                          Disqualify Team
                        </Button>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
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
        <AreYouSureModal
          open={openConfirmDisqualification}
          handleClose={() => setOpenConfirmDisqualification(false)}
          title={`Are you sure you want to disqualify ${team?.team_name}?`}
          handleSubmit={() => handleDisqualify()}
          error={judgeError}
        />
      </Container>
    </>
  );
}
