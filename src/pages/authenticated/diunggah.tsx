import Homepage from "../../layouts/homepage";
import "../../assets/styles/diunggah.css";
import Cookies from "universal-cookie";
import axios from "axios";
import { useEffect, useState } from "react";
import DatetimeFormatter from "../../utils/DatetimeFormatter";
import { saveAs } from "file-saver";
import Crypt from "../../utils/Crypt";

function Diunggah() {

  const [documents, setDocuments] = useState<any[]>([])

  const getDocuments = async (): Promise<void> => {
    try {
      const cookies: Cookies = new Cookies()
      const token: string = cookies.get('accessToken')
      const {data} = await axios.get(import.meta.env.VITE_API_HOST + '/api/document/get', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (data?.payload) setDocuments(data.payload)
        // console.log(data?.payload)
    } catch (err: any) {
      console.error(err.message)
    }
  }

  useEffect(() => {
    getDocuments()
    // console.log(documents);
    
  }, [])

  const deleteDocument = async (id: string): Promise<void> => {
    const cookies: Cookies = new Cookies()
    const token: string = cookies.get('accessToken')
    if (confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) try {
      const response = await axios.delete(import.meta.env.VITE_API_HOST+`/api/document/${id}/delete`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response) {
        alert('Dokumen berhasil dihapus')
        window.location.reload()
      }
    } catch (err: any) {
      console.error(err.message)
    }
  }

  const downloadDocument = async (url: string, filename: string, fullSigned: boolean): Promise<void> => {
    try {
      const {data} = await axios.get(url, {responseType: 'arraybuffer'})
      if (data) {
        const fileName: string = fullSigned ? `[SIGNED] ${filename}` : filename
        const blob: Blob = new Blob([data], {type: 'application/pdf'})
        const file: File = new File([blob], fileName, {type: 'application/pdf'})
        saveAs(file)
      }
    } catch (err: any) {
      console.error(err.message)
    }
  }

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
            {documents.map((doc, index) => {
              var deniedCount: number = 0
              doc.documentApprovals?.forEach((app: any) => {
                if (app.denied) deniedCount++
              })
              return <tr key={index}>
                <td>{index + 1}</td>
                <td>{doc.title}</td>
                <td>{new DatetimeFormatter().format(doc.createdAt)}</td>
                <td style={deniedCount == doc.requestCount ? {
                  color: "white",
                  backgroundColor: "#E74C3C",
                  fontWeight: "bold"
                } : doc.signedCount == doc.requestCount ? {
                  color: "white",
                  backgroundColor: "#00AA00",
                  fontWeight: "bold"
                } : {}}>{doc.signedCount}/{doc.requestCount}</td>
                <td style={deniedCount == doc.requestCount ? {
                  color: "white",
                  backgroundColor: "#E74C3C",
                  fontWeight: "bold"
                } : {}}>{deniedCount}</td>
                <td className="aksi-buttons">
                  <button className="detail-btn" onClick={()=>{ 
                    window.open(doc.url, '_blank') 
                  }}>🔍 Detail</button>
                  <button className="download-btn" onClick={()=>{ 
                    downloadDocument(doc.url, doc.title, doc.signedCount == doc.requestCount)
                  }}>📥 Unduh</button>
                  <button className="delete-btn" onClick={() => deleteDocument(Crypt.encryptString(`${doc.id}`))}>🗑️ Hapus</button>
                </td>
              </tr>
            })}
            
            {/* <tr>
              <td>2</td>
              <td>Surat Keputusan</td>
              <td>12 Maret 2025-10:30 PM</td>
              <td>1/1</td>
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
              <td>0/3</td>
              <td>1</td>
              <td className="aksi-buttons">
                <button className="detail-btn">🔍 Detail</button>
                <button className="download-btn">📥 Unduh</button>
                <button className="delete-btn">🗑️ Hapus</button>
              </td>
            </tr> */}
          </tbody>
        </table>
      </div>
    </Homepage>
  );
}

export default Diunggah;
