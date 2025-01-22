import { useEffect, useState } from "react";
import logo from "../assets/EMDC_Fullcolor.png";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/primary_stores/authStore";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AreYouSureModal from "./Modals/AreYouSureModal";

export default function Nav() {
  const [openAreYouSure, setOpenAreYouSure] = useState(false);
  const { isAuthenticated, role, logout, authError } = useAuthStore();
  const [logoUrl, setLogoUrl] = useState("");
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      logout();
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && role) {
      switch (role.user_type) {
        case 1:
          setLogoUrl("/admin/");
          break;
        case 2:
          setLogoUrl("/organizer/");
          break;
        case 3:
          setLogoUrl(`/judging/${role.user.id}`);
          break;
        case 4:
          setLogoUrl("/coach/");
          break;
        default:
          break;
      }
    } else {
      setLogoUrl("/");
    }
  }, [isAuthenticated, role, navigate]);

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" sx={{ background: "#ffffff" }}>
          <Toolbar>
            <Box component={Link} to={logoUrl}>
              <img src={logo} style={{ width: "8rem" }} alt="Logo" />
            </Box>
            {isAuthenticated ? (
              <Button
                variant="contained"
                onClick={() => setOpenAreYouSure(true)}
                sx={{ ml: "auto" }}
              >
                Logout
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={() => navigate("/login/")}
                sx={{ ml: "auto" }}
              >
                Login
              </Button>
            )}
          </Toolbar>
        </AppBar>
      </Box>
      <AreYouSureModal
        open={openAreYouSure}
        handleClose={() => setOpenAreYouSure(false)}
        title="Are you sure you want to logout?"
        handleSubmit={() => handleLogout()}
        error={authError}
      />
    </>
  );
}
