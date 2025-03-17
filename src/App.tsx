import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
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

function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

function MainApp() {
  const location = useLocation();

  const isHomepage = location.pathname.startsWith("/dashboard") || 
                     location.pathname.startsWith("/permintaan") || 
                     location.pathname.startsWith("/tandatangani") || 
                     location.pathname.startsWith("/dokumen") || 
                     location.pathname.startsWith("/pengaturan");

  return (
    <div>
      {!isHomepage && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />

        {/* ✅ Panggil `Dashboard` langsung, karena sudah ada `Homepage` di dalamnya */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/permintaan" element={<Permintaan />} />
        <Route path="/pengaturan/tanda-tangan" element={<GambarTTD />} />
        <Route path="/dokumen/diunggah" element={<Diunggah />} />
        <Route path="/dokumen/tandatangani" element={<Ditandatangani />} />
        <Route path="/tandatangani" element={<TandaTangani />} />
        <Route path="/pengaturan/sertifikat" element={<SertifDigi />} />
        <Route path="/dokumen/unggah" element={<Unggah />} />
        <Route path="/pengaturan/sertifikat/create" element={<BuatSertif />} />
        <Route path="/permintaan/tandatangan" element={<TandaTangan />} />
      </Routes>
    </div>
  );
}

export default App;
