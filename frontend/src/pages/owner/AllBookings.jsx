import { useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TableBarIcon from "@mui/icons-material/TableBar";
import PeopleIcon from "@mui/icons-material/People";
import { useGetOwnerBookingsQuery } from "../../store/api/booking.api";
import { useGetMyRestaurantsQuery } from "../../store/api/restaurant.api";
import { format } from "date-fns";

const statusColorMap = {
  pending: "warning",
  booked: "success",
  cancelled: "default",
};

function AllBookings() {
  const { data: myRestaurantsRes } = useGetMyRestaurantsQuery();
  const { data: myBookingsRes, isLoading } = useGetOwnerBookingsQuery();

  const myRestaurants = myRestaurantsRes?.data || [];
  const allMyBookings = myBookingsRes?.data || [];

  const [restaurantFilter, setRestaurantFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [date, setDate] = useState("");

  const filtered = allMyBookings
    .filter((b) => {
      if (restaurantFilter !== "all" && b.restaurantId !== restaurantFilter) return false;
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (date) {
        const bookingDate = format(new Date(b.startTime), "yyyy-MM-dd");
        if (bookingDate !== date) return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

  if (isLoading) {
    return (
      <Container sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">All Bookings</Typography>
        <Typography variant="body2" color="text.secondary">
          {filtered.length} booking{filtered.length !== 1 ? "s" : ""} found
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ pb: "16px !important" }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel>Restaurant</InputLabel>
              <Select
                value={restaurantFilter}
                onChange={(e) => setRestaurantFilter(e.target.value)}
                label="Restaurant"
              >
                <MenuItem value="all">All Restaurants</MenuItem>
                {myRestaurants.map((r) => (
                  <MenuItem key={r._id} value={r._id}>
                    {r.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="booked">Booked</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              type="date"
              label="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <Alert severity="info">No bookings found for the selected filters.</Alert>
      ) : (
        <Stack spacing={2}>
          {filtered.map((b) => (
            <Card key={b._id}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 1,
                    mb: 1.5,
                  }}
                >
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      {b.guestDetails?.name || "Guest"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {b.guestDetails?.phone}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={b.status}
                      size="small"
                      color={statusColorMap[b.status] || "default"}
                    />
                  </Stack>
                </Box>

                <Divider sx={{ mb: 1.5 }} />

                <Grid container spacing={1}>
                  <Grid item size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.3 }}>
                      <CalendarTodayIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                      <Typography variant="caption" color="text.secondary">Date</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={500}>
                      {format(new Date(b.startTime), "MMM d, yyyy")}
                    </Typography>
                  </Grid>
                  <Grid item size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.3 }}>
                      <AccessTimeIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                      <Typography variant="caption" color="text.secondary">Time</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={500}>
                      {format(new Date(b.startTime), "hh:mm a")} – {format(new Date(b.endTime), "hh:mm a")}
                    </Typography>
                  </Grid>
                  <Grid item size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.3 }}>
                      <TableBarIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                      <Typography variant="caption" color="text.secondary">Table</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={500}>
                      {b.tableId?.tableNumber || "—"} ({b.tableId?.type || "—"})
                    </Typography>
                  </Grid>
                  <Grid item size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.3 }}>
                      <PeopleIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                      <Typography variant="caption" color="text.secondary">Guests</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={500}>{b.guests}</Typography>
                  </Grid>
                </Grid>

                {b.notes && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    📝 {b.notes}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}

export default AllBookings;