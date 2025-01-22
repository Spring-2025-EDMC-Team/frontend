import { CircularProgress, Link, Typography } from "@mui/material";
import JudgeDashboardTable from "../components/Tables/JudgeDashboardTable";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/primary_stores/authStore";
import { useJudgeStore } from "../store/primary_stores/judgeStore";
import { useEffect, useState } from "react";
import { useMapClusterJudgeStore } from "../store/map_stores/mapClusterToJudgeStore";
import useClusterTeamStore from "../store/map_stores/mapClusterToTeamStore";
import { Team } from "../types";

export default function Judging() {
  const navigate = useNavigate();
  const { role } = useAuthStore();

  const { judgeId } = useParams();
  const judgeIdNumber = judgeId ? parseInt(judgeId, 10) : null;
  const { judge, fetchJudgeById, clearJudge } = useJudgeStore();
  const { fetchClusterByJudgeId, cluster, clearCluster } =
    useMapClusterJudgeStore();
  const {
    getTeamsByClusterId,
    teamsByClusterId,
    mapClusterToTeamError,
    clearClusterTeamMappings,
    clearTeamsByClusterId,
  } = useClusterTeamStore();
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    if (judgeIdNumber) {
      fetchJudgeById(judgeIdNumber);
    }
  }, [fetchJudgeById, judgeIdNumber]);

  useEffect(() => {
    if (judgeIdNumber) {
      fetchClusterByJudgeId(judgeIdNumber);
    }
  }, [fetchClusterByJudgeId, judgeIdNumber]);

  useEffect(() => {
    if (cluster) {
      getTeamsByClusterId(cluster.id).finally(() => {});
    }
  }, [getTeamsByClusterId, cluster]);

  useEffect(() => {
    if (teamsByClusterId && cluster?.id) {
      const fetchedTeams = teamsByClusterId[cluster.id] || [];
      setTeams(fetchedTeams);
    }
  }, [teamsByClusterId, cluster]);

  useEffect(() => {
    const handlePageHide = () => {
      clearCluster();
      clearClusterTeamMappings();
      clearTeamsByClusterId();
      clearJudge();
    };

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

  return (
    <>
      {mapClusterToTeamError ? (
        <CircularProgress />
      ) : (
        <>
          {(role?.user_type == 2 || role?.user_type == 1) && (
            <Link
              onClick={() => navigate(-1)}
              sx={{ textDecoration: "none" }}
              style={{ cursor: "pointer" }}
            >
              <Typography variant="body2" sx={{ m: 2 }}>
                {"<"} Back to Manage Contest{" "}
              </Typography>
            </Link>
          )}
          <Typography variant="h1" sx={{ ml: "2%", mr: 5, mt: 5, mb: 2 }}>
            Judge Dashboard
          </Typography>
          <Typography variant="body1" sx={{ ml: "2%", mr: 5, mb: 5 }}>
            {judge?.first_name + " " + judge?.last_name}
          </Typography>
          {teams.length > 0 ? (
            <JudgeDashboardTable teams={teams} />
          ) : (
            <Typography>No teams available for this cluster.</Typography>
          )}
        </>
      )}
    </>
  );
}
