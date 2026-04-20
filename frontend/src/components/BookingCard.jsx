import { format, isPast } from "date-fns";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TableBarIcon from "@mui/icons-material/TableBar";
import PeopleIcon from "@mui/icons-material/People";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import NotesIcon from "@mui/icons-material/Notes";

const statusColorMap = {
  confirmed: "success",
  cancelled: "default",
  completed: "info",
};

function BookingCard({ b, onEditClickHandler, onCancelClickHandler, restaurantName }) {
  console.log(restaurantName)
  const isBookingPast = isPast(new Date(b.endTime));
  const canAct = b.status === "booked" && !isBookingPast;

  return (
    <Card sx={{ mb: 2 }}>
      <Box
        sx={{
          height: 4,
          background:
            b.status === "confirmed"
              ? "linear-gradient(90deg, #1565C0 0%, #1E88E5 100%)"
              : b.status === "completed"
                ? "linear-gradient(90deg, #0288D1 0%, #03A9F4 100%)"
                : "linear-gradient(90deg, #9E9E9E 0%, #BDBDBD 100%)",
          borderRadius: "12px 12px 0 0",
        }}
      />
      <CardContent>
        {/* Top row */}
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
            <Typography variant="h6" sx={{ fontSize: "1rem" }}>
              {b.tableId?.tableNumber ? `Table ${b.tableId.tableNumber}` : "Booking"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {b.guestDetails?.name || b.guestDetails?.phone}
            </Typography>

          </Box>
          <Stack direction="row" spacing={1}>
            {b.status !== undefined && (
              <Chip
                label={b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                size="small"
                color={statusColorMap[b.status] || "default"}
              />
            )}
          </Stack>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {/* Info grid */}
        <Grid container spacing={1} sx={{ mb: canAct ? 1.5 : 0 }}>
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
              {format(new Date(b.startTime), "hh:mm a")} –{" "}
              {format(new Date(b.endTime), "hh:mm a")}
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
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: canAct ? 1 : 0, mt: 2 }}
          >
            <NotesIcon sx={{ fontSize: 16 }} />
            {b.notes}
          </Typography>
        )}

        {canAct && (
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<EditIcon fontSize="small" />}
              onClick={onEditClickHandler}
            >
              Edit
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<CancelIcon fontSize="small" />}
              onClick={onCancelClickHandler}
            >
              Cancel
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

export default BookingCard;