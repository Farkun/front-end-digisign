import Homepage from "../layouts/homepage";
import "../assets/styles/diunggah.css";

function Diunggah() {
  return (
    <Homepage>
      <div className="diunggah-container" style={{color: 'black'}}>
        <h2>Dokumen yang Diunggah</h2>
        <table className="diunggah-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Judul</th>
              <th>Tanggal Upload</th>
              <th>Penandatanganan</th>
              <th>Ditolak</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {/* Contoh Data - Nanti bisa diganti dengan data dari database */}
            <tr>
              <td>1</td>
              <td>Dokumen Perjanjian</td>
              <td>10 Maret 2025-11:32 AM</td>
              <td>0/2</td> {/* Contoh: Butuh 2 tanda tangan, belum ada */}
              <td>0</td>
              <td className="aksi-buttons">
                <button className="detail-btn">🔍 Detail</button>
                <button className="download-btn">📥 Unduh</button>
                <button className="delete-btn">🗑️ Hapus</button>
              </td>
            </tr>
            <tr>
              <td>2</td>
              <td>Surat Keputusan</td>
              <td>12 Maret 2025-10:30 PM</td>
              <td>1/1</td> {/* Contoh: Selesai ditandatangani */}
              <td>0</td>
              <td className="aksi-buttons">
                <button className="detail-btn">🔍 Detail</button>
                <button className="download-btn">📥 Unduh</button>
                <button className="delete-btn">🗑️ Hapus</button>
              </td>
            </tr>
            <tr>
              <td>3</td>
              <td>Kontrak Kerjasama</td>
              <td>15 Maret 2025-10:30 AM</td>
              <td>0/3</td> {/* Contoh: 3 orang harus menandatangani, belum ada yang tanda tangan */}
              <td>1</td> {/* Ada 1 orang yang menolak */}
              <td className="aksi-buttons">
                <button className="detail-btn">🔍 Detail</button>
                <button className="download-btn">📥 Unduh</button>
                <button className="delete-btn">🗑️ Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Homepage>
  );
}

export default Diunggah;
