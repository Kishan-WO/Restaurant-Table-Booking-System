import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  Link,
  Paper,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
  IconButton,
} from "@mui/material";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import PersonIcon from "@mui/icons-material/Person";
import StorefrontIcon from "@mui/icons-material/Storefront";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../store/slice/auth.slice";
import { useRegisterMutation } from "../store/api/auth.api";

const registerSchema = yup.object({
  role: yup.string().oneOf(["customer", "owner"]).required("Role is required"),
  name: yup
    .string()
    .min(2, "At least 2 characters")
    .required("Name is Required"),
  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, "Invalid phone number")
    .required("Phone is required"),
  email: yup.string().email("Invalid Email").required("Email is required"),
  password: yup
    .string()
    .min(6, "At least 6 characters")
    .required("Password is Required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is Required"),
});

function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const currentUser = useSelector(selectCurrentUser);
  const [registerMutation, { isLoading }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      role: "customer",
      name: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setError("");
      await registerMutation(data).unwrap();
      reset();
    } catch (err) {
      setError(err?.data?.message || "Registration failed. Please try again.");
    }
  };

  useEffect(() => {
    if (currentUser?._id) {
      navigate(currentUser.role === "owner" ? "/owner" : "/restaurants");
    }
  }, [currentUser, navigate]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(145deg, #E3F2FD 0%, #F0F4FF 50%, #E8EAF6 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {/* Logo */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "14px",
                background: "linear-gradient(135deg, #1565C0 0%, #1E88E5 100%)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1.5,
                boxShadow: "0 4px 14px rgba(21,101,192,0.3)",
              }}
            >
              <TableRestaurantIcon sx={{ color: "#fff", fontSize: 28 }} />
            </Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: "primary.main" }}
            >
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Join TableBook today
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
            {/* Role Toggle */}
            <FormControl
              component="fieldset"
              error={!!errors.role}
              fullWidth
              sx={{ mb: 2 }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 1, display: "block" }}
              >
                I am a
              </Typography>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <ToggleButtonGroup
                    exclusive
                    value={field.value}
                    onChange={(_, val) => {
                      if (val) field.onChange(val);
                    }}
                    fullWidth
                    size="small"
                  >
                    <ToggleButton
                      value="customer"
                      sx={{
                        gap: 0.5,
                        fontWeight: 600,
                        "&.Mui-selected": {
                          backgroundColor: "primary.main",
                          color: "#fff",
                          "&:hover": { backgroundColor: "primary.dark" },
                        },
                      }}
                    >
                      <PersonIcon fontSize="small" />
                      Customer
                    </ToggleButton>
                    <ToggleButton
                      value="owner"
                      sx={{
                        gap: 0.5,
                        fontWeight: 600,
                        "&.Mui-selected": {
                          backgroundColor: "primary.main",
                          color: "#fff",
                          "&:hover": { backgroundColor: "primary.dark" },
                        },
                      }}
                    >
                      <StorefrontIcon fontSize="small" />
                      Owner
                    </ToggleButton>
                  </ToggleButtonGroup>
                )}
              />
              {errors.role && (
                <FormHelperText>{errors.role.message}</FormHelperText>
              )}
            </FormControl>

            <TextField
              label="Full Name"
              fullWidth
              margin="normal"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
            />

            <TextField
              label="Phone"
              type="tel"
              fullWidth
              margin="normal"
              {...register("phone")}
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />

            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword((p) => !p)}
                    >
                      {showPassword ? (
                        <VisibilityOffIcon fontSize="small" />
                      ) : (
                        <VisibilityIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Confirm Password"
              type={showConfirm ? "text" : "password"}
              fullWidth
              margin="normal"
              {...register("confirmPassword")}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowConfirm((p) => !p)}
                    >
                      {showConfirm ? (
                        <VisibilityOffIcon fontSize="small" />
                      ) : (
                        <VisibilityIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                mt: 2.5,
                py: 1.2,
                color: "#fff",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)",
                  boxShadow: "0 4px 12px rgba(21, 101, 192, 0.35)",
                  color: "#fff",
                },
                "&.Mui-disabled": {
                  color: "#fff",
                  background:
                    "linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)",
                  opacity: 0.7,
                },
              }}
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          <Typography variant="body2" textAlign="center" color="text.secondary">
            Already have an account?{" "}
            <Link
              component={RouterLink}
              to="/login"
              sx={{ fontWeight: 600, color: "primary.main" }}
            >
              Sign in
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

export default Register;
