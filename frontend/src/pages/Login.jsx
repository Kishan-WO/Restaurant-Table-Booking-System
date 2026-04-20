import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Alert,
  Paper,
  TextField,
  Typography,
  Link,
  InputAdornment,
  IconButton,
} from "@mui/material";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../store/slice/auth.slice";
import { useLoginMutation } from "../store/api/auth.api";

const loginSchema = yup.object({
  email: yup.string().email("Invalid Email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters long")
    .required("Password is Required"),
});

function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const currentUser = useSelector(selectCurrentUser);
  const [loginMutation, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data) => {
    try {
      setError("");
      await loginMutation(data).unwrap();
    } catch (err) {
      setError(err?.data?.message || "Invalid email or password");
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
              Welcome back
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Sign in to your TableBook account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
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
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          <Typography variant="body2" textAlign="center" color="text.secondary">
            Don't have an account?{" "}
            <Link
              component={RouterLink}
              to="/register"
              sx={{ fontWeight: 600, color: "primary.main" }}
            >
              Create account
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;
