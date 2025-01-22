import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { useEffect, useState } from "react";
import { Container } from "@mui/system";
import { Typography } from "@mui/material";
import theme from "../theme";
import OrganizerContestTable from "../components/Tables/OrganizerContestTable";
import { useAuthStore } from "../store/primary_stores/authStore";
import useMapContestOrganizerStore from "../store/map_stores/mapContestToOrganizerStore";
import useMapScoreSheetStore from "../store/map_stores/mapScoreSheetStore";

export default function Organizer() {
  const [value, setValue] = useState("1");
  const { fetchContestsByOrganizerId, contests } =
    useMapContestOrganizerStore();
  const { allSheetsSubmittedForContests } = useMapScoreSheetStore();
  const { role } = useAuthStore();

  const organizerId = role ? role.user.id : null;

  useEffect(() => {
    const fetchContests = async () => {
      if (organizerId) {
        await fetchContestsByOrganizerId(organizerId);
      }
    };

    fetchContests();
  }, [organizerId, fetchContestsByOrganizerId]);

  useEffect(() => {
    const fetchSubmissionStatus = async () => {
      if (contests.length > 0) {
        await allSheetsSubmittedForContests(contests);
      }
    };

    fetchSubmissionStatus();
  }, [contests]);

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };
  return (
    <>
      <Typography variant="h1" sx={{ m: 5 }}>
        Organizer Dashboard
      </Typography>
      <Container
        sx={{
          width: "100vw",
          height: "auto",
          position: "absolute",
          padding: 3,
          bgcolor: `${theme.palette.secondary.light}`,
          ml: 5,
          mb: 3,
          borderRadius: 5,
        }}
      >
        <TabContext value={value}>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: `${theme.palette.secondary.main}`,
              borderTopLeftRadius: 5,
              borderTopRightRadius: 5,
            }}
          >
            <TabList
              onChange={handleChange}
              sx={{
                display: "flex",
                justifyContent: "flex-start",
              }}
            >
              <Tab label="Current Contests" value="1" />
              <Tab label="Past Contests" value="2" />
            </TabList>
          </Box>
          <TabPanel
            sx={{
              bgcolor: `${theme.palette.secondary.main}`,
              borderBottomLeftRadius: 5,
              borderBottomRightRadius: 5,
            }}
            value="1"
          >
            <OrganizerContestTable type="current" organizers={[]} />
          </TabPanel>
          <TabPanel
            sx={{
              bgcolor: `${theme.palette.secondary.main}`,
              borderBottomLeftRadius: 5,
              borderBottomRightRadius: 5,
            }}
            value="2"
          >
            <OrganizerContestTable type="past" organizers={[]} />
          </TabPanel>
        </TabContext>
      </Container>
    </>
  );
}
