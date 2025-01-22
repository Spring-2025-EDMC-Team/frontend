import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/primary_stores/authStore";
import { useTeamStore } from "../store/primary_stores/teamStore";
import { presentationQuestions } from "../data/presentationQuestions";
import ScoreSheetTable from "../components/Tables/ScoreSheetTable";

export default function PresentationScore() {
  const { role } = useAuthStore();
  const { team, fetchTeamById } = useTeamStore();
  const { judgeId, teamId } = useParams();
  const navigate = useNavigate();
  const parsedJudgeId = judgeId ? parseInt(judgeId, 10) : null;
  const parsedTeamId = teamId ? parseInt(teamId, 10) : null;

  useEffect(() => {
    if (role?.user_type == 3 && parsedJudgeId != role.user.id) {
      navigate(`/presentation-score/${role.user.id}/${teamId}/`);
    }
  }, [judgeId]);

  useEffect(() => {
    if (parsedTeamId) {
      fetchTeamById(parsedTeamId);
    }
  }, [teamId, fetchTeamById]);

  return (
    <ScoreSheetTable
      sheetType={1}
      title="Presentation Score"
      teamName={team?.team_name || ""}
      questions={presentationQuestions}
      teamId={parsedTeamId}
      judgeId={parsedJudgeId}
      seperateJrAndSr={true}
    />
  );
}
