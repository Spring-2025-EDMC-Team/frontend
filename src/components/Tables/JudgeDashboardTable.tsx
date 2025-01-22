import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Button,
  Box,
  Collapse,
  IconButton,
  CircularProgress,
  Container,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useJudgeStore } from "../../store/primary_stores/judgeStore";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMapScoreSheetStore } from "../../store/map_stores/mapScoreSheetStore";
import AreYouSureModal from "../Modals/AreYouSureModal";
import { useScoreSheetStore } from "../../store/primary_stores/scoreSheetStore";
import theme from "../../theme";
import useMapContestJudgeStore from "../../store/map_stores/mapContestToJudgeStore";
import { Team } from "../../types";

interface IJudgeDashboardProps {
  teams: Team[];
}

export default function JudgeDashboardTable(props: IJudgeDashboardProps) {
  const { teams } = props;
  const { judge, clearJudge } = useJudgeStore();
  const {
    mappings,
    fetchScoreSheetsByJudge,
    isLoadingMapScoreSheet,
    clearMappings,
  } = useMapScoreSheetStore();
  const { getContestByJudgeId, contest } = useMapContestJudgeStore();
  const [openRows, setOpenRows] = React.useState<{ [key: number]: boolean }>(
    {}
  );
  const { editScoreSheetField, scoreSheetError } = useScoreSheetStore();
  const [openAreYouSure, setOpenAreYouSure] = useState(false);
  // const { submitAllPenalties } = useMapScoreSheetStore();

  const [currentScoreSheetId, setCurrentScoreSheetId] = useState(-1);
  const [currentTeam, setCurrentTeam] = useState(-1);
  const [currentSheetType, setCurrentSheetType] = useState(-1);

  const navigate = useNavigate();

  const handleToggle = (teamId: number) => {
    setOpenRows((prevState) => ({
      ...prevState,
      [teamId]: !prevState[teamId],
    }));
  };

  const handleExpandAll = () => {
    const allExpanded = teams.reduce((acc, team) => {
      acc[team.id] = true;
      return acc;
    }, {} as { [key: number]: boolean });
    setOpenRows(allExpanded);
  };

  useEffect(() => {
    if (judge) {
      fetchScoreSheetsByJudge(judge.id);
      getContestByJudgeId(judge.id);
    }
  }, [judge]);

  useEffect(() => {
    const handlePageHide = () => {
      clearMappings();
      clearJudge();
    };

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

  const getIsSubmitted = (
    judgeId: number,
    teamId: number,
    sheetType: number
  ) => {
    const key = `${teamId}-${judgeId}-${sheetType}`;
    const data = mappings[key] || null;
    if (data?.scoresheet?.isSubmitted) {
      return true;
    }
    return false;
  };

  const getTotal = (judgeId: number, teamId: number, sheetType: number) => {
    const key = `${teamId}-${judgeId}-${sheetType}`;
    const data = mappings[key] || null;
    return data?.total;
  };

  const getScoreSheetId = (
    judgeId: number,
    teamId: number,
    sheetType: number
  ) => {
    const key = `${teamId}-${judgeId}-${sheetType}`;
    const data = mappings[key] || null;
    return data?.scoresheet?.id;
  };
  console.log(teams);

  const handleUnsubmitSheet = async () => {
    try {
      await editScoreSheetField(currentScoreSheetId, "isSubmitted", false);
      setOpenAreYouSure(false);
      switch (currentSheetType) {
        case 1:
          navigate(`/presentation-score/${judge?.id}/${currentTeam}`);
          break;
        case 2:
          navigate(`/journal-score/${judge?.id}/${currentTeam}`);
          break;
        case 3:
          navigate(`/machine-score/${judge?.id}/${currentTeam}`);
          break;
        case 4:
          navigate(`/run-penalties/${judge?.id}/${currentTeam}`);
          break;
        case 5:
          navigate(`/general-penalties/${judge?.id}/${currentTeam}`);
          break;
        default:
          break;
      }
    } catch {}
  };

  const handleOpenAreYouSure = (
    scoreSheetId: number | undefined,
    teamId: number,
    sheetType: number
  ) => {
    if (scoreSheetId) {
      setCurrentScoreSheetId(scoreSheetId);
      setCurrentTeam(teamId);
      setCurrentSheetType(sheetType);
      setOpenAreYouSure(true);
    }
  };

  // async function submitAllPenaltySheets() {
  //   if (judge?.id) {
  //     await submitAllPenalties(judge.id);
  //     await fetchScoreSheetsByJudge(judge.id);
  //   }
  // }

  function ScoreSheetButton(props: {
    team: Team;
    type: number;
    url: string;
    buttonText: string;
  }) {
    const { team, type, url, buttonText } = props;
    return (
      judge && (
        <>
          {!getIsSubmitted(judge?.id, team.id, type) ? (
            <Button
              variant="contained"
              onClick={() => {
                navigate(`/${url}/${judge.id}/${team.id}/`);
              }}
              sx={{ mb: 1 }}
            >
              {buttonText}
            </Button>
          ) : (
            <Button
              variant="contained"
              sx={{
                mb: 1,
                bgcolor: "grey",
              }}
              onClick={() =>
                handleOpenAreYouSure(
                  getScoreSheetId(judge?.id, team.id, type),
                  team.id,
                  type
                )
              }
            >
              {buttonText} {getTotal(judge?.id, team.id, type)}
            </Button>
          )}
        </>
      )
    );
  }

  return isLoadingMapScoreSheet ? (
    <CircularProgress />
  ) : (
    <>
      <Container
        sx={{
          width: "90vw",
          height: "auto",
          padding: 3,
          bgcolor: `${theme.palette.secondary.light}`,
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
        {/* {judge?.penalties && (
          <Button
            variant="contained"
            onClick={() => submitAllPenaltySheets()}
            sx={{
              mb: 2,
              bgcolor: theme.palette.secondary.main,
              color: theme.palette.primary.main,
              width: 200,
              height: 45,
            }}
          >
            Submit All Penalties
          </Button>
        )} */}
        <Button
          variant="contained"
          onClick={handleExpandAll}
          sx={{
            mb: 2,
            bgcolor: theme.palette.secondary.main,
            color: theme.palette.primary.main,
            width: 200,
            height: 45,
          }}
        >
          Expand All Teams
        </Button>
        <TableContainer component={Paper}>
          <Table>
            <TableBody>
              {teams.map((team: Team) => (
                <React.Fragment key={team.id}>
                  <TableRow onClick={() => handleToggle(team.id)}>
                    <TableCell>
                      <IconButton aria-label="expand row" size="small">
                        {openRows[team.id] ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ pl: 2, textAlign: "left", mr: 1 }}
                    >
                      {team.team_name}
                    </TableCell>
                    {team.judge_disqualified && team.organizer_disqualified && (
                      <TableCell
                        component="th"
                        scope="row"
                        sx={{ pl: 2, textAlign: "left", mr: 1, color: "red" }}
                      >
                        Disqualified
                      </TableCell>
                    )}
                  </TableRow>
                  <TableRow>
                    <TableCell
                      style={{ paddingBottom: 0, paddingTop: 0 }}
                      colSpan={6}
                    >
                      <Collapse
                        in={openRows[team.id]}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box
                          sx={{
                            margin: 1,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1,
                          }}
                        >
                          {judge?.journal && (
                            <ScoreSheetButton
                              team={team}
                              type={2}
                              url="journal-score"
                              buttonText="Journal"
                            />
                          )}
                          {judge?.presentation && contest?.is_open && (
                            <ScoreSheetButton
                              team={team}
                              type={1}
                              url="presentation-score"
                              buttonText="Presentation"
                            />
                          )}
                          {judge?.mdo && contest?.is_open && (
                            <ScoreSheetButton
                              team={team}
                              type={3}
                              url="machine-score"
                              buttonText="Machine Design and Operation"
                            />
                          )}
                          {judge?.runpenalties && (
                            <ScoreSheetButton
                              team={team}
                              type={4}
                              url="run-penalties"
                              buttonText="Run Penalties"
                            />
                          )}
                          {judge?.otherpenalties && (
                            <ScoreSheetButton
                              team={team}
                              type={5}
                              url="general-penalties"
                              buttonText="General Penalties"
                            />
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
      <AreYouSureModal
        open={openAreYouSure}
        handleClose={() => setOpenAreYouSure(false)}
        title="Are you sure you want to unsubmit this score sheet?"
        handleSubmit={() => handleUnsubmitSheet()}
        error={scoreSheetError}
      />
    </>
  );
}
