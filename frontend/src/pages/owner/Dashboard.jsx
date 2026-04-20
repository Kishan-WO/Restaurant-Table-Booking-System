import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
  Chip,
} from "@mui/material";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AddIcon from "@mui/icons-material/Add";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../store/slice/auth.slice";
import { Link as RouterLink } from "react-router-dom";
import { useGetMyRestaurantsQuery } from "../../store/api/restaurant.api.js";
import { useGetOwnerBookingsQuery } from "../../store/api/booking.api.js";
import { format } from "date-fns";

const statusColorMap = {
  confirmed: "success",
  cancelled: "default",
  completed: "info",
};

function StatCard({ icon, label, value, color }) {
  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
        border: `1px solid ${color}30`,
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "12px",
              background: `linear-gradient(135deg, ${color}CC 0%, ${color} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 12px ${color}40`,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ color, lineHeight: 1.2 }}>
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const currentUser = useSelector(selectCurrentUser);
  const { data: myRestaurantsRes, isLoading: restLoading } = useGetMyRestaurantsQuery();
  const { data: myBookingsRes, isLoading: bookLoading } = useGetOwnerBookingsQuery();

  const myRestaurants = myRestaurantsRes?.data || [];
  const myBookings = myBookingsRes?.data || [];

  const confirmedBookings = myBookings.filter((b) => b.status === "booked");
  const recentBookings = [...myBookings]
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    .slice(0, 5);

  if (restLoading || bookLoading) {
    return (
      <Container sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, <strong>{currentUser?.name}</strong>
        </Typography>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item size={{ xs: 12, sm: 6 }}>
          <StatCard
            icon={<RestaurantIcon sx={{ color: "#fff", fontSize: 22 }} />}
            label="My Restaurants"
            value={myRestaurants.length}
            color="#1565C0"
          />
        </Grid>
        <Grid item size={{ xs: 12, sm: 6 }}>
          <StatCard
            icon={<EventAvailableIcon sx={{ color: "#fff", fontSize: 22 }} />}
            label="Confirmed Bookings"
            value={confirmedBookings.length}
            color="#2E7D32"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Quick Actions */}
        <Grid item size={{ xs: 12, sm: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1.5}>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/owner/restaurants/new"
                  startIcon={<AddIcon />}
                  fullWidth
                >
                  Add Restaurant
                </Button>
                <Button
                  variant="outlined"
                  component={RouterLink}
                  to="/owner/restaurants"
                  endIcon={<ArrowForwardIcon />}
                  fullWidth
                >
                  My Restaurants
                </Button>
                <Button
                  variant="outlined"
                  component={RouterLink}
                  to="/owner/restaurants/tables"
                  endIcon={<ArrowForwardIcon />}
                  fullWidth
                  disabled={myRestaurants.length === 0}
                >
                  Manage Tables
                </Button>
                <Button
                  variant="outlined"
                  component={RouterLink}
                  to="/owner/all-bookings"
                  endIcon={<ArrowForwardIcon />}
                  fullWidth
                  disabled={myRestaurants.length === 0}
                >
                  All Bookings
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Bookings */}
        <Grid item size={{ xs: 12, sm: 8 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="h6">Recent Bookings</Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  component={RouterLink}
                  to="/owner/all-bookings"
                >
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {recentBookings.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No bookings yet.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {recentBookings.map((b) => (
                    <Box
                      key={b._id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: "background.default",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {b.guestDetails?.name || "Guest"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(b.startTime), "MMM d, yyyy · hh:mm a")}
                        </Typography>
                      </Box>
                      <Chip
                        label={b.status}
                        size="small"
                        color={statusColorMap[b.status] || "default"}
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;