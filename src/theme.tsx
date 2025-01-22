import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#00a353", // main green
      dark: "#17442D", // dark green
      light: "#e8eddb",
    },
    secondary: {
      main: "#ffffff", // white
      light: "#CACCC6", // grey
      dark: "#000000", // black
    },
    background: {
      default: "#ffffff",
    },
  },
  typography: {
    fontFamily: "Open Sans, sans-serif",
    subtitle1: {
      fontSize: 12,
    },
    body1: {
      color: "#000000",
    },
    body2: {
      fontSize: 16,
      color: "#009A4A",
    },
    h1: {
      fontWeight: "550",
      fontSize: 28,
      color: "#009A4A",
    },
    h2: {
      fontWeight: "550",
      fontSize: 20,
      color: "#009A4A",
    },
  },
});

export default theme;
