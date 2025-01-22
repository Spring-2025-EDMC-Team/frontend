import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgotPassword";
import Judging from "./pages/Judging";
import Login from "./pages/Login";
import Organizer from "./pages/Organizer";
import SetPassword from "./pages/SetPassword";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import Navbar from "./components/Navbar";
import { useAuthStore } from "./store/primary_stores/authStore";
import Logout from "./pages/Logout";
import ManageContest from "./pages/ManageContest";
import Coach from "./pages/Coach";
import JournalScore from "./pages/JournalScore";
import PresentationScore from "./pages/PresentationScore";
import MachineDesignScore from "./pages/MachineDesignScore";
import Admin from "./pages/Admin";
import InternalResults from "./pages/InternalResults";
import GeneralPenalties from "./pages/GeneralPenalties";
import ScoreBreakdown from "./pages/ScoreBreakdown";
import RunPenalties from "./pages/RunPenalties";

function App() {
  const currentLink = useLocation().pathname;
  const { isAuthenticated, role } = useAuthStore();

  return (
    <>
      <ThemeProvider theme={theme}>
        {currentLink !== "/set-password/" &&
          currentLink !== "/forgot-password/" &&
          currentLink !== "/login/" && <Navbar />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/forgot-password/" element={<ForgotPassword />} />
          {isAuthenticated && role?.user_type != 4 && (
            <Route path="/judging/:judgeId/" element={<Judging />} />
          )}
          {isAuthenticated && role?.user_type != 4 && (
            <Route
              path="/journal-score/:judgeId/:teamId/"
              element={<JournalScore />}
            />
          )}
          {isAuthenticated && role?.user_type != 4 && (
            <Route
              path="/presentation-score/:judgeId/:teamId/"
              element={<PresentationScore />}
            />
          )}
          {isAuthenticated && role?.user_type != 4 && (
            <Route
              path="/machine-score/:judgeId/:teamId/"
              element={<MachineDesignScore />}
            />
          )}
          {isAuthenticated && role?.user_type != 4 && (
            <Route
              path="/general-penalties/:judgeId/:teamId/"
              element={<GeneralPenalties />}
            />
          )}
          {isAuthenticated && role?.user_type != 4 && (
            <Route
              path="/run-penalties/:judgeId/:teamId/"
              element={<RunPenalties />}
            />
          )}
          {<Route path="/login/" element={<Login />} />}
          {isAuthenticated && <Route path="/logout/" element={<Logout />} />}
          {role?.user_type == 2 && (
            <Route path="/organizer/" element={<Organizer />} />
          )}
          {(role?.user_type == 1 || role?.user_type == 2) && (
            <Route path="/results/:contestId" element={<InternalResults />} />
          )}
          <Route path="/set-password/" element={<SetPassword />} />
          {isAuthenticated && (
            <Route
              path="/manage-contest/:contestId/"
              element={<ManageContest />}
            />
          )}
          {role?.user_type == 4 && <Route path="/coach/" element={<Coach />} />}
          {role?.user_type == 1 && <Route path="/admin/" element={<Admin />} />}
          {isAuthenticated && (
            <Route
              path="/score-breakdown/:teamId"
              element={<ScoreBreakdown />}
            />
          )}
        </Routes>
      </ThemeProvider>
    </>
  );
}

export default App;
