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
  const [dataLoading, setDataLoading] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)

  const getDocuments = async (): Promise<void> => {
    try {
      const cookies: Cookies = new Cookies()
      const token: string = cookies.get("bhf-e-sign-access-token")
      const {data} = await axios.get(import.meta.env.VITE_API_HOST + '/api/document/get-list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (data?.payload) setDocuments(data.payload)
        // console.log(data?.payload)
    } catch (err: any) {
      console.error(err.message)
    }
    setDataLoading(false)
  }

  useEffect(() => {
    getDocuments()
    // console.log(documents);
    
  }, [])

  const deleteDocument = async (id: string): Promise<void> => {
    if (loading) return
    setLoading(true)
    const cookies: Cookies = new Cookies()
    const token: string = cookies.get("bhf-e-sign-access-token")
    if (confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) try {
      const response = await axios.delete(import.meta.env.VITE_API_HOST+`/api/document/delete?document=${id}`, {
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
    setLoading(false)
  }

  const downloadDocument = async (url: string, filename: string, fullSigned: boolean): Promise<void> => {
    if (loading) return
    setLoading(true)
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
    setLoading(false)
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
            {dataLoading ?
            <tr><td colSpan={6}>Loading ...</td></tr>
            : documents.map((doc, index) => {
              var deniedCount: number = 0
              doc.documentApprovals?.forEach((app: any) => {
                if (app.denied) deniedCount++
              })
              return <tr key={index}>
                <td>{index + 1}</td>
                <td>{doc.title}</td>
                <td>{new DatetimeFormatter().format(doc.createdAt)}</td>
                <td>
                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <div style={{width: '100%', height: '5px', backgroundColor: '#aaa'}}>
                      <div style={{width: `calc(${doc.signedCount/doc.requestCount}*100%)`, height: '5px', backgroundColor: '#0c0'}}></div>
                    </div>
                    <div>{doc.signedCount}/{doc.requestCount}</div>
                  </div>
                </td>
                <td>
                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <div style={{width: '100%', height: '5px', backgroundColor: '#aaa'}}>
                      <div style={{width: `calc(${deniedCount/doc.requestCount}*100%)`, height: '5px', backgroundColor: '#f00'}}></div>
                    </div>
                    <div>{deniedCount}/{doc.requestCount}</div>
                  </div>
                </td>
                <td className="aksi-buttons">
                  <button className={loading ? 'revoke-btn' : "detail-btn"} onClick={()=>{ 
                    window.open(doc.url, '_blank') 
                  }} disabled={loading}>🔍 Detail</button>
                  <button className={loading ? 'revoke-btn' : "download-btn"} onClick={()=>{ 
                    downloadDocument(doc.url, doc.title, doc.signedCount == doc.requestCount)
                  }} disabled={loading}>📥 Unduh</button>
                  <button className={loading ? 'revoke-btn' : "delete-btn"} onClick={() => deleteDocument(Crypt.encryptString(`${doc.id}`))} disabled={loading}>🗑️ Hapus</button>
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
