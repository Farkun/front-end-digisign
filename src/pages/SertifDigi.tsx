import Homepage from "../layouts/homepage";
import "../assets/styles/SertifDigi.css";
import { Link } from "react-router-dom";

function SertifDigi() {
  return (
    <Homepage>
        <div className="card">
          <div className="card-content">
            <h4 className="card-title">Informasi</h4>
            <p className="info-text">
            Sertifikat digital merupakan identitas Anda di sistem untuk membuat tanda tangan digital. 
            Anda hanya dapat memiliki satu sertifikat yang aktif dalam satu waktu. 
            Jika Anda membuat sertifikat baru, sertifikat lama akan dinonaktifkan (revoked) secara otomatis. 
            Anda juga dapat menonaktifkan suatu sertifikat secara manual.
            </p>
          </div>
        </div>
      <div className="SertifDigi-container">
        <h2>Sertifikat</h2>
        <Link to="/pengaturan/sertifikat/create"><button className="buat-sertifikat-btn">➕ Buat Sertifikat</button></Link>
        <table className="SertifDigi-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Serial Number</th>
              <th>Subject</th>
              <th>Valid Time</th>
              <th>Dibuat</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>

            <tr>
              <td>1</td>
              <td>6957A925BB39E460</td>
              <td>Sub: E=fabimanyu@apps.ipb.ac.id, CN=Farchan Abimanyu
              Iss: CN=IPB University, OU=IPB, O=IPB, L=Bogor, S=West Java, C=ID</td>
              <td>Selasa, 19 Oktober 2021 - Rabu, 19 Oktober 2022</td>
              <td>Selasa, 19 Oktober 2021 - 20.30.46</td>
              <td><span className="status aktif">Aktif</span></td>
              <td>
                <button className="revoke-btn">❌ Revoke</button>
                
              </td>
            </tr>
            <tr>
              <td>2</td>
              <td>097ACB1D17C1581D</td>
              <td>Sub: E=fabimanyu@apps.ipb.ac.id, CN=Farchan Abimanyu
              Iss: CN=IPB University, OU=IPB, O=IPB, L=Bogor, S=West Java, C=ID</td>
              <td>Selasa, 24 Agustus 2021 - Rabu, 24 Agustus 2022</td>
              <td>Selasa, 24 Agustus 2021 - 21.50.06</td> 
              <td><span className="status kadaluarsa">Kadaluarsa</span></td>
              <td>
                <button className="revoke-btn">❌ Revoke</button>
              </td>
            </tr>
            <tr>
              <td>3</td>
              <td>Kontrak Kerjasama</td>
              <td>15 Maret 2025-10:30 AM</td>
              <td>15 Maret 2025-03:30 PM</td>
              <td>6957A925BB39E460</td> 
              <td><span className="status kadaluarsa">Kadaluarsa</span></td>
              <td>
                <button className="revoke-btn">❌ Revoke</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Homepage>
  );
}

export default SertifDigi;
