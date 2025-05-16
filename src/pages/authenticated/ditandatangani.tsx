import Homepage from "../../layouts/homepage";
import "../../assets/styles/ditandatangani.css";
import Cookies from "universal-cookie";
import axios from "axios";
import { ReactElement, useEffect, useState } from "react";
import DatetimeFormatter from "../../utils/DatetimeFormatter";
import { saveAs } from "file-saver";
import { jwtDecode } from 'jwt-decode';

function Ditandatangani() {

  const [documents, setDocuments] = useState<any[]>([])
  const [userId, setUserId] = useState<any>(null)
  const [dataLoading, setDataLoading] = useState<boolean>(true)

  const getDocuments = async (): Promise<void> => {
    const cookies: Cookies = new Cookies()
    const token: string = cookies.get("bhf-e-sign-access-token")
    try {
      const {data} = await axios.get(import.meta.env.VITE_API_HOST + '/api/document/signed', { headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }})
      if (data?.payload) setDocuments(data.payload)
    } catch (err: any) {
      console.error(err.message)
    }
    setDataLoading(false)
  }

  const getUser = (): void => {
    const cookies: Cookies = new Cookies()
    const profile: any = jwtDecode(cookies.get('bhf-e-sign-access-token'))
    setUserId(profile?.id)
  }

  useEffect(() => {
    getUser()
    getDocuments()
  }, [])

  const downloadDocument = async (route: string, filename: string): Promise<void> => {
    try {
      const {data} = await axios.get(route, {responseType: 'arraybuffer'})
      if (data) {
        const blob: Blob = new Blob([data], {type: 'application/pdf'})
        const file: File = new File([blob], filename, {type: 'application/pdf'})
        saveAs(file)
      }
    } catch (err: any) {
      console.error(err.message)
    }
  }

  return (
    <Homepage>
      <div className="ditandatangani-container" style={{color: 'black'}}>
        <h2>Dokumen Ditandatangani</h2>
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
            {dataLoading ? 
            <tr><td colSpan={7}>Loading ...</td></tr>
            : documents.map((doc: any, index: number): ReactElement => {
              const mySiqgnIndex: number = doc.signers.map((e: any, i: number) => {
                if (e.id == userId) return i
                return null
              }).filter((item: number | null) => item != null)[0]
              const lastSigner: any = doc.documentApprovals[mySiqgnIndex]
              return <tr key={index} style={{fontSize: '14px'}}>
                <td>{index + 1}</td>
                <td>{doc.title.replaceAll('.pdf', '')}</td>
                <td>
                  <div>{new DatetimeFormatter().format(doc.createdAt)}</div>
                  <div style={{marginTop: '5px', fontSize: '12px', color: 'gray'}}>Oleh: {doc.applicant.username}</div>
                </td>
                <td>{new DatetimeFormatter().format(doc.signedAt)}</td>
                <td>{lastSigner.serialNumber}</td>
                <td>{doc.signedCount}/{doc.requestCount}</td>
                <td className="aksi-buttons">
                  <button className="detail-btn" onClick={() => window.open(doc.url, '_blank')}>🔍 Detail</button>
                  <button className="download-btn" onClick={() => downloadDocument(doc.url, `[SIGNED] ${doc.title}`)}>📥 Unduh</button>
                </td>
              </tr>
            })}
          </tbody>
        </table>
      </div>
    </Homepage>
  );
}

export default Ditandatangani;
