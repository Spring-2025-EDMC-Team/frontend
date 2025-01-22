import { Box } from "@mui/material";
import theme from "../theme";

export default function TriangleBackground() {
  return (
    <>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          borderLeft: "100vw solid transparent", // Full width of the viewport
          borderBottom: `100vh solid ${theme.palette.primary.main}`, // Full height of the viewport
          zIndex: -1,
          opacity: 0.7,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          borderRight: "100vw solid transparent", // Full width of the viewport
          borderBottom: `100vh solid ${theme.palette.secondary.light}`, // Full height of the viewport
          zIndex: -2,
          opacity: 0.7,
        }}
      />
    </>
  );
}
