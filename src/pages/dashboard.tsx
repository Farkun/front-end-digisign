import Homepage from "../layouts/homepage";
import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <Homepage>
      <div className="content">
        <h2>Selamat datang, User</h2>
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
