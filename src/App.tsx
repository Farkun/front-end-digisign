import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home";
import About from "./pages/about";
import Login from "./pages/login";
import NotFound from "./pages/notFound";
import Dashboard from "./pages/dashboard";
import Permintaan from "./pages/permintaan";
import GambarTTD from "./pages/gambar_ttd";
import Diunggah from "./pages/diunggah";
import Ditandatangani from "./pages/ditandatangani";
import TandaTangani from "./pages/tandaTangani";
import TandaTangan from "./pages/tandaTangan";
import SertifDigi from "./pages/SertifDigi";
import Unggah from "./pages/unggah";
import BuatSertif from "./pages/buatSertif";
import Navbar from "./components/navbar";
import "./App.css";
import { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import { jwtDecode } from "jwt-decode";
import Unverified from "./pages/unverified";
import Register from "./pages/register";
import TandaTanganiPersetujuan from "./pages/tandatanganiPersetujuan";
import GuestRoutes from "./routes/GuestRoutes";
import ProtectedRoutes from "./routes/ProtectedRoutes";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isVerified, setIsVerified] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

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
    setIsLoading(false)
  }
  
  useEffect(() => {
    validateToken()
  }, [])

  if (isLoading) return <div>Loading...</div>;

  return (
    <Router>
      {/* <LocationLogger/> */}
      <Routes>
        <Route path="/" element={<Navbar />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route element={<GuestRoutes isAuthenticated={isAuthenticated} isVerified={isVerified}/>}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
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
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
