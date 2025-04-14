import { ReactElement } from "react";
import { Navigate, Outlet } from "react-router-dom";


const GuestRoutes = ({isAuthenticated, isVerified}: {isAuthenticated: boolean, isVerified: boolean}): ReactElement => {
    if (isAuthenticated) {
        return isVerified ? <Navigate to="/dashboard" /> : <Navigate to="/unverified" />;
    }
    return <Outlet />;
}

export default GuestRoutes