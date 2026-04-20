import { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentUser, logout } from "../store/slice/auth.slice";
import { useLogoutMutation } from "../store/api/auth.api";

const navMenus = {
  customer: [
    { label: "Browse", to: "/restaurants" },
    { label: "My Bookings", to: "/my-bookings" },
  ],
  owner: [
    { label: "Dashboard", to: "/owner" },
    { label: "Restaurants", to: "/owner/restaurants" },
    { label: "Tables", to: "/owner/restaurants/tables" },
    { label: "Bookings", to: "/owner/all-bookings" },
  ],
};

const Header = () => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useSelector(selectCurrentUser);
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation();
    } catch (e) {
      console.error(e);
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  const navLinks = navMenus[currentUser?.role] || [];

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, sm: 3 } }}>
        {/* Brand */}
        <Box
          component={Link}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            textDecoration: "none",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "primary.main",
              letterSpacing: "-0.3px",
            }}
          >
            TableBook
          </Typography>
        </Box>

        {/* Desktop Nav */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ display: { xs: "none", sm: "flex" } }}
        >
          {navLinks.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Button
                key={item.label}
                component={Link}
                to={item.to}
                sx={{
                  color: isActive ? "primary.main" : "text.secondary",
                  fontWeight: isActive ? 700 : 500,
                  borderBottom: isActive ? "2px solid" : "2px solid transparent",
                  borderRadius: 0,
                  pb: "2px",
                  "&:hover": {
                    color: "primary.main",
                    backgroundColor: "transparent",
                  },
                }}
              >
                {item.label}
              </Button>
            );
          })}

          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            size="small"
            sx={{ ml: 1 }}
          >
            Logout
          </Button>
        </Stack>

        {/* Mobile Hamburger */}
        <IconButton
          onClick={() => setOpen(true)}
          sx={{ display: { xs: "flex", sm: "none" }, color: "primary.main" }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { width: 260, pt: 1 },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2, py: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
              TableBook
            </Typography>
          </Box>
          <IconButton onClick={() => setOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 1 }} />

        <List disablePadding>
          {navLinks.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <ListItem key={item.label} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  sx={{
                    borderLeft: isActive ? "3px solid" : "3px solid transparent",
                    borderColor: isActive ? "primary.main" : "transparent",
                    color: isActive ? "primary.main" : "text.primary",
                    fontWeight: isActive ? 700 : 400,
                    pl: 2.5,
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontWeight: isActive ? 700 : 400 }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Box sx={{ px: 2, pt: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={() => { setOpen(false); handleLogout(); }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Header;