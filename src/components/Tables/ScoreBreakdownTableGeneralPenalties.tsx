import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useScoreSheetStore } from "../../store/primary_stores/scoreSheetStore";
import { GeneralPenaltiesScoreSheetFields, ScoreSheetType } from "../../types";
import { generalPenaltiesQuestions } from "../../data/generalPenaltiesQuestions";

export default function ScoreBreakdownTableGeneralPenalties() {
  const { scoreSheetBreakdown } = useScoreSheetStore();

  const PenaltiesRow: React.FC<{
    text: string;
    field: string;
    pointValue: number;
    penaltyType: string;
  }> = ({ text, field, pointValue, penaltyType }) => {
    return (
      <TableRow>
        <TableCell>
          <Typography>{text}</Typography>
        </TableCell>
        <TableCell>
          <Typography>{penaltyType}</Typography>
        </TableCell>
        <TableCell>
          <Typography>{pointValue}</Typography>
        </TableCell>
        <TableCell>
          {scoreSheetBreakdown &&
            scoreSheetBreakdown[ScoreSheetType.GeneralPenalties][
              GeneralPenaltiesScoreSheetFields[
                field as keyof typeof GeneralPenaltiesScoreSheetFields
              ]
            ].join(", ")}
        </TableCell>
      </TableRow>
    );
  };

  return scoreSheetBreakdown ? (
    <TableContainer
      sx={{ m: 5, minWidth: 550, maxWidth: "90vw" }}
      component={Box}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Penalty</TableCell>
            <TableCell>Penalty Type</TableCell>
            <TableCell>Point Value (Per occurrence if applicable)</TableCell>
            <TableCell>Points Deducted</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {generalPenaltiesQuestions.map((penalty) => (
            <PenaltiesRow
              text={penalty.questionText}
              field={penalty.field}
              pointValue={penalty.pointValue}
              penaltyType={penalty.penaltyType}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  ) : (
    <CircularProgress />
  );
}
