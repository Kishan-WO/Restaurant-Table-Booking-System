import { useSelector } from "react-redux";
import { selectCurrentUser } from "../store/slice/auth.slice";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ requiredRole }) {
  const currentUser = useSelector(selectCurrentUser);

  const defaultRoute = {
    customer: "/restaurants",
    owner: "/owner"
  }

  if (!currentUser) return <Navigate to="/login" replace />;
  if (requiredRole && currentUser.role !== requiredRole)
    return <Navigate to={defaultRoute[currentUser.role]} />;
  return <Outlet />;
}
