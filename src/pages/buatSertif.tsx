import React, { useState } from "react"
import Homepage from "../layouts/homepage"
import "../assets/styles/buatSertif.css" // Import CSS
import axios from "axios"
import Cookies from "universal-cookie"

const buatSertif: React.FC = () => {
  const [passphrase, setPassphrase] = useState(null)
  const [days, setDays] = useState(0)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (days <= 0) alert('minimum expiration is 1 day')
    if (!passphrase || passphrase == '') alert('passphrase cannot be null')
    if (days > 0 && passphrase && passphrase != '') {
      try {
        const cookies: Cookies = new Cookies()
        const token: string = cookies.get("accessToken")
        const {data}: any = await axios.post('http://localhost:8080/api/signature/store-certificate', {
          passphrase: passphrase,
          expire_in: days
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        })
        if (data) alert(`Sertifikat berhasil dibuat!\nBerlaku sampai dengan: ${days} hari`)
        window.location.href = '/pengaturan/sertifikat'
      } catch (err: any) {
        console.error(err.message)
      }
    }
  }

  return <Homepage>
    <div className="buatSertifcontainer" style={{color: 'black'}}>
      {/* Header */}
      <h2 className="header">Buat Sertifikat Baru</h2>

      {/* Informasi */}
      <div className="info">
        <h3>Informasi</h3>
        <p>
          Passphrase sertifikat digunakan setiap kali Anda akan menandatangani
          dokumen dengan sertifikat.
        </p>
        <ul>
          <li>Panjang passphrase minimal 4 karakter</li>
          <li>Berisi huruf kecil (non-kapital) dan angka</li>
          <li className="warning">Jangan gunakan passphrase yang sama dengan password login akun</li>
        </ul>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="data-box">
          <h3>Data Sertifikat</h3>

          {/* Input Masa Berlaku */}
          <div className="input-group">
            <label>Passphrase</label>
            <input
              type="password"
              // value={passphrase}
              name="passphrase"
              onChange={(e: any) => setPassphrase(e.target.value)}
              className="input-field"
              placeholder="Masukkan passphrase"
              required
            />
          </div>

          <div className="input-group">
            <label>Masa Berlaku</label>
            <input
              type="number"
              min={0}
              defaultValue={0}
              name="expire_in"
              onChange={(e: any) => setDays(Number(e.target.value))}
              className="input-field"
              required
            />
            <span>hari dari sekarang</span>
          </div>
        </div>

        {/* Tombol Simpan */}
        <button type="submit" className="save-btn">
          Simpan
        </button>
      </form>
    </div>
  </Homepage>
}

export default buatSertif
