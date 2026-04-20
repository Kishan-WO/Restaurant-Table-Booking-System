/* eslint-disable react-hooks/exhaustive-deps */
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useParams } from "react-router-dom";
import {
  DAYS,
  DAY_LABELS,
  defaultHours,
  normalizeHours,
} from "../../helpers/booking.helper";
import { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { object, string, number } from "yup";
import {
  useGetMyRestaurantsQuery,
  useAddRestaurantMutation,
  useUpdateRestaurantMutation,
  useGetOperatingHoursQuery,
  useUpdateOperatingHoursMutation,
} from "../../store/api/restaurant.api";
import { parseServerErrors, validateHours } from "../../helpers/restaurant.helper";

const restaurantSchema = object({
  name: string().required("Name is Required").min(3).max(255),
  address: string().required("Address is Required").min(10).max(255),
  contact: object({
    phone: string()
      .required("Phone is Required")
      .matches(/^[0-9]{10}$/, "Invalid phone"),
    email: string()
      .required("Email is required")
      .email("Invalid email")
      .max(255),
  }),
  description: string().required("Description is required").min(10).max(500),
  bookingConfig: object({
    slotDuration: number().integer().min(15).max(480).optional(),
    bufferTime: number().integer().min(0).max(120).optional(),
    advanceBookingDays: number().integer().min(1).max(90).optional(),
    maxGuestsPerBooking: number().integer().min(1).max(100).optional(),
  }).optional(),
});

function SectionCard({ title, children }) {
  return (
    <Card sx={{ mb: 3 }}>
      <Box
        sx={{
          px: 3,
          py: 1.5,
          background: "linear-gradient(135deg, #1565C0 0%, #1E88E5 100%)",
          borderRadius: "12px 12px 0 0",
        }}
      >
        <Typography variant="subtitle1" sx={{ color: "#fff", fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      <CardContent sx={{ pt: 2.5 }}>{children}</CardContent>
    </Card>
  );
}

function RestaurantForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id || id === "new";

  const { data: myRestaurantsRes } = useGetMyRestaurantsQuery();
  const myRestaurants = myRestaurantsRes?.data || [];
  const existing = !isNew ? myRestaurants.find((r) => r._id === id) : null;

  const { data: operatingHoursRes, isLoading: hoursLoading } =
    useGetOperatingHoursQuery(existing?._id, {
      skip: !existing?._id,
    });

  const [hours, setHours] = useState(defaultHours());
  const [apiError, setApiError] = useState("");
  const [hoursErrors, setHoursErrors] = useState({});

  const [addRestaurant, { isLoading: isAdding }] = useAddRestaurantMutation();
  const [updateRestaurant, { isLoading: isUpdating }] =
    useUpdateRestaurantMutation();

  const [updateOperatingHours, { isLoading: isUpdatingHours }] =
    useUpdateOperatingHoursMutation();

  const isSubmitting = isAdding || isUpdating || isUpdatingHours;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(restaurantSchema),
    defaultValues: existing || {
      bookingConfig: {
        slotDuration: 60,
        bufferTime: 0,
        advanceBookingDays: 7,
        maxGuestsPerBooking: 20,
      },
    },
  });

  useEffect(() => {
    console.log("RAW API:", operatingHoursRes?.data);
    console.log("NORMALIZED:", normalizeHours(operatingHoursRes?.data));
  }, [operatingHoursRes]);

  useEffect(() => {
    if (operatingHoursRes?.data) {
      setHours(normalizeHours(operatingHoursRes.data));
    }
  }, [operatingHoursRes]);

  useEffect(() => {
    if (!isNew && existing) {
      reset(existing);
    }

    if (isNew) {
      reset({
        bookingConfig: {
          slotDuration: 60,
          bufferTime: 0,
          advanceBookingDays: 7,
          maxGuestsPerBooking: 20,
        },
      });
      setHours(defaultHours());
    }

    setHoursErrors({});
    setApiError("");
  }, [existing, isNew]);

  const clearHoursErrorsForDay = (day) => {
    setHoursErrors((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (k === day || k.startsWith(`${day}.`)) delete next[k];
      });
      return next;
    });
  };

  const toggleDay = (day) => {
    clearHoursErrorsForDay(day);

    setHours((prev) => {
      const wasEnabled = prev[day].enabled;

      return {
        ...prev,
        [day]: {
          enabled: !wasEnabled,
          ranges: !wasEnabled
            ? prev[day].ranges.length
              ? prev[day].ranges
              : [{ from: "09:00", to: "22:00" }]
            : [], // disable → clear
        },
      };
    });
  };

  const addRange = (day) => {
    clearHoursErrorsForDay(day);
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        ranges: [...prev[day].ranges, { from: "09:00", to: "22:00" }],
      },
    }));
  };

  const updateRange = (day, index, field, value) => {
    setHoursErrors((prev) => {
      const next = { ...prev };
      delete next[`${day}.ranges.${index}.${field}`];
      delete next[`${day}.ranges.${index}`];
      return next;
    });
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        ranges: prev[day].ranges.map((r, i) =>
          i === index ? { ...r, [field]: value } : r,
        ),
      },
    }));
  };

  const removeRange = (day, idx) => {
    clearHoursErrorsForDay(day);
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        ranges: prev[day].ranges.filter((_, i) => i !== idx),
      },
    }));
  };

  const onSubmit = async (data) => {
    setApiError("");
    setHoursErrors({});

    const errors = validateHours(hours);

    if (Object.keys(errors).length > 0) {
      setHoursErrors(errors);
      return;
    }

    const cleanedHours = Object.fromEntries(
      Object.entries(hours).map(([day, config]) => [
        day,
        {
          enabled: config.enabled,
          ranges: config.enabled
            ? config.ranges.map((r) => ({
              from: r.from,
              to: r.to,
            }))
            : [],
        },
      ]),
    );

    try {
      let restaurantId;

      if (existing) {
        // Update basic restaurant info
        await updateRestaurant({ _id: existing._id, ...data }).unwrap();
        restaurantId = existing._id;
      } else {
        const result = await addRestaurant({ ...data }).unwrap();
        restaurantId = result?.data?._id;
      }

      await updateOperatingHours({
        restaurantId,
        openingHours: cleanedHours,
      }).unwrap();

      navigate("/owner/restaurants");
    } catch (err) {
      const errorCode = err?.data?.errorCode;
      if (Array.isArray(errorCode) && errorCode.length > 0) {
        parseServerErrors(errorCode, setError, setHoursErrors, setApiError);
      } else {
        setApiError(
          err?.data?.message || "Something went wrong. Please try again.",
        );
      }
    }
  };

  if (!isNew && (!existing || hoursLoading)) {
    return (
      <Container sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/owner/restaurants")}
          variant="outlined"
          size="small"
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ ml: 1 }}>
          {existing ? `Edit: ${existing.name}` : "Add Restaurant"}
        </Typography>
      </Box>

      {apiError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {apiError}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Basic Info */}
        <SectionCard title="Basic Information">
          <Grid container spacing={2}>
            <Grid item size={{ xs: 12 }}>
              <TextField
                label="Restaurant Name"
                fullWidth
                {...register("name")}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>
            <Grid item size={{ xs: 12 }}>
              <TextField
                label="Address"
                fullWidth
                multiline
                rows={2}
                {...register("address")}
                error={!!errors.address}
                helperText={errors.address?.message}
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Phone"
                fullWidth
                {...register("contact.phone")}
                error={!!errors.contact?.phone}
                helperText={errors.contact?.phone?.message}
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Email"
                fullWidth
                {...register("contact.email")}
                error={!!errors.contact?.email}
                helperText={errors.contact?.email?.message}
              />
            </Grid>
            <Grid item size={{ xs: 12 }}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                {...register("description")}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            </Grid>
          </Grid>
        </SectionCard>

        {/* Booking Config */}
        <SectionCard title="Booking Configuration">
          <Grid container spacing={2}>
            <Grid item size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Slot Duration (minutes)"
                type="number"
                fullWidth
                {...register("bookingConfig.slotDuration", {
                  valueAsNumber: true,
                })}
                error={!!errors.bookingConfig?.slotDuration}
                helperText={
                  errors.bookingConfig?.slotDuration?.message ||
                  "How long each booking lasts"
                }
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Buffer Time (minutes)"
                type="number"
                fullWidth
                {...register("bookingConfig.bufferTime", {
                  valueAsNumber: true,
                })}
                error={!!errors.bookingConfig?.bufferTime}
                helperText={
                  errors.bookingConfig?.bufferTime?.message ||
                  "Gap between bookings"
                }
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Advance Booking Days"
                type="number"
                fullWidth
                {...register("bookingConfig.advanceBookingDays", {
                  valueAsNumber: true,
                })}
                error={!!errors.bookingConfig?.advanceBookingDays}
                helperText={
                  errors.bookingConfig?.advanceBookingDays?.message ||
                  "Days ahead customers can book"
                }
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Max Guests Per Booking"
                type="number"
                fullWidth
                {...register("bookingConfig.maxGuestsPerBooking", {
                  valueAsNumber: true,
                })}
                error={!!errors.bookingConfig?.maxGuestsPerBooking}
                helperText={
                  errors.bookingConfig?.maxGuestsPerBooking?.message ||
                  "Maximum guests per booking"
                }
              />
            </Grid>
          </Grid>
        </SectionCard>

        {/* Opening Hours */}
        <SectionCard title="Opening Hours">
          {DAYS.map((day) => (
            <Box key={day} sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hours[day]?.enabled || false}
                    onChange={() => toggleDay(day)}
                    color="primary"
                  />
                }
                label={
                  <Typography
                    fontWeight={600}
                    color={
                      hours[day]?.enabled ? "primary.main" : "text.secondary"
                    }
                  >
                    {DAY_LABELS[day]}
                  </Typography>
                }
              />

              {hoursErrors[day] && (
                <Typography
                  variant="caption"
                  color="error"
                  display="block"
                  sx={{ ml: 4 }}
                >
                  {hoursErrors[day]}
                </Typography>
              )}
              {hoursErrors[`${day}.ranges`] && (
                <Typography
                  variant="caption"
                  color="error"
                  display="block"
                  sx={{ ml: 4 }}
                >
                  {hoursErrors[`${day}.ranges`]}
                </Typography>
              )}

              {hours[day]?.enabled && (
                <Box sx={{ ml: { xs: 1, sm: 4 }, mt: 0.5 }}>
                  {hours[day]?.ranges?.map((range, idx) => (
                    <Box key={idx} sx={{ mb: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <TextField
                          type="time"
                          label="From"
                          size="small"
                          value={range.from || ""}
                          onChange={(e) =>
                            updateRange(day, idx, "from", e.target.value)
                          }
                          error={!!hoursErrors[`${day}.ranges.${idx}.from`]}
                          helperText={hoursErrors[`${day}.ranges.${idx}.from`]}
                          sx={{ width: 140 }}
                        />
                        <TextField
                          type="time"
                          label="To"
                          size="small"
                          value={range.to}
                          onChange={(e) =>
                            updateRange(day, idx, "to", e.target.value)
                          }
                          error={!!hoursErrors[`${day}.ranges.${idx}.to`]}
                          helperText={hoursErrors[`${day}.ranges.${idx}.to`]}
                          sx={{ width: 140 }}
                        />
                        {hours[day].ranges.length > 1 && (
                          <IconButton
                            size="small"
                            onClick={() => removeRange(day, idx)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                      {hoursErrors[`${day}.ranges.${idx}`] && (
                        <Typography
                          variant="caption"
                          color="error"
                          display="block"
                          sx={{ mt: 0.5 }}
                        >
                          {hoursErrors[`${day}.ranges.${idx}`]}
                        </Typography>
                      )}
                    </Box>
                  ))}
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => addRange(day)}
                  >
                    Add time range
                  </Button>
                </Box>
              )}
              <Divider sx={{ mt: 1 }} />
            </Box>
          ))}
        </SectionCard>

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={isSubmitting}
          sx={{ py: 1.4 }}
        >
          {isSubmitting
            ? "Saving..."
            : existing
              ? "Save Changes"
              : "Create Restaurant"}
        </Button>
      </Box>
    </Container>
  );
}

export default RestaurantForm;
