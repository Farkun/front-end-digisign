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
        alert('Maximum file size is 2MB')
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
      if (!data) return
        alert("Signature uploaded successfully!")
        setCurrentImage(previewUrl)
        setPreviewUrl(null)
    } catch (err: any) {
      // console.error(err.message)
    }
  }

  // Simpan tanda tangan yang di-upload
  const handleSave = (e: any): void => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    const cookies: Cookies = new Cookies()
    const accessToken: string = cookies.get("bhf-e-sign-access-token")
    if (selectedFile) {
      if (currentImage) {
        if (confirm('Are you sure to change current signature?')) saveSign(accessToken)
      }
      saveSign(accessToken)
    } else {
      alert("Please choose file for signature image.");
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
      if (data && data.payload) setCurrentImage(data.payload)
    } catch (err: any) {
      // console.error(err.message)
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
    if (!confirm('Are you sure to delete this signature?')) return
    try {
      const {data} = await axios.delete(import.meta.env.VITE_API_HOST + `/api/signature/delete`, {headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }})
      if (!data) {
        alert('Failed to delete signature')
        return
      } 
      alert('Signature saved successfully')
      window.location.reload()
      return
    } catch (err: any) {
      alert('Failed to delete signature')
      // console.error(err.message)
    }
    setLoading(false)
  }

  return (
    <Homepage>
      <div className="gambar-ttd-container">
        <h2 className="gambar-ttd-title" style={window.matchMedia("(prefers-color-scheme: dark)").matches ? {color: 'white'} : {}}>Signature Image</h2>

        {/* Informasi */}
        <div className="card" style={{color: 'black'}}>
          <div className="card-content">
            <h4 className="card-title">Information</h4>
            <p className="info-text">
              You can upload a scanned image of your signature (PNG) on this page to paste into your document. Make sure the signature image is clear, has good contrast, and has a transparent background.
            </p>
          </div>
        </div>

        {/* Upload Tanda Tangan */}
        <div className="card" style={{color: 'black'}}>
          <div className="card-content">
            <h4 className="card-title">Upload Signature Image</h4>
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
              {loading ? 'Loading ...' : <input type="file" accept="image/png" onChange={handleFileChange} required readOnly={loading}/>}
              <button type="submit" className="save-button" disabled={loading} style={loading ? {backgroundColor: 'gray'} : {}}>
                Save
              </button>
            </form>
            {currentImage &&
              <button type="button" style={loading ? {backgroundColor: 'gray'} : {backgroundColor: '#cc0000'}} onClick={deleteSignature} disabled={loading}>Delete</button>
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
