import { useEffect} from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/primary_stores/authStore";
import { useTeamStore } from "../store/primary_stores/teamStore";
import { journalQuestions } from "../data/journalQuestions";
import MultiTeamScoreTable from "../components/Tables/MutliTeamScoreTable";

export default function MultiTeamJournalScore() {
  const { role } = useAuthStore();
  const { teams, fetchAllTeams } = useTeamStore();
  const { judgeId, contestId } = useParams();
  const navigate = useNavigate();
  const parsedJudgeId = judgeId ? parseInt(judgeId, 10) : null;

  useEffect(() => {
    if (role?.user_type === 3 && parsedJudgeId !== role.user.id) {
      navigate(`/multi-team-journal-score/${role.user.id}/${contestId}/`);
    }
  }, [judgeId, role, contestId, navigate]);

  useEffect(() => {
    fetchAllTeams();
  }, []); 

  if (parsedJudgeId === null) return null;

  return (
    <MultiTeamScoreTable
      sheetType={2}
      title="Journal Scores"
      teams = {teams.map(team => ({id: team.id, name: team.team_name}))}
      questions={journalQuestions}
      judgeId={parsedJudgeId}
      seperateJrAndSr={true}
    />
  );
}