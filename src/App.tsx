import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/guest/home";
import About from "./pages/guest/about";
import Login from "./pages/auth/login";
import NotFound from "./pages/notFound";
import Dashboard from "./pages/authenticated/dashboard";
import Permintaan from "./pages/authenticated/permintaan";
import GambarTTD from "./pages/authenticated/gambar_ttd";
import Diunggah from "./pages/authenticated/diunggah";
import Ditandatangani from "./pages/authenticated/ditandatangani";
import TandaTangani from "./pages/authenticated/tandaTangani";
import TandaTangan from "./pages/authenticated/tandaTangan";
import SertifDigi from "./pages/authenticated/SertifDigi";
import Unggah from "./pages/authenticated/unggah";
import BuatSertif from "./pages/authenticated/buatSertif";
import Navbar from "./components/navbar";
import "./App.css";
import { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import { jwtDecode } from "jwt-decode";
import Unverified from "./pages/auth/unverified";
import Register from "./pages/auth/register";
import TandaTanganiPersetujuan from "./pages/authenticated/tandatanganiPersetujuan";
import GuestRoutes from "./routes/GuestRoutes";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import ForgotPassword from "./pages/auth/forgotPassword";
import ResetPassword from "./pages/auth/resetPassword";
import Profile from "./pages/authenticated/profile";
// import useAuthCheck from "./hooks/useAuthCheck";

function App() {

  // const {user, loading} = useAuthCheck()
  // const isAuthenticated = user ? true : false
  // const isVerified = user?.verifiedAt ? true : false

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isVerified, setIsVerified] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  const validateToken = async () => {
    const cookies = new Cookies();
    const token = cookies.get('accessToken')
    if (token) {
      try {
        const tokenPayload: any = jwtDecode(token) 
        const isExpire: boolean = tokenPayload.exp * 1000 <= Date.now()
        if (!isExpire) {
          setIsAuthenticated(true)
          if (tokenPayload.is_verified) setIsVerified(true)
        }
      } catch {
        setIsAuthenticated(false)
        setIsVerified(false)
      }
    }
    setLoading(false)
  }
  
  useEffect(() => {
    validateToken()
  }, [])

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      {/* <LocationLogger/> */}
      <Routes>
        <Route path="/" element={<Navbar isAuthenticated={isAuthenticated} />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route element={<GuestRoutes isAuthenticated={isAuthenticated} isVerified={isVerified}/>}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password/:token" element={<ResetPassword />} />
          </Route>
        </Route>

        <Route path="/unverified" element={
          !isAuthenticated ? 
          <Navigate to={'/login'} /> 
          : isVerified ? 
            <Navigate to={'/dashboard'}/> 
            : <Unverified/>
        } />
        
        <Route element={<ProtectedRoutes isAuthenticated={isAuthenticated} isVerified={isVerified}/>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="permintaan" element={<Permintaan />} />
          <Route path="permintaan/tandatangan" element={<TandaTangan />} />
          <Route path="tandatangani" element={<TandaTangani />} />
          <Route path="tandatangani/:id" element={<TandaTanganiPersetujuan />} />
          <Route path="dokumen/diunggah" element={<Diunggah />} />
          <Route path="dokumen/tandatangani" element={<Ditandatangani />} />
          <Route path="dokumen/unggah" element={<Unggah />} />
          <Route path="pengaturan/tanda-tangan" element={<GambarTTD />} />
          <Route path="pengaturan/sertifikat" element={<SertifDigi />} />
          <Route path="pengaturan/sertifikat/create" element={<BuatSertif />} />
          <Route path="pengaturan/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
