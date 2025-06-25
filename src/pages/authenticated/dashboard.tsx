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
        <h2>Welcome, {username}</h2>
        <p>What would you do?</p>
        <div className="dashboard-cards">
          <Link to="/tandatangani" className="card">✍️ Sign Document by Self</Link>
          <Link to="/dokumen/unggah" className="card">📤 Upload Document</Link>
          <Link to="/permintaan" className="card">📄 View Requested Documents</Link>
        </div>
      </div>
    </Homepage>
  );
}

export default Dashboard;
