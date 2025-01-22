import * as React from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { OrganizerRow } from "../../types";
import { Button, CircularProgress, Typography } from "@mui/material";
import useOrganizerStore from "../../store/primary_stores/organizerStore";
import { useEffect, useState } from "react";
import OrganizerModal from "../Modals/OrganizerModal";
import AreYouSureModal from "../Modals/AreYouSureModal";
import useMapContestOrganizerStore from "../../store/map_stores/mapContestToOrganizerStore";
import AssignContestModal from "../Modals/AssignContestModal";

function createData(
  id: number,
  first_name: string,
  last_name: string,
  editButton: any,
  deleteButton: any,
  assignContest: any
): OrganizerRow {
  return { id, first_name, last_name, editButton, deleteButton, assignContest };
}

function Row(props: { row: ReturnType<typeof createData> }) {
  const { row } = props;
  const [open, setOpen] = useState(false);
  const [organizerId, setOrganizerId] = useState(0);
  const [contestId, setContestId] = useState(0);
  const [openAreYouSureUnassign, setOpenAreYouSureUnassign] = useState(false);
  const {
    contestsByOrganizers,
    fetchContestsByOrganizers,
    deleteContestOrganizerMapping,
    mapContestOrganizerError,
  } = useMapContestOrganizerStore();

  const handleOpenAreYouSureUnassign = (
    organizerId: number,
    contestId: number
  ) => {
    setOrganizerId(organizerId);
    setContestId(contestId);
    setOpenAreYouSureUnassign(true);
  };

  const handleUnassign = async (organizerId: number, contestId: number) => {
    await deleteContestOrganizerMapping(organizerId, contestId);
    await fetchContestsByOrganizers();
  };

  return (
    <React.Fragment>
      <TableRow>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {`${row.first_name} ${row.last_name}`}
        </TableCell>
        <TableCell>
          {row.assignContest}
          {row.editButton}
          {row.deleteButton}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 1, mb: 0 }}>
              <Table size="small" aria-label="purchases">
                <TableBody>
                  <Table>
                    {contestsByOrganizers[row.id]?.length != 0 ? (
                      contestsByOrganizers[row.id]?.map((contest) => (
                        <TableRow>
                          <TableCell>{contest.name}</TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              onClick={() =>
                                handleOpenAreYouSureUnassign(row.id, contest.id)
                              }
                            >
                              Unassign Contest
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <Typography sx={{ m: 2 }}>
                        No Contests Assigned
                      </Typography>
                    )}
                  </Table>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
      <AreYouSureModal
        open={openAreYouSureUnassign}
        handleClose={() => setOpenAreYouSureUnassign(false)}
        title="Are you sure you want to unassign this contest?"
        handleSubmit={() => handleUnassign(organizerId, contestId)}
        error={mapContestOrganizerError}
      />
    </React.Fragment>
  );
}

export default function AdminOrganizerTable() {
  const { allOrganizers, fetchAllOrganizers, deleteOrganizer, organizerError } =
    useOrganizerStore();
  const [openOrganizerModal, setOpenOrganizerModal] = useState(false);
  const [organizerData, setOrganizerData] = useState<any>(null);
  const [openAreYouSure, setOpenAreYouSure] = useState(false);
  const [openAssignContest, setOpenAssignContest] = useState(false);
  const [organizerId, setOrganizerId] = useState(0);
  const { fetchContestsByOrganizers, isLoadingMapContestOrganizer } =
    useMapContestOrganizerStore();

  useEffect(() => {
    fetchAllOrganizers();
  }, []);

  useEffect(() => {
    fetchContestsByOrganizers();
  }, [allOrganizers]);

  const rows: OrganizerRow[] = allOrganizers.map((organizer: any) =>
    createData(
      organizer.id,
      organizer.first_name,
      organizer.last_name,
      <Button
        onClick={() => handleOpenEditOrganizer(organizer)}
        sx={{ border: "1px solid lightgrey", marginRight: 1 }}
      >
        Edit
      </Button>,
      <Button
        onClick={() => handleOpenAreYouSure(organizer.id)}
        sx={{ border: "1px solid lightgrey", marginRight: 1 }}
      >
        Delete
      </Button>,
      <Button
        onClick={() => handleOpenAssignContest(organizer.id)}
        sx={{ border: "1px solid lightgrey", marginRight: 1 }}
      >
        Assign Contest
      </Button>
    )
  );

  const handleOpenEditOrganizer = (organizer: any) => {
    setOrganizerData({
      id: organizer.id,
      first_name: organizer.first_name,
      last_name: organizer.last_name,
      username: organizer.username,
    });
    setOpenOrganizerModal(true);
  };

  const handleDelete = async (id: number) => {
    await deleteOrganizer(id);
    await fetchAllOrganizers();
  };

  const handleOpenAreYouSure = (id: number) => {
    setOrganizerId(id);
    setOpenAreYouSure(true);
  };

  const handleOpenAssignContest = (id: number) => {
    setOrganizerId(id);
    setOpenAssignContest(true);
  };

  return isLoadingMapContestOrganizer ? (
    <CircularProgress />
  ) : (
    <TableContainer component={Box}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell component="th" scope="row">
              Name
            </TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <Row key={row.id} row={row} />
          ))}
        </TableBody>
      </Table>
      <OrganizerModal
        open={openOrganizerModal}
        handleClose={() => setOpenOrganizerModal(false)}
        mode="edit"
        organizerData={organizerData}
      />
      <AreYouSureModal
        open={openAreYouSure}
        handleClose={() => setOpenAreYouSure(false)}
        title="Are you sure you want to delete this organizer?"
        handleSubmit={() => handleDelete(organizerId)}
        error={organizerError}
      />
      <AssignContestModal
        organizerId={organizerId}
        open={openAssignContest}
        handleClose={() => setOpenAssignContest(false)}
      />
    </TableContainer>
  );
}
