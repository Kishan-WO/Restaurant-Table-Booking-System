import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Header from "./Header";

function Layout() {
  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
      <Header />
      <Box component="main" sx={{ py: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;