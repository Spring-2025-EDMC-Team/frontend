import { Button, Container } from "@mui/material";
import Modal from "./Modal";
import theme from "../../theme";
import AreYouSureModal from "./AreYouSureModal";
import { useState } from "react";
import useOrganizerStore from "../../store/primary_stores/organizerStore";
import { useJudgeStore } from "../../store/primary_stores/judgeStore";
import useMapClusterTeamStore from "../../store/map_stores/mapClusterToTeamStore";

export interface IDisqualificationModalProps {
  open: boolean;
  teamName: string;
  teamId: number;
  clusterId: number;
  handleClose: () => void;
}

export default function DisqualificationModal(
  props: IDisqualificationModalProps
) {
  const { handleClose, open, teamName, teamId, clusterId } = props;
  const { organizerDisqualifyTeam, organizerError } = useOrganizerStore();
  const { judgeDisqualifyTeam, judgeError } = useJudgeStore();
  const { getTeamsByClusterId, mapClusterToTeamError } =
    useMapClusterTeamStore();

  const [openAreYouSureConfirm, setOpenAreYouSureConfirm] = useState(false);
  const [openAreYouSureReverse, setOpenAreYouSureReverse] = useState(false);

  const handleConfirm = async () => {
    await organizerDisqualifyTeam(teamId, true);
    await getTeamsByClusterId(clusterId);
    setOpenAreYouSureConfirm(false);
    handleClose();
  };

  const handleReverse = async () => {
    await judgeDisqualifyTeam(teamId, false);
    await getTeamsByClusterId(clusterId);
    setOpenAreYouSureReverse(false);
    handleClose();
  };

  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title={"Confirm or reverse judge disqualification."}
      error={mapClusterToTeamError}
    >
      <Container
        sx={{
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
          flexDirection: "row",
          gap: 2,
        }}
      >
        <Button
          onClick={() => setOpenAreYouSureConfirm(true)}
          sx={{
            width: 90,
            height: 35,
            bgcolor: `${theme.palette.primary.main}`,
            color: `${theme.palette.secondary.main}`,
            mt: 2,
          }}
        >
          Confirm
        </Button>
        <Button
          onClick={() => setOpenAreYouSureReverse(true)}
          sx={{
            width: 90,
            height: 35,
            bgcolor: `${theme.palette.primary.main}`,
            color: `${theme.palette.secondary.main}`,
            mt: 2,
          }}
        >
          Reverse
        </Button>
      </Container>
      <AreYouSureModal
        open={openAreYouSureConfirm}
        handleClose={() => setOpenAreYouSureConfirm(false)}
        title={`Are you sure you want to disqualify ${teamName}?`}
        handleSubmit={() => handleConfirm()}
        error={organizerError}
      />
      <AreYouSureModal
        open={openAreYouSureReverse}
        handleClose={() => setOpenAreYouSureReverse(false)}
        title={`Are you sure you want to reverse judge disqualification?`}
        handleSubmit={() => handleReverse()}
        error={judgeError}
      />
    </Modal>
  );
}
