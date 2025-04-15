import { useEffect, useState } from "react";
import DigitalSignature from "../components/DigitalSignature";
import Homepage from "../layouts/homepage";
import "../assets/styles/gambar_ttd.css"; // CSS khusus halaman ini
import axios from "axios";
import Cookies from "universal-cookie";

const GambarTandaTangan = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null)

  // Handle upload file
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const saveSign = async (accessToken: string) => {
    try {
      const {data} = await axios.post(import.meta.env.VITE_API_HOST + '/api/signature/store-sign', {
        sign: selectedFile
      }, {
        headers: {
          'Content-Type': 'multipart/form-data',
          "Authorization": `Bearer ${accessToken}`
        }
      })
      if (data) alert("Tanda tangan berhasil diupload!")
        console.log(data);
        
    } catch (err: any) {
      console.error(err.message)
    }
  }

  // Simpan tanda tangan yang di-upload
  const handleSave = () => {
    const cookies: Cookies = new Cookies()
    const accessToken: string = cookies.get("accessToken")
    if (selectedFile) {
      if (currentImage) {
        if (confirm('Apakah Anda ingin mengganti gambar tanda tangan saat ini?')) saveSign(accessToken)
      }
      saveSign(accessToken)
    } else {
      alert("Silakan pilih file terlebih dahulu.");
    }
  };

  const getSignature = async () => {
    const cookies: Cookies = new Cookies()
    const token: string = cookies.get('accessToken')
    try {
      const {data}: any = await axios.get(import.meta.env.VITE_API_HOST + '/api/signature/get', {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      if (data && data.payload) setCurrentImage(data.payload.signature)
    } catch (err: any) {
      console.error(err.message)
    }
  }

  useEffect(() => {
    getSignature()
  }, [])

  return (
    <Homepage>
      <div className="gambar-ttd-container">
        <h2 className="gambar-ttd-title" style={window.matchMedia("(prefers-color-scheme: dark)").matches ? {color: 'white'} : {}}>Gambar Tanda Tangan</h2>

        {/* Informasi */}
        <div className="card" style={{color: 'black'}}>
          <div className="card-content">
            <h4 className="card-title">Informasi</h4>
            <p className="info-text">
              Anda dapat meng-upload gambar hasil scan tanda tangan Anda (PNG) pada halaman
              ini untuk ditempelkan di dokumen. Pastikan gambar tanda tangan cukup jelas, memiliki
              kontras yang baik, dan berlatar belakang putih bersih atau transparan. Anda juga dapat
              menggambar tanda tangan menggunakan mouse, pen tablet, atau alat penunjuk lainnya.
            </p>
          </div>
        </div>

        {/* Upload Tanda Tangan */}
        <div className="card" style={{color: 'black'}}>
          <div className="card-content">
            <h4 className="card-title">Upload Tanda Tangan</h4>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {currentImage && !previewUrl && <img src={currentImage} className="preview-image" />}
              {previewUrl && <img src={previewUrl} alt="Preview" className="preview-image"/>}
            </div>
            {selectedFile && <p className="file-name">File: {selectedFile.name}</p>}
            <form onSubmit={handleSave}>
              <input type="file" accept="image/png" onChange={handleFileChange} required/>
              <button type="submit" className="save-button">
                Simpan
              </button>
            </form>
          </div>
        </div>

        {/* Digital Signature */}
        {/* <div className="card" style={{color: 'black'}}>
          <div className="card-content">
            <h4 className="card-title">Tanda Tangan Digital</h4>
            <DigitalSignature isSignatureExist={currentImage ? true : false} />
          </div>
        </div> */}
      </div>
    </Homepage>
  );
};

export default GambarTandaTangan;
