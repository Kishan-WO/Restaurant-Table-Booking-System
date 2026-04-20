import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { format, addMinutes } from "date-fns";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../store/slice/auth.slice";
import { useState, useEffect, useRef } from "react";
import {
  generateAvailableSlots,
  getOpenRangesForDate,
  to12hFormat,
} from "../../helpers/booking.helper.js";
import BookingCard from "../../components/BookingCard";
import { useForm, Controller, useWatch } from "react-hook-form";
import {
  useGetMyBookingsQuery,
  useUpdateBookingMutation,
  useCancelBookingMutation,
} from "../../store/api/booking.api.js";
import {
  useGetRestaurantsQuery,
  useGetTablesByRestaurantQuery,
  useGetOperatingHoursQuery,
} from "../../store/api/restaurant.api.js";

function MyBookings() {
  const currentUser = useSelector(selectCurrentUser);

  const { data: myBookingsRes, isLoading } = useGetMyBookingsQuery();
  const { data: restaurantsRes } = useGetRestaurantsQuery();
  const [updateBooking, { isLoading: isUpdating }] = useUpdateBookingMutation();
  const [cancelBooking] = useCancelBookingMutation();

  const bookings = myBookingsRes?.data || [];
  const restaurants = restaurantsRes?.data || [];

  const [successMsg, setSuccessMsg] = useState("");
  const [editBooking, setEditBooking] = useState(null);
  const [cancelId, setCancelId] = useState(null);
  const [formError, setFormError] = useState("");

  // ── Restaurant filter ──────────────────────────────────────────
  const [restaurantFilter, setRestaurantFilter] = useState("all");

  const previousDateRef = useRef();
  const isInitialEditRef = useRef(false);

  const editRestaurant = editBooking
    ? restaurants.find((r) => r._id === editBooking.restaurantId)
    : null;

  const { data: editHoursRes } = useGetOperatingHoursQuery(
    editBooking?.restaurantId,
    { skip: !editBooking?.restaurantId }
  );
  const editHoursArray = editHoursRes?.data || [];

  const slotDuration = editRestaurant?.bookingConfig?.slotDuration ?? 60;
  const bufferTime = editRestaurant?.bookingConfig?.bufferTime ?? 0;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: "",
      startTime: "",
      tableId: "",
      "guestDetails.phone": "",
      "guestDetails.name": "",
      guests: 1,
      notes: "",
    },
  });

  const watchedDate = useWatch({ control, name: "date" });
  const watchedStartTime = useWatch({ control, name: "startTime" });

  const currentBookingTable = editBooking?.tableId
    ? typeof editBooking.tableId === "object"
      ? editBooking.tableId
      : null
    : null;

  const { data: tablesRes } = useGetTablesByRestaurantQuery(
    { resId: editBooking?.restaurantId, startTime: watchedStartTime, date: watchedDate },
    { skip: !editBooking?.restaurantId || !watchedDate || !watchedStartTime }
  );

  const availableTables = (() => {
    const fetched = tablesRes?.data?.filter((t) => t.isActive) || [];
    if (currentBookingTable && !fetched.find((t) => t._id === currentBookingTable._id)) {
      return [currentBookingTable, ...fetched];
    }
    return fetched;
  })();

  // ── Filter + sort bookings ─────────────────────────────────────
  const myBookings = bookings
    .filter((b) => b.userId === currentUser?._id)
    .filter((b) => restaurantFilter === "all" || b.restaurantId === restaurantFilter)
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

  // Only show restaurants that the user actually has bookings for
  const bookedRestaurantIds = new Set(
    bookings.filter((b) => b.userId === currentUser?._id).map((b) => b.restaurantId)
  );


  const filteredRestaurantOptions = restaurants.filter((r) =>
    bookedRestaurantIds.has(r._id)
  );

  const openRanges =
    watchedDate ? getOpenRangesForDate(editHoursArray, watchedDate) : [];

  const availableSlots =
    watchedDate && editHoursArray.length > 0
      ? generateAvailableSlots(editHoursArray, watchedDate, slotDuration, bufferTime)
      : [];

  const computedEndTime =
    watchedDate && watchedStartTime
      ? (() => {
        const [h, m] = watchedStartTime.split(":").map(Number);
        const base = new Date(watchedDate);
        base.setHours(h, m, 0, 0);
        return addMinutes(base, slotDuration);
      })()
      : null;

  useEffect(() => {
    if (isInitialEditRef.current) {
      isInitialEditRef.current = false;
      return;
    }
    if (previousDateRef.current !== watchedDate) {
      setValue("startTime", "");
      setValue("tableId", "");
    }
    previousDateRef.current = watchedDate;
  }, [watchedDate, setValue]);

  const openEdit = (b) => {
    setFormError("");
    clearErrors();
    isInitialEditRef.current = true;
    previousDateRef.current = format(new Date(b.startTime), "yyyy-MM-dd");
    reset({
      date: format(new Date(b.startTime), "yyyy-MM-dd"),
      startTime: format(new Date(b.startTime), "HH:mm"),
      tableId: typeof b.tableId === "object" ? b.tableId._id : b.tableId,
      "guestDetails.phone": b.guestDetails?.phone || "",
      "guestDetails.name": b.guestDetails?.name || "",
      guests: b.guests,
      notes: b.notes || "",
    });
    setEditBooking(b);
  };

  const today = format(new Date(), "yyyy-MM-dd");

  const onSave = async (data) => {
    try {
      const [h, m] = data.startTime.split(":").map(Number);
      const startDate = new Date(data.date);
      startDate.setHours(h, m, 0, 0);
      const endDate = addMinutes(startDate, slotDuration);
      console.log(data)
      await updateBooking({
        id: editBooking._id,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        tableId: data.tableId,
        guestDetails: data.guestDetails,
        guests: data.guests,
        notes: data.notes,
      }).unwrap();

      setEditBooking(null);
      setSuccessMsg("Booking updated!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      const apiError = err?.data;

      if (apiError?.errorCode === "VALIDATION_ERROR" && apiError?.details) {
        clearErrors();

        apiError.details.forEach((d) => {
          const fieldKey = d.path.replace("body.", "");

          if (fieldKey) {
            setError(fieldKey, {
              type: "server",
              message: d.message,
            });
          }
        });
      } else {
        setFormError(apiError?.message || "Something went wrong");
      }
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
    <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">My Bookings</Typography>
        <Typography variant="body2" color="text.secondary">
          {myBookings.length} booking{myBookings.length !== 1 ? "s" : ""} found
        </Typography>
      </Box>

      {successMsg && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMsg}
        </Alert>
      )}

      {/* ── Restaurant Filter ── */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          backgroundColor: "background.paper",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <FormControl size="small" fullWidth>
          <InputLabel>Filter by Restaurant</InputLabel>
          <Select
            value={restaurantFilter}
            onChange={(e) => setRestaurantFilter(e.target.value)}
            label="Filter by Restaurant"
          >
            <MenuItem value="all">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                <Typography variant="body2" sx={{ flexGrow: 1 }}>All Restaurants</Typography>
                <Chip
                  label={bookings.filter((b) => b.userId === currentUser?._id).length}
                  size="small"
                  color="primary"
                  sx={{ height: 20, fontSize: "0.7rem" }}
                />
              </Box>
            </MenuItem>
            {filteredRestaurantOptions.map((r) => {
              const count = bookings.filter(
                (b) => b.userId === currentUser?._id && b.restaurantId === r._id
              ).length;
              return (
                <MenuItem key={r._id} value={r._id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      {r.name}
                    </Typography>
                    <Chip
                      label={count}
                      size="small"
                      variant="outlined"
                      sx={{ height: 20, fontSize: "0.7rem" }}
                    />
                  </Box>
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Box>

      {/* ── Bookings List ── */}
      {myBookings.length === 0 ? (
        <Alert severity="info">
          {restaurantFilter === "all"
            ? "You have no bookings yet."
            : "No bookings for this restaurant."}
        </Alert>
      ) : (
        myBookings.map((b) => (
          <BookingCard
            key={b._id}
            b={b}
            onEditClickHandler={() => openEdit(b)}
            onCancelClickHandler={() => setCancelId(b._id)}
            restaurantName={
              restaurants.find(r => r._id === b.restaurantId)?.name
            }
          />
        ))
      )}

      {/* Cancel Dialog */}
      <Dialog open={!!cancelId} onClose={() => setCancelId(null)}>
        <DialogTitle>Cancel Booking?</DialogTitle>
        <DialogContent>
          <Typography>This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelId(null)}>Keep Booking</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              await cancelBooking(cancelId).unwrap();
              setCancelId(null);
            }}
          >
            Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editBooking}
        onClose={() => setEditBooking(null)}
        sx={{ "& .MuiDialog-paper": { maxWidth: "600px", width: "100%" } }}
      >
        <form onSubmit={handleSubmit(onSave)}>
          <DialogTitle>
            Edit Booking
            {editRestaurant && (
              <Typography variant="body2" color="text.secondary">
                {editRestaurant.name}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}
            <Controller
              name="date"
              control={control}
              rules={{ required: "Date is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="date"
                  label="Date"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: today }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />

            {watchedDate && openRanges.length === 0 && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                Restaurant is closed on this day.
              </Alert>
            )}

            {watchedDate && openRanges.length > 0 && (
              <>
                <Alert severity="info" sx={{ my: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    Open hours:
                  </Typography>
                  {openRanges.map((r, i) => (
                    <Typography key={i} variant="body2">
                      {to12hFormat(r.from)} – {to12hFormat(r.to)}
                    </Typography>
                  ))}
                </Alert>

                <Typography variant="subtitle2" gutterBottom>
                  Available Time Slots:
                </Typography>

                {availableSlots.length === 0 ? (
                  <Alert severity="warning">No slots available for this day.</Alert>
                ) : (
                  <Controller
                    name="startTime"
                    control={control}
                    rules={{ required: "Please select a time slot" }}
                    render={({ field }) => (
                      <Stack direction="row" flexWrap="wrap" gap={1}>
                        {availableSlots.map((time) => {
                          const isSelected = field.value === time;
                          return (
                            <Chip
                              key={time}
                              label={to12hFormat(time)}
                              clickable
                              color={isSelected ? "primary" : "default"}
                              variant={isSelected ? "filled" : "outlined"}
                              onClick={() => field.onChange(time)}
                              sx={{ fontWeight: isSelected ? 700 : 400 }}
                            />
                          );
                        })}
                      </Stack>
                    )}
                  />
                )}

                {errors.startTime && (
                  <Typography
                    color="error"
                    variant="caption"
                    sx={{ mt: 1, display: "block" }}
                  >
                    {errors.startTime.message}
                  </Typography>
                )}

                {computedEndTime && watchedStartTime && (
                  <Alert severity="success" sx={{ mt: 1 }}>
                    Slot: {to12hFormat(watchedStartTime)} –{" "}
                    {format(computedEndTime, "hh:mm a")}
                  </Alert>
                )}
              </>
            )}

            {/* Guest Details */}
            <Box sx={{ mt: 2 }}>
              <Controller
                name="guestDetails.phone"
                control={control}
                rules={{ required: "Phone is required" }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Guest Phone"
                    fullWidth
                    margin="normal"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="guestDetails.name"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Guest Name (optional)"
                    fullWidth
                    margin="normal"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="guests"
                control={control}
                rules={{
                  required: "Required",
                  min: { value: 1, message: "At least 1 guest" },
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Number of Guests"
                    fullWidth
                    margin="normal"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="notes"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Special Notes"
                    fullWidth
                    multiline
                    rows={2}
                    margin="normal"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Box>

            {/* Table Selection */}
            {watchedDate && watchedStartTime && (
              <FormControl component="fieldset" sx={{ mt: 2, width: "100%" }}>
                <FormLabel>Select Table</FormLabel>
                <Controller
                  name="tableId"
                  control={control}
                  rules={{ required: "Please select a table" }}
                  render={({ field }) => (
                    <RadioGroup {...field}>
                      {availableTables.map((t) => (
                        <Box
                          key={t._id}
                          sx={{
                            border: "1px solid",
                            borderColor:
                              field.value === t._id ? "primary.main" : "divider",
                            borderRadius: 2,
                            mb: 1,
                            px: 1.5,
                            py: 0.5,
                            backgroundColor:
                              field.value === t._id ? "#1565C008" : "transparent",
                          }}
                        >
                          <FormControlLabel
                            value={t._id}
                            control={<Radio size="small" />}
                            label={
                              <Typography variant="body2">
                                Table <strong>{t.tableNumber}</strong> — {t.type}{" "}
                                (cap: {t.capacity})
                              </Typography>
                            }
                          />
                        </Box>
                      ))}
                    </RadioGroup>
                  )}
                />
                {errors.tableId && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    {errors.tableId.message}
                  </Alert>
                )}
                {availableTables.length === 0 && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    No active tables available.
                  </Alert>
                )}
              </FormControl>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setEditBooking(null)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}

export default MyBookings;