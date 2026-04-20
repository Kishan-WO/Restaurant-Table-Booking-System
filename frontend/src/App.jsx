import Register from "./pages/Register";
import Login from "./pages/Login";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/owner/Dashboard";
import RestaurantForm from "./pages/owner/RestaurantForm";
import OwnerRestaurantList from "./pages/owner/OwnerRestaurantList";
import UserRestaurantList from "./pages/user/UserRestaurantList";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import TableManagement from "./pages/owner/TableManagement";
import RestaurantBookingForm from "./pages/user/RestaurantBookingForm";
import MyBookings from "./pages/user/MyBookings";
import AllBookings from "./pages/owner/AllBookings";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<Layout />}>
        <Route element={<ProtectedRoute requiredRole="owner" />}>
          <Route path="/owner">
            <Route index element={<Dashboard />} />
            <Route path="restaurants" element={<OwnerRestaurantList />} />
            <Route path="restaurants/tables" element={<TableManagement />} />
            <Route path="restaurants/:id" element={<RestaurantForm />} />
            <Route path="all-bookings" element={<AllBookings />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute requiredRole="customer" />}>
          <Route path="/restaurants" element={<UserRestaurantList />} />
          <Route path="/restaurants/:id" element={<RestaurantBookingForm />} />
          <Route path="/my-bookings" element={<MyBookings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;