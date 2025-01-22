import { useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Button from "@mui/material/Button";
import { Box, CircularProgress, Typography } from "@mui/material";
import useContestStore from "../../store/primary_stores/contestStore";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AreYouSureModal from "../Modals/AreYouSureModal";
import ContestModal from "../Modals/ContestModal";
import dayjs from "dayjs";
import useMapContestOrganizerStore from "../../store/map_stores/mapContestToOrganizerStore";

function createData(
  id: number,
  name: string,
  date: dayjs.Dayjs,
  is_open: boolean,
  is_tabulated: boolean,
  organizers: any[]
) {
  return { id, name, date, is_open, is_tabulated, organizers };
}

export default function AdminContestTable() {
  const navigate = useNavigate();

  const {
    fetchAllContests,
    allContests,
    deleteContest,
    isLoadingContest,
    contestError,
  } = useContestStore();
  const {
    fetchOrganizerNamesByContests,
    organizerNamesByContests,
    isLoadingMapContestOrganizer,
  } = useMapContestOrganizerStore();
  const [openAreYouSure, setOpenAreYouSure] = useState(false);
  const [contestId, setContestId] = useState(0);
  const [openContestModal, setOpenContestModal] = useState(false);
  const [contestData, setContestData] = useState<any>();

  useEffect(() => {
    fetchAllContests();
  }, [fetchAllContests]);

  useEffect(() => {
    fetchOrganizerNamesByContests();
  }, [allContests]);

  const rows = allContests.map((contest) =>
    createData(
      contest.id,
      contest.name,
      dayjs(contest.date),
      contest.is_open,
      contest.is_tabulated,
      organizerNamesByContests[contest.id]
    )
  );

  console.log(organizerNamesByContests);

  const handleOpenEditContest = (contest: any) => {
    setContestData({
      contestid: contest.id,
      name: contest.name,
      date: contest.date,
    });
    setOpenContestModal(true);
  };

  const handleDelete = async (id: number) => {
    await deleteContest(id);
    await fetchAllContests();
  };

  const handleOpenAreYouSure = (id: number) => {
    setContestId(id);
    setOpenAreYouSure(true);
  };

  return isLoadingContest || isLoadingMapContestOrganizer ? (
    <CircularProgress />
  ) : (
    <TableContainer component={Box}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Is Open</TableCell>
            <TableCell>Organizers</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.date.format("MM-DD-YYYY")}</TableCell>
                <TableCell>{row.is_open ? "Yes" : "No"}</TableCell>
                <TableCell>
                  {row.organizers && row.organizers.length != 0 ? (
                    row.organizers.map((organizer) => (
                      <Typography>{organizer}</Typography>
                    ))
                  ) : (
                    <Typography>No Organizers Assigned</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleOpenEditContest(row)}
                    sx={{ border: "1px solid lightgrey", marginRight: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleOpenAreYouSure(row.id)}
                    sx={{ border: "1px solid lightgrey", marginRight: 1 }}
                  >
                    Delete
                  </Button>
                  <Button
                    onClick={() => navigate(`/manage-contest/${row.id}/`)}
                    sx={{ border: "1px solid lightgrey", marginRight: 1 }}
                  >
                    Manage
                  </Button>
                </TableCell>
              </>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <AreYouSureModal
        open={openAreYouSure}
        handleClose={() => setOpenAreYouSure(false)}
        title="Are you sure you want to delete this contest?"
        handleSubmit={() => handleDelete(contestId)}
        error={contestError}
      />
      <ContestModal
        open={openContestModal}
        handleClose={() => setOpenContestModal(false)}
        mode="edit"
        contestData={contestData}
      />
    </TableContainer>
  );
}
