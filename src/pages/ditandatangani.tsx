import Homepage from "../layouts/homepage";
import "../assets/styles/ditandatangani.css";

function Ditandatangani() {
  return (
    <Homepage>
      <div className="ditandatangani-container">
        <h2>Dokumen yang Diunggah</h2>
        <table className="ditandatangani-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Judul</th>
              <th>Upload</th>
              <th>Ditandatangani</th>
              <th>Sertifikat</th>
              <th>Penandatanganan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>

            <tr>
              <td>1</td>
              <td>Dokumen Perjanjian</td>
              <td>10 Maret 2025-11:32 AM</td>
              <td>11 Maret 2025-09:32 AM</td>
              <td>6957A925BB39E460</td>
              <td>2/2</td>
              <td className="aksi-buttons">
                <button className="detail-btn">🔍 Detail</button>
                <button className="download-btn">📥 Unduh</button>
              </td>
            </tr>
            <tr>
              <td>2</td>
              <td>Surat Keputusan</td>
              <td>12 Maret 2025-10:30 PM</td>
              <td>14 Maret 2025-10:00 AM</td>
              <td>6957A925BB39E460</td> 
              <td>1/1</td>
              <td className="aksi-buttons">
                <button className="detail-btn">🔍 Detail</button>
                <button className="download-btn">📥 Unduh</button>
              </td>
            </tr>
            <tr>
              <td>3</td>
              <td>Kontrak Kerjasama</td>
              <td>15 Maret 2025-10:30 AM</td>
              <td>15 Maret 2025-03:30 PM</td>
              <td>6957A925BB39E460</td> 
              <td>3/3</td>
              <td className="aksi-buttons">
                <button className="detail-btn">🔍 Detail</button>
                <button className="download-btn">📥 Unduh</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Homepage>
  );
}

export default Ditandatangani;
