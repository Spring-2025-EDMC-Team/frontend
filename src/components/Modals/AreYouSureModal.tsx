import { Button, Container } from "@mui/material";
import Modal from "./Modal";
import theme from "../../theme";

export interface IAreYouSureModalProps {
  open: boolean;
  handleClose: () => void;
  title: string;
  handleSubmit: () => void;
  error: string | null;
}

export default function AreYouSureModal(props: IAreYouSureModalProps) {
  const { handleClose, handleSubmit, open, title, error } = props;

  const handleSubmitModal = () => {
    handleSubmit();
    handleClose();
  };

  return (
    <Modal open={open} handleClose={handleClose} title={title} error={error}>
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
          onClick={handleSubmitModal}
          sx={{
            width: 90,
            height: 35,
            bgcolor: `${theme.palette.primary.main}`,
            color: `${theme.palette.secondary.main}`,
            mt: 2,
          }}
        >
          Yes
        </Button>
        <Button
          onClick={handleClose}
          sx={{
            width: 90,
            height: 35,
            bgcolor: `${theme.palette.primary.main}`,
            color: `${theme.palette.secondary.main}`,
            mt: 2,
          }}
        >
          No
        </Button>
      </Container>
    </Modal>
  );
}
