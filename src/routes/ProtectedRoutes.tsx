import { ReactElement } from "react"
import { Navigate, Outlet } from "react-router-dom"


const ProtectedRoutes = ({isAuthenticated, isVerified}: {isAuthenticated: boolean, isVerified: boolean}): ReactElement => {

    if (!isAuthenticated) return <Navigate to={'/'}/>
    if (!isVerified) return <Navigate to={'/verifikasi'}/>
    return <Outlet/>
}

export default ProtectedRoutes