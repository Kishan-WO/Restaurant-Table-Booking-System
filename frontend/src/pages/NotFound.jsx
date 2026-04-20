import { Box, Button, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import HomeIcon from "@mui/icons-material/Home";

function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(145deg, #E3F2FD 0%, #F0F4FF 50%, #E8EAF6 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 3,
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: "18px",
          background: "linear-gradient(135deg, #1565C0 0%, #1E88E5 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
          boxShadow: "0 8px 24px rgba(21,101,192,0.3)",
        }}
      >
        <TableRestaurantIcon sx={{ color: "#fff", fontSize: 36 }} />
      </Box>

      <Typography
        variant="h1"
        sx={{
          fontWeight: 800,
          fontSize: { xs: "5rem", sm: "7rem" },
          background: "linear-gradient(135deg, #1565C0 0%, #1E88E5 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1,
          mb: 1,
        }}
      >
        404
      </Typography>

      <Typography variant="h5" fontWeight={700} color="text.primary" gutterBottom>
        Page Not Found
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 360 }}>
        Looks like this table doesn't exist. The page you're looking for may have been moved or deleted.
      </Typography>

      <Button
        variant="contained"
        component={RouterLink}
        to="/"
        size="large"
        startIcon={<HomeIcon />}
        sx={{ px: 4 }}
      >
        Go to Homepage
      </Button>
    </Box>
  );
}

export default NotFound;