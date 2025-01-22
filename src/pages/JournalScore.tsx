import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/primary_stores/authStore";
import { useTeamStore } from "../store/primary_stores/teamStore";
import { journalQuestions } from "../data/journalQuestions";
import ScoreSheetTable from "../components/Tables/ScoreSheetTable";
import { useEffect } from "react";

export default function JournalScore() {
  const { role } = useAuthStore();
  const { team, fetchTeamById } = useTeamStore();
  const { judgeId, teamId } = useParams();
  const navigate = useNavigate();
  const parsedJudgeId = judgeId ? parseInt(judgeId, 10) : null;
  const parsedTeamId = teamId ? parseInt(teamId, 10) : null;

  // Navigate if judgeId doesn't match
  useEffect(() => {
    if (role?.user_type === 3 && parsedJudgeId !== role.user.id) {
      navigate(`/journal-score/${role.user.id}/${teamId}/`);
    }
  }, [judgeId, role, parsedJudgeId, teamId, navigate]);

  useEffect(() => {
    if (parsedTeamId) {
      fetchTeamById(parsedTeamId);
    }
  }, [parsedTeamId, fetchTeamById]);

  return (
    <>
      <ScoreSheetTable
        sheetType={2}
        title="Journal Score"
        teamName={team?.team_name || ""}
        teamId={parsedTeamId}
        judgeId={parsedJudgeId}
        questions={journalQuestions}
        seperateJrAndSr={false}
      />
    </>
  );
}
