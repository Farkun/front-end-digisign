import { useState } from "react";
import DigitalSignature from "../components/DigitalSignature";
import Homepage from "../layouts/homepage";
import "../assets/styles/gambar_ttd.css"; // CSS khusus halaman ini

const GambarTandaTangan = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Handle upload file
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Simpan tanda tangan yang di-upload
  const handleSave = () => {
    if (selectedFile) {
      console.log("File disimpan:", selectedFile.name);
      alert("Tanda tangan berhasil diupload!");
    } else {
      alert("Silakan pilih file terlebih dahulu.");
    }
  };

  return (
    <Homepage>
      <div className="gambar-ttd-container">
        <h2 className="gambar-ttd-title">Gambar Tanda Tangan</h2>

        {/* Informasi */}
        <div className="card">
          <div className="card-content">
            <h4 className="card-title">Informasi</h4>
            <p className="info-text">
              Anda dapat meng-upload gambar hasil scan tanda tangan Anda (JPG atau PNG) pada halaman
              ini untuk ditempelkan di dokumen. Pastikan gambar tanda tangan cukup jelas, memiliki
              kontras yang baik, dan berlatar belakang putih bersih atau transparan. Anda juga dapat
              menggambar tanda tangan menggunakan mouse, pen tablet, atau alat penunjuk lainnya.
            </p>
          </div>
        </div>

        {/* Upload Tanda Tangan */}
        <div className="card">
          <div className="card-content">
            <h4 className="card-title">Upload Tanda Tangan</h4>
            <input type="file" accept="image/png, image/jpeg" onChange={handleFileChange} />
            {selectedFile && <p className="file-name">File: {selectedFile.name}</p>}
            {previewUrl && <img src={previewUrl} alt="Preview" className="preview-image" />}
            <button className="save-button" onClick={handleSave}>
              Simpan
            </button>
          </div>
        </div>

        {/* Digital Signature */}
        <div className="card">
          <div className="card-content">
            <h4 className="card-title">Tanda Tangan Digital</h4>
            <DigitalSignature />
          </div>
        </div>
      </div>
    </Homepage>
  );
};

export default GambarTandaTangan;
