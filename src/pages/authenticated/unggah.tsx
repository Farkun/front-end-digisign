import React, { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import Homepage from "../../layouts/homepage";
import "../../assets/styles/unggah.css";
import axios from "axios";
import Cookies from "universal-cookie";
import Select from "react-select";

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = 
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.9.179/pdf.worker.min.js";

const Unggah: React.FC = () => {
  const [users, setUsers] = useState<{
    id: number,
    username: string,
    email: string
  }[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [signersId, setSignersId] = useState<number[]>([])
  const [isOrdered, setIsOrdered] = useState<boolean>(false)
  const [pdfImage, setPdfImage] = useState<HTMLImageElement | null>(null);
  const [signers, setSigners] = useState<{ id: number | null,name: string; page: number }[]>([]);
  const [newSigner, setNewSigner] = useState<{ id: number | null,name: string; page: number }>({
    id: null,
    name: "",
    page: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filename, setFilename] = useState<string>('')

  

  // /** ✅ Upload & Render PDF */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setPdfFile(file);
        setCurrentPage(1);
        renderPdf(file, 1);
        setFilename(file.name)
      }
    };

  // /** ✅ Render PDF ke gambar */
  const renderPdf = async (file: File, pageNumber = 1) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async () => {
        const pdfData = new Uint8Array(reader.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
  
        setTotalPages(pdf.numPages); // Simpan total halaman PDF
  
        if (pageNumber < 1 || pageNumber > pdf.numPages) return; // Cegah halaman tidak valid
  
        const page = await pdf.getPage(pageNumber);
        const containerWidth = 597; // Sesuaikan dengan lebar <Stage>
        const scale = containerWidth / page.getViewport({ scale: 1 }).width;
        const viewport = page.getViewport({ scale });
  
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) return;
  
        canvas.width = viewport.width;
        canvas.height = viewport.height;
  
        await page.render({ canvasContext: context, viewport }).promise;
  
        const img = new Image();
        img.src = canvas.toDataURL();
        img.onload = () => setPdfImage(img);
      };
    };

  // /** ✅ Tambah penandatangan */
  const addSigner = () => {
    if (newSigner.name) {
      setSigners([...signers, newSigner]);
      setNewSigner({ id: null, name: "", page: 1 });
    }
  };

  // /** ✅ Hapus penandatangan */
  const removeSigner = (index: number) => {
    setSigners(signers.filter((_, i) => i !== index));
  };

  const getUsers = async () => {
    try {
      const cookies: Cookies = new Cookies()
      const token: string = cookies.get('accessToken')
      const {data}: any = await axios.get(import.meta.env.VITE_API_HOST + '/api/users/get', {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      if (data?.payload) setUsers(data.payload)
    } catch (err: any) {
      console.error(err.message)
    }
  }

  useEffect(() => {
    getUsers()
  }, [])

  
  

  const handleSubmit = async () => {
    if (!pdfFile) alert('file not selected')
    if (!signersId || signersId.length == 0) alert('signers not selected')
    if (pdfFile && signersId?.length > 0) {
      const signerdata = [...signers, newSigner]
      const pageNumbers: number[] = signerdata.map((val: {page: number}) => {
        return val?.page
      })
      try {
        const cookies: Cookies = new Cookies()
        const token: string = cookies.get('accessToken')
        const {data} = await axios.post(import.meta.env.VITE_API_HOST + '/api/document/send', {
          file: pdfFile,
          title: filename,
          signers_id: signersId,
          order_sign: isOrdered,
          page_number: pageNumbers
        }, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        })
        if (data?.payload) {
          alert('document sent successfully')
          window.location.href = '/dokumen/diunggah'
        }
      } catch (err: any) {
        console.error(err.message)
      }
    }
  }

  return (
    <Homepage>
    <div className="card" style={{color: 'black'}}>
      <div className="card-content">
        <h4 className="card-title">Informasi</h4>
        <p className="info-text">
        Di halaman ini Anda dapat mengunggah satu atau lebih dokumen untuk ditandatangani oleh satu atau lebih penanda tangan. 
        Orang yang Anda minta untuk menandatangani dokumen akan mendapat notifikasi melalui e-mail. 
        Jika Anda hendak menandatangani suatu dokumen oleh Anda sendiri, gunakan halaman ini.
        </p>
      </div>
    </div>

    <div className="unggah">
      <h2>Unggah Dokumen</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />

      {/* Canvas untuk menampilkan PDF */}
      <div className="pdf-container text-black">
        <Stage width={pdfImage?.width || 500} height={pdfImage?.height || 633} className="pdf-stage text-black">
          <Layer >{pdfImage && <KonvaImage image={pdfImage} />}</Layer>
        </Stage>
      </div>
      <div className="pdf-navigation">
          <button
            onClick={() => {
              if (currentPage > 1) {
                setCurrentPage(currentPage - 1);
                renderPdf(pdfFile as File, currentPage - 1);
              }
            }}
            disabled={currentPage === 1}
          >
            ← Halaman Sebelumnya
          </button>

          {/* 🔄 Input untuk memilih halaman secara langsung */}
          <span>Halaman</span>
          <input
            type="number"
            value={currentPage}
            onChange={(e) => {
              let newPage = parseInt(e.target.value, 10) || 1;
              if (newPage < 1) newPage = 1;
              if (newPage > totalPages) newPage = totalPages;

              setCurrentPage(newPage);
              renderPdf(pdfFile as File, newPage);
            }}
            min="1"
            max={totalPages}
            style={{ width: "50px", textAlign: "center" }}
          />
          <span> dari {totalPages}</span>

          <button
            onClick={() => {
              if (currentPage < totalPages) {
                setCurrentPage(currentPage + 1);
                renderPdf(pdfFile as File, currentPage + 1);
              }
            }}
            disabled={currentPage === totalPages}
          >
            Halaman Selanjutnya →
          </button>
        </div>

      {/* Formulir untuk Daftar Penandatangan */}
      <h3>Daftar Penanda Tangan</h3>
      <table>
        <thead>
          <tr>
            <th>Penanda Tangan</th>
            <th>No. Halaman</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {signers.map((signer, index) => (
            <tr key={index}>
              <td>{signer.name}</td>
              <td>{signer.page}</td>
              <td>
                <button className="secondary" onClick={() => removeSigner(index)}>❌</button>
              </td>
            </tr>
          ))}
          <tr>
            <td>
              {/* <input
                type="text"
                placeholder="Cari nama mahasiswa atau pegawai..."
                value={newSigner.name}
                onChange={(e) => setNewSigner({ ...newSigner, name: e.target.value })}
              /> */}
              {/* <select name="" id="" defaultValue={''} onChange={e => setNewSigner({...newSigner, name: e.target.value})}>
                <option value={''} disabled>-- Select User --</option>
                {users.map((item: any, index: number) => {
                  return <option value={item.id} key={index}>
                    {item.username} [{item.email}]
                  </option>
                })}
              </select> */}
              <Select options={users.map((item) => { return { value: item.id, label: `${item.username} [${item.email}]` }; })} 
              // inputValue={""} 
              onChange={(e: any) => {
                setNewSigner({ ...newSigner, name: e.label, id: e.value})
                setSignersId(prevState => [...prevState, e.value])
              }}
              />
            </td>
            <td>
              <input
                type="number"
                defaultValue={newSigner.page}
                onChange={(e) => {
                  setNewSigner({ ...newSigner, page: parseInt(e.target.value) || 1 })
                }}
                min="1"
              />
            </td>
            <td>
              <button className="primary" onClick={addSigner}>➕</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div style={{height: 'fit-content', width: 'fit-content', padding: 0, display: 'flex', alignItems: 'center', gap: '5px'}}>
        <div style={{height: 'fit-content', width: 'fit-content', padding: 0}}>
          <input type="checkbox" name="order" id="order" onChange={() => setIsOrdered(!isOrdered)} />
        </div>
        <div style={{height: 'fit-content', width: 'fit-content', padding: 0}}>
          <label htmlFor="order">Requiring Sign Order</label>
        </div>
      </div>

      {/* <Link to="/dokumen/diunggah"></Link> */}
      <button className="primary" onClick={handleSubmit}>💾 Simpan</button>
    </div>
    </Homepage>
  );
};

export default Unggah;
