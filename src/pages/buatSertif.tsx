import React, { useState } from "react";
import Homepage from "../layouts/homepage";
import "../assets/styles/buatSertif.css"; // Import CSS

const buatSertif: React.FC = () => {
  const [passphrase, setPassphrase] = useState("");
  const [days, setDays] = useState(365);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    alert(`Sertifikat berhasil dibuat!\nPassphrase: ${passphrase}\nBerlaku: ${days} hari`);
  };

  return (
    <Homepage>
    <div className="buatSertifcontainer">
      {/* Header */}
      <h2 className="header">Buat Sertifikat Baru</h2>

      {/* Informasi */}
      <div className="info">
        <h3>Informasi</h3>
        <p>
          Passphrase sertifikat digunakan setiap kali Anda akan menandatangani
          dokumen dengan sertifikat.
        </p>
        <ul>
          <li>Panjang passphrase minimal 4 karakter</li>
          <li>Berisi huruf kecil (non-kapital) dan angka</li>
          <li className="warning">Jangan gunakan passphrase yang sama dengan password login akun</li>
        </ul>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="data-box">
          <h3>Data Sertifikat</h3>

          {/* Input Masa Berlaku */}
          <div className="input-group">
            <label>Passphrase</label>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="input-field"
              placeholder="Masukkan passphrase"
              required
            />
          </div>

          <div className="input-group">
            <label>Masa Berlaku</label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="input-field"
              required
            />
            <span>hari dari sekarang</span>
          </div>
        </div>

        {/* Tombol Simpan */}
        <button type="submit" className="save-btn">
          Simpan
        </button>
      </form>
    </div>
    </Homepage>
  );
};

export default buatSertif;
