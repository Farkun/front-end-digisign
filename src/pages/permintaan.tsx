import Homepage from "../layouts/homepage";
import "../assets/styles/permintaan.css";
import { NavLink } from "react-router-dom";

function Permintaan() {
    return (
        <Homepage>
            <div className="permintaanContainer"  style={{color: 'black'}}>
                <h2>Rekap Permintaan Data</h2>
                <table className="permintaanTable">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Judul</th>
                            <th>Upload</th>
                            <th>Persetujuan</th>
                            <th>Detail</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Contoh data, nanti bisa diganti dengan data dinamis */}
                        <tr>
                            <td>1</td>
                            <td>Permintaan Dokumen A</td>
                            <td>12-03-2025 10:30 AM <br /> <strong>Farchan Abimanyu</strong></td>
                            <td>✔️ Disetujui</td>
                            <td><button className="detailBtn">🔍 Lihat</button></td>
                            <td>
                                <NavLink to="/permintaan/tandatangan"><button className="signBtn">✍️ Tanda Tangani</button></NavLink>
                                <button className="deleteBtn">❌ Tolak</button>
                            </td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td>Permintaan Dokumen B</td>
                            <td>13-03-2025 14:15 PM <br /> <strong>Rizky Maulana</strong></td>
                            <td>⏳ <span style={{ color: "red" }}>Belum Menanggapi</span></td>
                            <td><button className="detailBtn">🔍 Lihat</button></td>
                            <td>
                                <button className="detailBtn">✔️ Setujui</button>
                                <button className="deleteBtn">❌ Tolak</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Homepage>
    );
}

export default Permintaan;
