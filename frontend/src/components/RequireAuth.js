import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const RequireAuth = ({allowedRoles}) => {
    const {auth} = useAuth();
    const location = useLocation();
    const check = allowedRoles.includes(auth.role);
    return (
        check 
            ? <Outlet />
            : auth?.accessToken
                ? <Navigate to="/unauthorized"  state={{from: location}} replace />
                : <Navigate to="/login" state={{ from: location }} replace />
    );
}

export default RequireAuth;