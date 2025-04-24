import Homepage from "../../layouts/homepage";
import "../../assets/styles/SertifDigi.css";
import { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import axios from "axios";
import DatetimeFormatter from "../../utils/DatetimeFormatter";

function SertifDigi() {

  const [certificate, setCertificate] = useState<any>(null)
  const [signature, setSignature] = useState<any>(null)
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
      if (data?.payload) {
        const {passphrase, bytes, ...cert}: any = data.payload
        setSignature(cert)
        if (passphrase && cert.expire) {
          const currentDate: Date = new Date()
          const expiringDate: Date = new Date(cert?.expire)
          cert.isExpired = new Date().getTime() >= expiringDate.getTime()
          cert.createdAt = new DatetimeFormatter().format(cert.extensionDate ?? cert.createdAt)
          cert.expiring = new DatetimeFormatter().format(cert.expire)
          if (currentDate.getMonth() == expiringDate.getMonth()) cert.nearlyExpiring = true
          else if (currentDate.getMonth() < expiringDate.getMonth() && expiringDate.getDate() - currentDate.getDate() <= 0 ) cert.nearlyExpiring = true
          else cert.nearlyExpiring = false
          setCertificate(cert)
        }
      }
    } catch (err: any) {
      console.error(err.message)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    getCertificate()
  }, [])

  const revoke = async (): Promise<void> => {
    if (!confirm('Apakah Anda yakin ingin merevoke sertifikat tanda tangan ini?')) return
    const passphrase: string | null = prompt('Masukkan passphrase untuk melanjutkan')
    if (!passphrase || passphrase == '') return
    const cookies: Cookies = new Cookies()
    const token: string = cookies.get('accessToken')
    try {
      const {data} = await axios.delete(import.meta.env.VITE_API_HOST + `/api/signature/revoke?passphrase=${passphrase}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      if (!data) {
        alert('gagal revoke sertifikat')
        return
      }
      alert('Sertifikat berhasil direvoke')
      window.location.reload()
    } catch (err: any) {
      console.error(err.message)
    }
  }

  const extend = async (): Promise<void> => {
    const cookies: Cookies = new Cookies()
    const token: string = cookies.get('accessToken')
    const extend_in_days: string | null = prompt("Masukkan jumlah perpanjangan dalam hari untuk melanjutkan\n\n*Perpanjangan dihitung per hari ini")
    if (!extend_in_days || extend_in_days == '') return
    if (parseInt(extend_in_days) < 1) return
    const passphrase: string | null = prompt('Masukkan passphrase untuk melanjutkan')
    if (!passphrase || passphrase == '') return
    try {
      const {data} = await axios.put(import.meta.env.VITE_API_HOST + `/api/signature/extends?passphrase=${passphrase}&extend_in_days=${extend_in_days}`, {}, { headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }})
      if (data) {
        alert('Sertifikat berhasil diperpanjang')
        window.location.reload()
      } else {
        alert('Sertifikat gagal diperpanjang')
        return
      }
    } catch (err: any) {
      console.error(err.message)
    }
  }
  
  if (isLoading) return <div>Loading ...</div>

  return (
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
          <button className="buat-sertifikat-btn" style={certificate ? {backgroundColor: 'gray'} : {}} onClick={() => {
            if (!signature) {
              alert('Anda belum memiliki tanda tangan')
              window.location.href = '/pengaturan/tanda-tangan'
            } else if (!certificate) window.location.href = "/pengaturan/sertifikat/create"
          }}>➕ Buat Sertifikat</button>
        <table className="SertifDigi-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Serial Number</th>
              {/* <th>Subject</th> */}
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
                <td>{certificate.serialNumber}</td>
                {/* <td>Sub: E=fabimanyu@apps.ipb.ac.id, CN=Farchan Abimanyu
                Iss: CN=IPB University, OU=IPB, O=IPB, L=Bogor, S=West Java, C=ID</td> */}
                <td style={{minWidth: '100px'}}>{certificate.createdAt} <br /> - <br /> {certificate.expiring}</td>
                <td>{certificate.createdAt}</td>
                <td><span className={`status ${certificate.isExpired ? 'kadaluarsa' : 'aktif'}`} style={certificate.nearlyExpiring ? {backgroundColor: '#ffaa0055', color: '#ff7700', border: 'none'} : {}}>{certificate.isExpired ? 'Kadaluarsa' : certificate.nearlyExpiring ? 'Akan Kadaluarsa' : 'Aktif'}</span></td>
                <td>
                  <button style={{width: 'fit-content'}} onClick={extend}>⏳ Perpanjang</button>
                  <button className="revoke-btn" onClick={revoke}>❌ Revoke</button>
                </td>
              </tr>
            }

          </tbody>
        </table>
      </div>
    </Homepage>
  );
}

export default SertifDigi;
