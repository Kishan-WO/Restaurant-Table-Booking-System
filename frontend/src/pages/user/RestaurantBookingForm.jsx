import { useEffect, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string, number } from "yup";
import { format, addMinutes } from "date-fns";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useAddBookingMutation } from "../../store/api/booking.api";
import {
  useGetOperatingHoursQuery,
  useGetRestaurantByIdQuery,
  useGetTablesByRestaurantQuery,
} from "../../store/api/restaurant.api";
import {
  generateAvailableSlots,
  getOpenRangesForDate,
  to12hFormat,
} from "../../helpers/booking.helper";

const bookingSchema = object({
  date: string().required("Date is required"),
  startTime: string().required("Please select a time slot"),
  tableId: string().required("Please select a table"),
  guestDetails: object({
    phone: string()
      .matches(/^[0-9+\-\s()]{7,15}$/, "Invalid phone")
      .required("Phone is required"),
    name: string(),
  }),
  guests: number().typeError("Must be a number").min(1, "At least 1 guest").required("Required"),
  notes: string(),
});

function StepHeader({ number, title }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #1565C0 0%, #1E88E5 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Typography variant="caption" sx={{ color: "#fff", fontWeight: 700 }}>
          {number}
        </Typography>
      </Box>
      <Typography variant="h6">{title}</Typography>
    </Box>
  );
}

function RestaurantBookingForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: restaurantRes, isLoading: restLoading } = useGetRestaurantByIdQuery(id);
  const restaurant = restaurantRes?.data;

  const { data: hoursRes } = useGetOperatingHoursQuery(id);
  const hoursArray = hoursRes?.data || [];

  const slotDuration = restaurant?.bookingConfig?.slotDuration ?? 60;
  const bufferTime = restaurant?.bookingConfig?.bufferTime ?? 0;
  const maxGuests = restaurant?.bookingConfig?.maxGuestsPerBooking ?? 20;
  const advanceBookingDays = restaurant?.bookingConfig?.advanceBookingDays ?? 7;

  const [addBooking, { isLoading: isSubmitting }] = useAddBookingMutation();
  const [customError, setCustomError] = useState("");

  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(bookingSchema),
    defaultValues: {
      date: "",
      startTime: "",
      tableId: "",
      guestDetails: { phone: "", name: "" },
      guests: 1,
      notes: "",
    },
  });

  const watchedDate = useWatch({ control, name: "date" });
  const watchedStartTime = useWatch({ control, name: "startTime" });

  const { data: tablesRes } = useGetTablesByRestaurantQuery(
    { resId: id, startTime: watchedStartTime, date: watchedDate },
    { skip: !watchedDate || !watchedStartTime }
  );
  const activeTables = tablesRes?.data?.filter((t) => t.isActive) || [];

  const today = format(new Date(), "yyyy-MM-dd");
  const maxDate = format(addMinutes(new Date(), advanceBookingDays * 24 * 60), "yyyy-MM-dd");

  const availableSlots =
    watchedDate && hoursArray.length
      ? generateAvailableSlots(hoursArray, watchedDate, slotDuration, bufferTime)
      : [];

  const openRanges =
    watchedDate && hoursArray.length
      ? getOpenRangesForDate(hoursArray, watchedDate)
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
    setValue("startTime", "");
    setValue("tableId", "");
  }, [watchedDate, setValue]);

  useEffect(() => {
    setValue("tableId", "");
  }, [watchedStartTime, setValue]);

  const onSubmit = async (data) => {
    setCustomError("");

    const [h, m] = data.startTime.split(":").map(Number);
    const startDate = new Date(data.date);
    startDate.setHours(h, m, 0, 0);
    const endDate = addMinutes(startDate, slotDuration);

    const selectedTable = activeTables.find((t) => t._id === data.tableId);
    if (selectedTable && data.guests > selectedTable.capacity) {
      setError("guests", {
        type: "manual",
        message: `Max ${selectedTable.capacity} guests for this table`,
      });
      return;
    }
    console.log(data)
    const booking = {
      restaurantId: restaurant._id,
      tableId: data.tableId,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      guests: data.guests,
      guestDetails: data.guestDetails,
      notes: data.notes,
    };

    try {
      await addBooking(booking).unwrap();
      navigate("/my-bookings");
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
        setCustomError(apiError?.message || "Something went wrong");
      }
    }
  };

  if (restLoading) {
    return (
      <Container sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!restaurant) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Restaurant not found.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
      {/* Restaurant Info Banner */}
      <Card sx={{ mb: 3 }}>
        <Box
          sx={{
            height: 5,
            background: "linear-gradient(90deg, #1565C0 0%, #1E88E5 100%)",
            borderRadius: "12px 12px 0 0",
          }}
        />
        <CardContent sx={{ pt: 2 }}>
          <Typography variant="h5" fontWeight={700}>
            {restaurant.name}
          </Typography>
          {restaurant.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {restaurant.description}
            </Typography>
          )}
          <Divider sx={{ my: 1.5 }} />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <LocationOnIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                {restaurant.address}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <PhoneIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                {restaurant.contact?.phone}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <AccessTimeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                {slotDuration} min slots{bufferTime > 0 ? ` · ${bufferTime} min buffer` : ""}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {customError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {customError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Step 1: Date & Time */}
          <Grid item size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <StepHeader number="1" title="Date & Time" />

                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="date"
                      label="Select Date"
                      fullWidth
                      margin="normal"
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: today, max: maxDate }}
                      error={!!errors.date}
                      helperText={errors.date?.message}
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
                    <Alert severity="info" sx={{ my: 1.5 }}>
                      <Typography variant="body2" fontWeight={600} gutterBottom>
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
                                  sx={{
                                    fontWeight: isSelected ? 700 : 400,
                                  }}
                                />
                              );
                            })}
                          </Stack>
                        )}
                      />
                    )}

                    {errors.startTime && (
                      <Typography color="error" variant="caption" sx={{ mt: 1, display: "block" }}>
                        {errors.startTime.message}
                      </Typography>
                    )}

                    {computedEndTime && (
                      <Alert severity="success" sx={{ mt: 1.5 }}>
                        Slot: <strong>{to12hFormat(watchedStartTime)}</strong> –{" "}
                        <strong>{format(computedEndTime, "hh:mm a")}</strong>
                      </Alert>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Step 2: Table Selection */}
          <Grid item size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <StepHeader number="2" title="Select Table" />

                {!watchedDate || !watchedStartTime ? (
                  <Alert severity="info">Please select a date and time slot first.</Alert>
                ) : activeTables.length === 0 ? (
                  <Alert severity="warning">No tables available. Try a different slot.</Alert>
                ) : (
                  <FormControl error={!!errors.tableId} component="fieldset" fullWidth>
                    <FormLabel component="legend" sx={{ mb: 1, fontWeight: 500 }}>
                      Available Tables
                    </FormLabel>
                    <Controller
                      name="tableId"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup {...field}>
                          {activeTables.map((t) => (
                            <Box
                              key={t._id}
                              sx={{
                                border: "1px solid",
                                borderColor: field.value === t._id ? "primary.main" : "divider",
                                borderRadius: 2,
                                mb: 1,
                                px: 1.5,
                                py: 0.5,
                                backgroundColor:
                                  field.value === t._id ? "primary.main" + "08" : "transparent",
                                transition: "all 0.15s",
                              }}
                            >
                              <FormControlLabel
                                value={t._id}
                                control={<Radio size="small" />}
                                label={
                                  <Typography variant="body2">
                                    Table <strong>{t.tableNumber}</strong> · {t.type} · Seats:{" "}
                                    <strong>{t.capacity}</strong>
                                  </Typography>
                                }
                              />
                            </Box>
                          ))}
                        </RadioGroup>
                      )}
                    />
                    {errors.tableId && (
                      <Typography color="error" variant="caption">
                        {errors.tableId.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Step 3: Guest Details */}
          <Grid item size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <StepHeader number="3" title="Guest Details" />
                <Grid container spacing={2}>
                  <Grid item size={{ xs: 12, sm: 6 }}>
                    <TextField
                      {...register("guestDetails.phone")}
                      label="Phone *"
                      fullWidth
                      error={!!errors.guestDetails?.phone}
                      helperText={errors.guestDetails?.phone?.message}
                    />
                  </Grid>
                  <Grid item size={{ xs: 12, sm: 6 }}>
                    <TextField
                      {...register("guestDetails.name")}
                      label="Guest Name (optional)"
                      fullWidth
                      error={!!errors.guestDetails?.name}
                      helperText={errors.guestDetails?.name?.message}
                    />
                  </Grid>
                  <Grid item size={{ xs: 12, sm: 6 }}>
                    <TextField
                      {...register("guests", { valueAsNumber: true })}
                      type="number"
                      label="Number of Guests *"
                      fullWidth
                      inputProps={{ min: 1, max: maxGuests }}
                      error={!!errors.guests}
                      helperText={errors.guests?.message}
                    />
                  </Grid>
                  <Grid item size={{ xs: 12 }}>
                    <TextField
                      {...register("notes")}
                      label="Special Notes (optional)"
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Dietary requirements, special occasions..."
                      error={!!errors.notes}
                      helperText={errors.notes?.message}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          sx={{ mt: 3, py: 1.5 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Confirming Booking..." : "Confirm Booking"}
        </Button>
      </form>
    </Container>
  );
}

export default RestaurantBookingForm;