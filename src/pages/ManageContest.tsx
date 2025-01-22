import {
  Box,
  Button,
  CircularProgress,
  Container,
  Link,
  Tab,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import theme from "../theme";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import OrganizerJudgesTable from "../components/Tables/OrganizerJudgesTable";
import JudgeModal from "../components/Modals/JudgeModal";
import OrganizerTeamsTable from "../components/Tables/OrganizerTeamsTable";
import ClusterModal from "../components/Modals/ClusterModal";
import TeamModal from "../components/Modals/TeamModal";
import { useContestStore } from "../store/primary_stores/contestStore";
import { useMapClusterToContestStore } from "../store/map_stores/mapClusterToContestStore";
import useContestJudgeStore from "../store/map_stores/mapContestToJudgeStore";
import { useMapClusterJudgeStore } from "../store/map_stores/mapClusterToJudgeStore";
import { useJudgeStore } from "../store/primary_stores/judgeStore";
import { useMapCoachToTeamStore } from "../store/map_stores/mapCoachToTeamStore";
import useMapClusterTeamStore from "../store/map_stores/mapClusterToTeamStore";
import { useAuthStore } from "../store/primary_stores/authStore";

export default function ManageContest() {
  const { contestId } = useParams();
  const parsedContestId = contestId ? parseInt(contestId, 10) : 0;

  const [value, setValue] = useState(
    () => localStorage.getItem("activeTab") || "1"
  );
  const [openJudgeModal, setOpenJudgeModal] = useState(false);
  const [openClusterModal, setOpenClusterModal] = useState(false);
  const [openTeamModal, setOpenTeamModal] = useState(false);

  const { role } = useAuthStore();

  const { contest, fetchContestById, clearContest, isLoadingContest } =
    useContestStore();
  const {
    judges,
    getAllJudgesByContestId,
    clearJudges,
    isLoadingMapContestJudge,
  } = useContestJudgeStore();
  const {
    clusters,
    fetchClustersByContestId,
    clearClusters,
    isLoadingMapClusterContest,
  } = useMapClusterToContestStore();
  const {
    getTeamsByClusterId,
    teamsByClusterId,
    clearTeamsByClusterId,
    isLoadingMapClusterToTeam,
  } = useMapClusterTeamStore();
  const {
    fetchClustersForJudges,
    fetchJudgesByClusterId,
    judgesByClusterId,
    clearJudgesByClusterId,
    clearJudgeClusters,
    isLoadingMapClusterJudge,
  } = useMapClusterJudgeStore();
  const {
    checkAllScoreSheetsSubmitted,
    clearSubmissionStatus,
    isLoadingJudge,
  } = useJudgeStore();
  const { fetchCoachesByTeams, clearCoachesByTeams, isLoadingMapCoachToTeam } =
    useMapCoachToTeamStore();

  useEffect(() => {
    const loadContestData = async () => {
      if (parsedContestId) {
        await fetchContestById(parsedContestId);
        await getAllJudgesByContestId(parsedContestId);
        await fetchClustersByContestId(parsedContestId);
      }
    };

    loadContestData();
    return () => {
      clearContest();
      clearJudges();
      clearClusters();
    };
  }, [parsedContestId]);

  useEffect(() => {
    const fetchTeams = async () => {
      if (clusters && clusters.length > 0) {
        for (const cluster of clusters) {
          await getTeamsByClusterId(cluster.id);
          await fetchJudgesByClusterId(cluster.id);
        }
      }
    };

    fetchTeams();
    return () => {
      clearTeamsByClusterId();
    };
  }, [clusters, judges]);

  useEffect(() => {
    const fetchCoaches = async () => {
      if (clusters && clusters.length > 0) {
        for (const cluster of clusters) {
          const teams = teamsByClusterId[cluster.id];
          if (teams && teams.length > 0) {
            await fetchCoachesByTeams(teams);
          }
        }
      }
    };

    fetchCoaches();
    return () => {
      clearCoachesByTeams();
    };
  }, [clusters, teamsByClusterId]);

  useEffect(() => {
    const fetchClustersAndSubmissionStatus = async () => {
      if (judges.length > 0) {
        fetchClustersForJudges(judges);
        checkAllScoreSheetsSubmitted(judges);
      }
    };
    fetchClustersAndSubmissionStatus();
    return () => {
      clearSubmissionStatus();
      clearJudgeClusters();
    };
  }, [judges]);

  useEffect(() => {
    const handlePageHide = () => {
      clearClusters();
      clearContest();
      clearJudges();
      clearJudgesByClusterId();
      clearSubmissionStatus();
      clearTeamsByClusterId();
      clearJudgeClusters();
      clearCoachesByTeams();
    };

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

  const hasClusters = clusters.length > 0;
  const hasTeams = clusters.some(
    (cluster) => teamsByClusterId[cluster.id]?.length > 0
  );

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    localStorage.setItem("activeTab", newValue);
  };

  return isLoadingContest ||
    isLoadingJudge ||
    isLoadingMapClusterContest ||
    isLoadingMapClusterJudge ||
    isLoadingMapClusterToTeam ||
    isLoadingMapCoachToTeam ||
    isLoadingMapContestJudge ? (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "50vh",
      }}
    >
      <CircularProgress />
    </Box>
  ) : (
    <>
      {role?.user_type === 2 && (
        <Link href="/organizer" sx={{ textDecoration: "none" }}>
          <Typography variant="body2" sx={{ m: 2 }}>
            {"<"} Back to Dashboard{" "}
          </Typography>
        </Link>
      )}
      {role?.user_type === 1 && (
        <Link href="/admin" sx={{ textDecoration: "none" }}>
          <Typography variant="body2" sx={{ m: 2 }}>
            {"<"} Back to Dashboard{" "}
          </Typography>
        </Link>
      )}
      <Typography variant="h1" sx={{ m: 5 }}>
        Manage {contest?.name}
      </Typography>
      <Container
        sx={{
          width: "100vw",
          height: "auto",
          position: "absolute",
          padding: 3,
          bgcolor: `${theme.palette.secondary.light}`,
          ml: 5,
          borderRadius: 5,
        }}
      >
        {!contest?.is_open && (
          <>
            <Button
              variant="contained"
              onClick={() => setOpenJudgeModal(true)}
              disabled={!hasClusters || !hasTeams}
              sx={{
                mb: 2,
                bgcolor: `${theme.palette.secondary.main}`,
                color: `${theme.palette.primary.main}`,
              }}
            >
              Create Judge
            </Button>
            <Button
              variant="contained"
              onClick={() => setOpenClusterModal(true)}
              sx={{
                mb: 2,
                ml: 2,
                bgcolor: `${theme.palette.secondary.main}`,
                color: `${theme.palette.primary.main}`,
              }}
            >
              Create Cluster
            </Button>
            <Button
              variant="contained"
              onClick={() => setOpenTeamModal(true)}
              disabled={!hasClusters}
              sx={{
                mb: 2,
                ml: 2,
                bgcolor: `${theme.palette.secondary.main}`,
                color: `${theme.palette.primary.main}`,
              }}
            >
              Create Team
            </Button>
          </>
        )}
        <TabContext value={value}>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: `${theme.palette.secondary.main}`,
              borderTopLeftRadius: 5,
              borderTopRightRadius: 5,
            }}
          >
            <TabList onChange={handleChange}>
              <Tab label="Judges" value="1" />
              <Tab label="Teams" value="2" />
            </TabList>
          </Box>
          <TabPanel
            value="1"
            sx={{
              bgcolor: theme.palette.secondary.main,
              borderBottomLeftRadius: 5,
              borderBottomRightRadius: 5,
            }}
          >
            <OrganizerJudgesTable
              clusters={clusters}
              judgesByClusterId={judgesByClusterId}
              contestid={parsedContestId}
            />
          </TabPanel>
          <TabPanel value="2" sx={{ bgcolor: theme.palette.secondary.main }}>
            <OrganizerTeamsTable
              clusters={clusters}
              contestId={parsedContestId ?? 0}
            />
          </TabPanel>
        </TabContext>
      </Container>
      <JudgeModal
        open={openJudgeModal}
        handleClose={() => setOpenJudgeModal(false)}
        mode="new"
        clusters={clusters}
        contestid={parsedContestId}
      />
      <ClusterModal
        open={openClusterModal}
        handleClose={() => setOpenClusterModal(false)}
        mode="new"
        contestid={parsedContestId}
      />
      <TeamModal
        open={openTeamModal}
        handleClose={() => setOpenTeamModal(false)}
        mode="new"
        clusters={clusters}
        contestId={parsedContestId}
      />
    </>
  );
}
