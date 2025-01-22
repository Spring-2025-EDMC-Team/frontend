import { Button } from "@mui/material";
import { useAuthStore } from "../store/primary_stores/authStore";
import theme from "../theme";

export default function Logout() {
  const { logout } = useAuthStore();

  return (
    <Button
      href={"/"}
      onClick={logout}
      sx={{
        width: 90,
        height: 35,
        bgcolor: `${theme.palette.primary.main}`,
        color: `${theme.palette.secondary.main}`,
        m: 2,
      }}
    >
      Logout
    </Button>
  );
}
