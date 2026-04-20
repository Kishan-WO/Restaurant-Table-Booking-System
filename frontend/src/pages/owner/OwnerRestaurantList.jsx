import { useState } from "react";
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import { DAY_LABELS, DAYS } from "../../helpers/booking.helper";
import {
  useGetMyRestaurantsQuery,
  useDeleteRestaurantMutation,
  useGetOperatingHoursQuery,
} from "../../store/api/restaurant.api";
import {
  useCancelBookingMutation,
  useGetOwnerBookingsQuery,
} from "../../store/api/booking.api";

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

function OwnerRestaurantList() {
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: myRestaurantsRes, isLoading } = useGetMyRestaurantsQuery();
  const { data: ownerBookingsRes } = useGetOwnerBookingsQuery();
  const [deleteRestaurant, { isLoading: isDeleting }] =
    useDeleteRestaurantMutation();
  const [cancelBooking] = useCancelBookingMutation();

  const myRestaurants = myRestaurantsRes?.data || [];
  const bookings = ownerBookingsRes?.data || [];

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const activeBookings = bookings.filter(
        (b) => b.restaurantId === deleteTarget._id && b.status === "confirmed",
      );
      await Promise.all(
        activeBookings.map((b) => cancelBooking(b._id).unwrap()),
      );
      await deleteRestaurant(deleteTarget._id).unwrap();
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  if (isLoading) {
    return (
      <Container sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ px: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4">My Restaurants</Typography>
          <Typography variant="body2" color="text.secondary">
            {myRestaurants.length} restaurant
            {myRestaurants.length !== 1 ? "s" : ""} registered
          </Typography>
        </Box>
        <Button
          variant="contained"
          component={RouterLink}
          to="/owner/restaurants/new"
          startIcon={<AddIcon />}
        >
          Add Restaurant
        </Button>
      </Box>

      {myRestaurants.length === 0 ? (
        <Card sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No restaurants yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add your first restaurant to start accepting bookings
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to="/owner/restaurants/new"
            startIcon={<AddIcon />}
          >
            Add Restaurant
          </Button>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {myRestaurants.map((r) => (
            <Grid item size={{ xs: 12, sm: 6, md: 4 }} key={r._id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Blue top accent */}
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
                  <Stack spacing={0.5}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 0.8,
                      }}
                    >
                      <LocationOnIcon
                        sx={{
                          fontSize: 15,
                          color: "text.secondary",
                          mt: "2px",
                        }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "0.8rem" }}
                      >
                        {r.address}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.8 }}
                    >
                      <PhoneIcon
                        sx={{ fontSize: 15, color: "text.secondary" }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "0.8rem" }}
                      >
                        {r.contact?.phone}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.8 }}
                    >
                      <EmailIcon
                        sx={{ fontSize: 15, color: "text.secondary" }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "0.8rem" }}
                      >
                        {r.contact?.email}
                      </Typography>
                    </Box>
                  </Stack>
                  <Box
                    sx={{
                      mt: "auto",
                      pt: 1.5,
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
                  <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
                    <Button
                      size="small"
                      variant="contained"
                      component={RouterLink}
                      to={`/owner/restaurants/${r._id}`}
                      startIcon={<EditIcon fontSize="small" />}
                      fullWidth
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon fontSize="small" />}
                      fullWidth
                      onClick={() => setDeleteTarget(r)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Dialog */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Restaurant?</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to delete{" "}
            <strong>{deleteTarget?.name}</strong>?
          </Typography>
          <Alert severity="warning" sx={{ mt: 1 }}>
            All active bookings will be cancelled automatically.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default OwnerRestaurantList;
