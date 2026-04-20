import { useState } from "react";
import { DAY_LABELS, DAYS } from "../../helpers/booking.helper";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  InputAdornment,
  TextField,
  Typography,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import {
  useGetRestaurantsQuery,
  useGetOperatingHoursQuery,
} from "../../store/api/restaurant.api";

// Fetches and renders the open-day chips for a single restaurant card
function OpenDayChips({ restaurantId }) {
  const { data: hoursRes } = useGetOperatingHoursQuery(restaurantId);
  const hoursArray = hoursRes?.data || [];
  const openDayLabels = DAYS.filter((day) =>
    hoursArray.find((h) => h.day === day && h.enabled),
  )
    .map((day) => DAY_LABELS[day])
    .filter(Boolean);

  if (openDayLabels.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        No hours set
      </Typography>
    );
  }
  return (
    <>
      {openDayLabels.map((label) => (
        <Chip
          key={label}
          label={label}
          size="small"
          color="primary"
          variant="outlined"
        />
      ))}
    </>
  );
}

function UserRestaurantList() {
  const { data: restaurantsRes, isLoading } = useGetRestaurantsQuery();
  const [search, setSearch] = useState("");

  const restaurants = restaurantsRes?.data || [];

  const filtered = restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.address.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) {
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
        <Typography variant="h4">Browse Restaurants</Typography>
        <Typography variant="body2" color="text.secondary">
          Find and book your perfect dining experience
        </Typography>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search by name or address..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3, backgroundColor: "background.paper", borderRadius: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      {filtered.length === 0 && (
        <Alert severity="info">
          No restaurants found matching your search.
        </Alert>
      )}

      <Grid container spacing={2}>
        {filtered.map((r) => (
          <Grid item size={{ xs: 12, sm: 6, md: 4 }} key={r._id}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              {/* Blue accent */}
              <Box
                sx={{
                  height: 5,
                  background:
                    "linear-gradient(90deg, #1565C0 0%, #1E88E5 100%)",
                  borderRadius: "12px 12px 0 0",
                }}
              />
              <CardContent
                sx={{
                  flexGrow: 1,
                  pt: 2,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography variant="h6" gutterBottom noWrap>
                  {r.name}
                </Typography>
                {r.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {r.description}
                  </Typography>
                )}
                <Divider sx={{ my: 1.5 }} />
                <Stack spacing={0.5} sx={{ mb: 1.5 }}>
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 0.8 }}
                  >
                    <LocationOnIcon
                      sx={{ fontSize: 15, color: "text.secondary", mt: "2px" }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.8rem" }}
                    >
                      {r.address}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                    <PhoneIcon sx={{ fontSize: 15, color: "text.secondary" }} />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.8rem" }}
                    >
                      {r.contact?.phone}
                    </Typography>
                  </Box>
                </Stack>

                <Box
                  sx={{
                    mt: "auto",
                    pt: 1,
                    display: "flex",
                    gap: 0.5,
                    flexWrap: "wrap",
                  }}
                >
                  <OpenDayChips restaurantId={r._id} />
                </Box>
              </CardContent>
              <Divider />
              <CardActions sx={{ p: 1.5 }}>
                <Button
                  component={RouterLink}
                  to={`/restaurants/${r._id}`}
                  variant="contained"
                  size="small"
                  fullWidth
                >
                  View & Book
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default UserRestaurantList;
