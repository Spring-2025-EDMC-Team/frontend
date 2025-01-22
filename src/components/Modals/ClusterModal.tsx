import { Button, TextField } from "@mui/material";
import Modal from "./Modal";
import theme from "../../theme";
import { useEffect, useState } from "react";
import { useClusterStore } from "../../store/primary_stores/clusterStore";
import { useMapClusterToContestStore } from "../../store/map_stores/mapClusterToContestStore";

export interface IClusterModalProps {
  open: boolean;
  handleClose: () => void;
  mode: "new" | "edit";
  contestid?: number;
  clusterData?: {
    id: number;
    cluster_name: string;
  };
}

export default function ClusterModal(props: IClusterModalProps) {
  const { handleClose, open, mode, contestid, clusterData } = props;
  const [clusterName, setClusterName] = useState("");
  const { fetchClustersByContestId } = useMapClusterToContestStore();
  const { createCluster, editCluster, clusterError } = useClusterStore();

  useEffect(() => {
    if (clusterData) {
      setClusterName(clusterData.cluster_name);
    }
  }, [clusterData]);

  const handleCloseModal = () => {
    handleClose();
    setClusterName("");
  };

  const handleCreateCluster = async (event: React.FormEvent) => {
    event.preventDefault();
    if (contestid) {
      try {
        await createCluster({
          cluster_name: clusterName,
          contestid: contestid,
        });
        fetchClustersByContestId(contestid);
        handleCloseModal();
      } catch (error) {
        console.error("Failed to create cluster", error);
      }
    }
  };

  const handleEditCluster = async (event: React.FormEvent) => {
    event.preventDefault();
    if (clusterData?.id && contestid) {
      try {
        await editCluster({ id: clusterData.id, cluster_name: clusterName });
        fetchClustersByContestId(contestid);
        handleCloseModal();
      } catch (error) {
        console.error("Failed to edit cluster", error);
      }
    }
  };

  const title = mode === "new" ? "New Cluster" : "Edit Cluster";
  const buttonText = mode === "new" ? "Create Cluster" : "Update Cluster";
  const handleSubmit = mode === "new" ? handleCreateCluster : handleEditCluster;

  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title={title}
      error={clusterError}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <TextField
          required
          label="Cluster Name"
          variant="outlined"
          value={clusterName}
          onChange={(e: any) => setClusterName(e.target.value)}
          sx={{ mt: 1, width: 300 }}
        />
        <Button
          type="submit"
          sx={{
            width: 150,
            height: 35,
            bgcolor: `${theme.palette.primary.main}`,
            color: `${theme.palette.secondary.main}`,
            mt: 3,
          }}
        >
          {buttonText}
        </Button>
      </form>
    </Modal>
  );
}
