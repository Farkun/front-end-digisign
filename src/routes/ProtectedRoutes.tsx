import { ReactElement } from "react"
import { Navigate, Outlet } from "react-router-dom"


const ProtectedRoutes = ({isAuthenticated, isVerified}: {isAuthenticated: boolean, isVerified: boolean}): ReactElement => {

    if (!isAuthenticated) return <Navigate to={'/login'}/>
    if (!isVerified) return <Navigate to={'/unverified'}/>
    return <Outlet/>
}

export default ProtectedRoutes