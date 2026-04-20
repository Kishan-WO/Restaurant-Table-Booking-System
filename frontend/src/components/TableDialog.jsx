/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { boolean, number, object, string } from "yup";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import TableBarIcon from "@mui/icons-material/TableBar";
import {
  useAddTableMutation,
  useUpdateTableMutation,
} from "../store/api/restaurant.api";


const tableSchema = object({
  tableNumber: string().required("Table number is required"),
  capacity: number()
    .min(1, "Min 1")
    .max(30, "Max 30")
    .required("Capacity is required"),
  type: string()
    .oneOf(["indoor", "outdoor", "vip"])
    .required("Type is required"),
  isActive: boolean().optional(),
});

const TABLE_TYPES = ["indoor", "outdoor", "vip"];

function TableDialog({ open, onClose, restaurantId, existing }) {
  const [formError, setFormError] = useState("");
  const [addTable, { isLoading: isAdding }] = useAddTableMutation();
  const [updateTable, { isLoading: isUpdating }] = useUpdateTableMutation();
  const isSubmitting = isAdding || isUpdating;

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(tableSchema),
    defaultValues: existing || {
      tableNumber: "",
      capacity: 2,
      type: "indoor",
      isActive: true,
    },
  });

  const onSubmit = async (data) => {
    try {
      if (existing) {
        await updateTable({
          restaurantId,
          tableId: existing._id,
          ...data,
        }).unwrap();
      } else {
        await addTable({ restaurantId, ...data }).unwrap();
      }
      onClose();
      reset();
    } catch (err) {
      const apiError = err?.data;

      // ZOD / VALIDATION ERRORS
      if (apiError?.errorCode === "VALIDATION_ERROR" && apiError?.details) {
        clearErrors();
        setFormError("");

        apiError.details.forEach((d) => {
          const fieldKey = d.path.replace("body.", "");

          const fieldMap = {
            tableNumber: "tableNumber",
            capacity: "capacity",
            type: "type",
            isActive: "isActive",
          };

          const mappedField = fieldMap[fieldKey];

          if (mappedField) {
            setError(mappedField, {
              type: "server",
              message: d.message,
            });
          }
        });
      } else {
        // GENERAL ERROR
        setFormError(apiError?.message || "Something went wrong");
      }
    }
  };

  useEffect(() => {
    setFormError("");
    clearErrors();

    if (existing) {
      reset(existing);
    } else {
      reset({
        tableNumber: "",
        capacity: 2,
        type: "indoor",
        isActive: true,
      });
    }
  }, [existing, reset, open, clearErrors]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {/* Colored header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          background: "linear-gradient(135deg, #1565C0 0%, #1E88E5 100%)",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <TableBarIcon sx={{ color: "#fff" }} />
        <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700 }}>
          {existing ? "Edit Table" : "Add New Table"}
        </Typography>
      </Box>

      <DialogContent sx={{ pt: 3 }}>
        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}
        <Box
          component="form"
          id="table-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <TextField
            label="Table Number / Name"
            fullWidth
            margin="normal"
            placeholder="e.g. T-1, Window Table, Rooftop-3"
            {...register("tableNumber", {
              onChange: () => clearErrors("tableNumber"),
            })}
            error={!!errors.tableNumber}
            helperText={errors.tableNumber?.message}
          />

          <TextField
            label="Capacity"
            type="number"
            fullWidth
            margin="normal"
            {...register("capacity", { valueAsNumber: true, onChange: () => clearErrors("capacity") })}
            error={!!errors.capacity}
            helperText={
              errors.capacity?.message || "Max number of guests for this table"
            }
            inputProps={{ min: 1, max: 30 }}
          />

          <FormControl fullWidth margin="normal" error={!!errors.type}>
            <InputLabel>Table Type</InputLabel>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select {...field} label="Table Type">
                  {TABLE_TYPES.map((t) => (
                    <MenuItem
                      key={t}
                      value={t}
                      sx={{ textTransform: "capitalize" }}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.type && (
              <FormHelperText>{errors.type.message}</FormHelperText>
            )}
          </FormControl>

          <FormControlLabel
            control={
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Checkbox {...field} checked={field.value ?? true} />
                )}
              />
            }
            label="Active (available for booking)"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          form="table-form"
          type="submit"
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : existing ? "Save Changes" : "Add Table"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TableDialog;
