import { Navigate, Outlet } from "react-router-dom";
import { useUserRole, UserRole } from "@/hooks/useUserRole";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { role, loading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080D1F] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;