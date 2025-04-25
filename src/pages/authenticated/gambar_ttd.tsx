import { useEffect, useState } from "react";
import Homepage from "../../layouts/homepage";
import "../../assets/styles/gambar_ttd.css"; // CSS khusus halaman ini
import axios from "axios";
import Cookies from "universal-cookie";

const GambarTandaTangan = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  // Handle upload file
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (loading) return
    setLoading(true)
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran gamber terlalu besar')
        return
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
    setLoading(false)
  };

  const saveSign = async (accessToken: string): Promise<void> => {
    if (loading) return
    setLoading(true)
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
      } catch (err: any) {
        console.error(err.message)
      }
      setLoading(false)
    }

  // Simpan tanda tangan yang di-upload
  const handleSave = (): void => {
    if (loading) return
    setLoading(true)
    const cookies: Cookies = new Cookies()
    const accessToken: string = cookies.get("bhf-e-sign-access-token")
    if (selectedFile) {
      if (currentImage) {
        if (confirm('Apakah Anda ingin mengganti gambar tanda tangan saat ini?')) saveSign(accessToken)
      }
      saveSign(accessToken)
    } else {
      alert("Silakan pilih file terlebih dahulu.");
    }
    setLoading(false)
  };

  const getSignature = async (): Promise<void> => {
    if (loading) return
    setLoading(true)
    const cookies: Cookies = new Cookies()
    const token: string = cookies.get("bhf-e-sign-access-token")
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
    setLoading(false)
  }

  useEffect(() => {
    getSignature()
  }, [])

  const deleteSignature = async (): Promise<void> => {
    if (loading) return
    setLoading(true)
    const cookies: Cookies = new Cookies()
    const token: string = cookies.get("bhf-e-sign-access-token")
    if (!confirm('Apakah Anda yakin ingin menghapus tanda tangan?')) return
    try {
      const {data} = await axios.delete(import.meta.env.VITE_API_HOST + `/api/signature/delete`, {headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }})
      if (!data) {
        alert('Gagal menghapus tanda tangan')
        return
      } 
      alert('Tanda tangan berhasil dihapus')
      window.location.reload()
      return
    } catch (err: any) {
      alert('Gagal menghapus tanda tangan')
      // console.error(err.message)
    }
    setLoading(false)
  }

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
              <input type="file" accept="image/png" onChange={handleFileChange} required readOnly={loading}/>
              <button type="submit" className="save-button" disabled={loading} style={loading ? {backgroundColor: 'gray'} : {}}>
                Simpan
              </button>
            </form>
            {currentImage &&
              <button type="button" style={loading ? {backgroundColor: 'gray'} : {backgroundColor: '#cc0000'}} onClick={deleteSignature} disabled={loading}>Hapus</button>
            }
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
