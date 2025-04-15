import Homepage from "../layouts/homepage";
import "../assets/styles/SertifDigi.css";
import { Link, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import axios from "axios";

function SertifDigi() {

  const [certificate, setCertificate] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const getCertificate = async (): Promise<void> => {
    try {
      const cookies: Cookies = new Cookies()
      const token: string = cookies.get('accessToken')
      const {data}: any = await axios.get(import.meta.env.VITE_API_HOST + '/api/signature/get-certificate', {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      if (!data?.payload) {
        alert('Anda belum memiliki tanda tangan')
        setIsLoading(false)
        return
      }
      if (data?.payload && data.payload.createdAt && data.payload.expire && data.payload.passphrase) {
        const {passphrase, bytes, ...cert}: any = data.payload
        cert.isExpired = new Date().getTime() >= new Date(cert?.expire).getTime()
        cert.createdAt = new Date(cert.createdAt).toDateString()
        cert.expiring = new Date(cert.expire).toDateString()
        setCertificate(cert)
      }
    } catch (err: any) {
      console.error(err.message)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    getCertificate()
  }, [])

  
  if (isLoading) return <div>Loading ...</div>

  return (
    certificate ?
    <Homepage>
        <div className="card" style={{color: 'black'}}>
          <div className="card-content">
            <h4 className="card-title">Informasi</h4>
            <p className="info-text">
            Sertifikat digital merupakan identitas Anda di sistem untuk membuat tanda tangan digital. 
            Anda hanya dapat memiliki satu sertifikat yang aktif dalam satu waktu. 
            Jika Anda membuat sertifikat baru, sertifikat lama akan dinonaktifkan (revoked) secara otomatis. 
            Anda juga dapat menonaktifkan suatu sertifikat secara manual.
            </p>
          </div>
        </div>
      <div className="SertifDigi-container" style={{color: 'black'}}>
        <h2>Sertifikat</h2>
        <Link to="/pengaturan/sertifikat/create">
          <button className="buat-sertifikat-btn" style={certificate && !certificate.isExpired ? {backgroundColor: 'gray'} : {}}>➕ Buat Sertifikat</button>
        </Link>
        <table className="SertifDigi-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Serial Number</th>
              <th>Subject</th>
              <th>Valid Time</th>
              <th>Dibuat</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {certificate &&
              <tr>
                <td>#</td>
                <td>6957A925BB39E460</td>
                <td>Sub: E=fabimanyu@apps.ipb.ac.id, CN=Farchan Abimanyu
                Iss: CN=IPB University, OU=IPB, O=IPB, L=Bogor, S=West Java, C=ID</td>
                <td style={{minWidth: '100px'}}>{certificate.createdAt} <br /> - {certificate.expiring}</td>
                <td>{certificate.createdAt}</td>
                <td><span className={`status ${certificate.isExpired ? 'kadaluarsa' : 'aktif'}`}>{certificate.isExpired ? 'Kadaluarsa' : 'Aktif'}</span></td>
                <td>
                  <button className="revoke-btn">❌ Revoke</button>
                </td>
              </tr>
            }

            {/* <tr>
              <td>2</td>
              <td>097ACB1D17C1581D</td>
              <td>Sub: E=fabimanyu@apps.ipb.ac.id, CN=Farchan Abimanyu
              Iss: CN=IPB University, OU=IPB, O=IPB, L=Bogor, S=West Java, C=ID</td>
              <td>Selasa, 24 Agustus 2021 - Rabu, 24 Agustus 2022</td>
              <td>Selasa, 24 Agustus 2021 - 21.50.06</td> 
              <td><span className="status kadaluarsa">Kadaluarsa</span></td>
              <td>
                <button className="revoke-btn">❌ Revoke</button>
              </td>
            </tr>
            <tr>
              <td>3</td>
              <td>Kontrak Kerjasama</td>
              <td>15 Maret 2025-10:30 AM</td>
              <td>15 Maret 2025-03:30 PM</td>
              <td>6957A925BB39E460</td> 
              <td><span className="status kadaluarsa">Kadaluarsa</span></td>
              <td>
                <button className="revoke-btn">❌ Revoke</button>
              </td>
            </tr> */}

          </tbody>
        </table>
      </div>
    </Homepage>
    : <Navigate to={'/pengaturan/tanda-tangan'}/>
  );
}

export default SertifDigi;
