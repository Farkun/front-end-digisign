import { useEffect, useState } from "react";
import Homepage from "../../layouts/homepage";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Cookies from 'universal-cookie';

function Dashboard() {
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const cookies = new Cookies()
    const decoded: any = jwtDecode(cookies.get("bhf-e-sign-access-token"))
    setUsername(decoded.username)
  }, [])

  return (
    <Homepage>
      <div className="content">
        <h2>Selamat datang, {username}</h2>
        <p>Pilih aktivitas yang ingin Anda lakukan</p>
        <div className="dashboard-cards">
          <Link to="/tandatangani" className="card">✍️ Tanda Tangani Dokumen Sendiri</Link>
          <Link to="/dokumen/unggah" className="card">📤 Unggah Dokumen</Link>
          <Link to="/permintaan" className="card">📄 Lihat Dokumen</Link>
        </div>
      </div>
    </Homepage>
  );
}

export default Dashboard;
