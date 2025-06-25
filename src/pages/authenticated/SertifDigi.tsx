import Homepage from "../../layouts/homepage";
import "../../assets/styles/SertifDigi.css";
import { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import axios from "axios";
import DatetimeFormatter from "../../utils/DatetimeFormatter";

function SertifDigi() {

  const [certificate, setCertificate] = useState<any[]>([])
  const [signature, setSignature] = useState<any>(null)
  const [loadingData, setLoadingData] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)

  const getSignature = async (): Promise<void> => {
    const cookies: Cookies = new Cookies()
    const token: string = cookies.get('bhf-e-sign-access-token')
    try {
      const {data} = await axios.get(import.meta.env.VITE_API_HOST+`/api/signature/get`, {
        headers: {"Authorization": `Bearer ${token}`}
      })
      if (data) setSignature(data)
    } catch (err: any) {
      // console.error(err.message)
    }
  }

  const getCertificate = async (): Promise<void> => {
    try {
      const cookies: Cookies = new Cookies()
      const token: string = cookies.get("bhf-e-sign-access-token")
      // const {data}: any = await axios.get(import.meta.env.VITE_API_HOST + '/api/signature/get-certificate', {
      const {data}: any = await axios.get(import.meta.env.VITE_API_HOST + '/api/certificate/get', {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      if (data?.payload) {
        getSignature()
        const currentDate: Date = new Date()
        const cert = data.payload.map((cert: any) => {
          const expiringDate: Date = new Date(cert?.expire)
          cert.isExpired = new Date().getTime() >= expiringDate.getTime()
          cert.createdAt = new DatetimeFormatter().format(cert.extensionDate ?? cert.createdAt)
          cert.expiring = new DatetimeFormatter().format(cert.expire)
          if (currentDate.getFullYear() < expiringDate.getFullYear()) cert.nearlyExpiring = false
          else if (currentDate.getMonth() == expiringDate.getMonth() && !cert.isExpired) cert.nearlyExpiring = true
          else if (currentDate.getMonth() < expiringDate.getMonth() && expiringDate.getDate() - currentDate.getDate() <= 0 ) cert.nearlyExpiring = true
          else cert.nearlyExpiring = false
          return cert
        })
        setCertificate(cert)
      }
    } catch (err: any) {
      // console.error(err.message)
    }
    setLoadingData(false)
  }

  useEffect(() => {
    getCertificate()
  }, [])

  const revoke = async (serial: string): Promise<void> => {
    if (loading) return
    setLoading(true)
    if (!confirm('Are you sure to revoke this certificate?')) {
      setLoading(false)
      return
    }
    const passphrase: string | null = prompt('Enter passphrase to process')
    if (!passphrase || passphrase == '') {
      setLoading(false)
      return
    }
    const cookies: Cookies = new Cookies()
    const token: string = cookies.get("bhf-e-sign-access-token")
    try {
      const {data} = await axios.delete(import.meta.env.VITE_API_HOST + `/api/certificate/${serial}/revoke?passphrase=${passphrase}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      if (!data) {
        alert('Failed to revoke certificate')
        return
      }
      alert('Certificate revoked successfully')
      window.location.reload()
    } catch (err: any) {
      // console.error(err.message)
    }
    setLoading(false)
  }
  
  if (loadingData) return <div>Loading ...</div>

  return (
    <Homepage>
        <div className="card" style={{color: 'black'}}>
          <div className="card-content">
            <h4 className="card-title">Information</h4>
            <p className="info-text">
              A digital certificate is your identity in the system to create a digital signature. 
              You can only have one certificate active at a time. 
              If you create a new certificate, the old certificate will be automatically deactivated (revoked). 
              You can also deactivate a certificate manually.
            </p>
          </div>
        </div>
      <div className="SertifDigi-container" style={{color: 'black'}}>
        <h2>Certificates</h2>
          <button className="buat-sertifikat-btn" style={loading ? {backgroundColor: 'gray'} : {}} onClick={() => {
            if (!signature) {
              alert('Anda belum memiliki tanda tangan')
              window.location.href = '/pengaturan/tanda-tangan'
            } else window.location.href = "/pengaturan/sertifikat/create"
          }} disabled={loading}>➕ Create New Certificate</button>
        <table className="SertifDigi-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Serial Number</th>
              <th>Subject</th>
              <th>Valid Time</th>
              <th>Created at</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {certificate && certificate.map((cert: any, index: number) => {
              return <tr key={index} style={cert.isRevoked || cert.isExpired ? {opacity: '50%',fontSize: '14px'} : {fontSize: '14px'}}>
                <td>{index + 1}</td>
                <td>{cert.serialNumber}</td>
                <td>
                  <div style={{whiteSpace: 'break-spaces', textAlign: 'start'}}>
                    {cert.subject}
                  </div>
                </td>
                <td style={{minWidth: '100px'}}>
                    {cert.createdAt} - {cert.expiring}
                </td>
                <td>{cert.createdAt}</td>
                <td><span className={`status ${cert.isExpired || cert.isRevoked ? 'kadaluarsa' : 'aktif'}`} style={cert.nearlyExpiring && !cert.isRevoked ? {backgroundColor: '#ffaa0055', color: '#ff7700', border: 'none'} : {}}>{cert.isExpired ? 'expired' : cert.isRevoked ? 'revoked' : cert.nearlyExpiring ? 'expired soon' : 'aktif'}</span></td>
                <td>
                  {
                    !cert.isRevoked && !cert.isExpired ?
                    <button className="revoke-btn" onClick={() => revoke(cert.serialNumber)} disabled={loading}>❌ Revoke</button>
                    : '-'
                  }
                </td>
              </tr>
            })}

          </tbody>
        </table>
      </div>
    </Homepage>
  );
}

export default SertifDigi;
