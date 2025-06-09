import Homepage from "../../layouts/homepage";
import "../../assets/styles/permintaan.css";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "universal-cookie";
import DatetimeFormatter from "../../utils/DatetimeFormatter";
import { saveAs } from "file-saver";
import Crypt from "../../utils/Crypt";

function Permintaan() {

    const [documents, setDocuments] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [dataLoading, setDataLoading] = useState<boolean>(true)

    const getDocuments = async (): Promise<void> => {
        const cookies: Cookies = new Cookies()
        const token: string = cookies.get("bhf-e-sign-access-token")
        
        try {
            const {data}: any = await axios.get(import.meta.env.VITE_API_HOST+'/api/document/requested-list', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            if (data?.payload) setDocuments(data.payload)
        } catch (err: any) {
            console.error(err.message)
        }
        setDataLoading(false)
    }

    useEffect(() => {
        getDocuments()
    }, [])

    const approveDocument = async (id: string): Promise<void> => {
        if (loading) return
        setLoading(true)
        const cookies: Cookies = new Cookies
        const token: string = cookies.get("bhf-e-sign-access-token")
        if (confirm('Apakah Anda yakin ingin menyetujui penanda tanganan dokumen ini?')) try {
            const {data} = await axios.put(import.meta.env.VITE_API_HOST + `/api/document/approve?document=${id}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            })
            if (data) window.location.reload()
        } catch (err: any) {
            console.error(err.message)
        }
        setLoading(false)
    } 

    const denyDocument = async (id: string): Promise<void> => {
        if (loading) return
        setLoading(true)
        const cookies: Cookies = new Cookies
        const token: string = cookies.get("bhf-e-sign-access-token")
        if (confirm('Apakah Anda yakin ingin menolak penanda tanganan dokumen ini?')) try {
            const {data} = await axios.put(import.meta.env.VITE_API_HOST + `/api/document/deny?document=${id}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            })
            if (data) window.location.reload()
        } catch (err: any) {
            console.error(err.message)
        }
        setLoading(false)
    } 

    const downloadDocument = async (url: string, filename: string): Promise<void> => {
        if (loading) return
        setLoading(true)
        // const cookies: Cookies = new Cookies
        // const token: string = cookies.get("bhf-e-sign-access-token")
        try {
            const {data}: any = await axios.get(url, {responseType: 'arraybuffer'})
            if (data) {
                const blob: Blob = new Blob([data], {type: 'application/pdf'})
                const file: File = new File([blob], filename, {type: 'application.pdf'})
                saveAs(file)
            }
        } catch (err: any) {
            console.error(err.message)
        }
        setLoading(false)
    }

    return (
        <Homepage>
            <div className="permintaanContainer"  style={{color: 'black'}}>
                <h2>Rekap Permintaan Data</h2>
                <table className="permintaanTable">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Judul</th>
                            <th>Upload</th>
                            <th>Persetujuan</th>
                            <th>Detail</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Contoh data, nanti bisa diganti dengan data dinamis */}
                        {dataLoading ? 
                        <tr>
                            <td colSpan={6}>Loading ...</td>
                        </tr>
                        : documents.map((row, index) => {
                            const isApproved:   boolean = row.documentApprovals[0].approved
                            const isDenied:     boolean = row.documentApprovals[0].denied
                            const signedDocument: string | null = row.documentApprovals[0].signedDocument
                            const pageNumber:   number = row.documentApprovals[0].pageNumber
                            
                            return <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{row.title}</td>
                                <td>{new DatetimeFormatter().format(row.createdAt)}<br /> <strong>{row.applicant?.username}</strong></td>
                                <td>
                                    {
                                        (isApproved && isDenied) || (!isApproved && !isDenied) 
                                            ? <div>⏳ <span style={{ color: "red" }}>Belum Menanggapi</span></div> 
                                            : isApproved 
                                                ? <div>✔️ Disetujui</div>
                                                : isDenied && <div>❌ Ditolak</div>
                                    }
                                </td>
                                <td><button className={loading ? 'revoke-btn' : "detailBtn"} onClick={()=>window.open(row.url.replace(`${import.meta.env.VITE_API_HOST}/api/storage/document`, `${import.meta.env.VITE_BASE_URL}/dokumen/detail`), '_blank')} disabled={loading}>🔍 Lihat</button></td>
                                <td>
                                    {
                                        (isApproved && isDenied) || (!isApproved && !isDenied) ? <div>
                                            <button type="button" className={loading ? 'revoke-btn' : "detailBtn"} onClick={()=>approveDocument(Crypt.encryptString(`${row.id}`))} disabled={loading}>✔️ Setujui</button>
                                            <button type="button" className={loading ? 'revoke-btn' : "deleteBtn"} onClick={()=>denyDocument(Crypt.encryptString(`${row.id}`))} disabled={loading}>❌ Tolak</button>
                                        </div>
                                        : <div>
                                            {signedDocument ? <button type="button" onClick={() => {
                                                    // window.open(signedDocument, '_blank')
                                                    downloadDocument(signedDocument, `[SIGNED] ${row.title}`)
                                                }}>📥 Unduh</button>
                                                : 
                                                !isDenied && <button 
                                                    type="button" 
                                                    onClick={() => { window.location.href = signedDocument ? '' 
                                                        : `/tandatangani/${Crypt.encryptString(`${row.id}`)}?page=${pageNumber}` 
                                                    }} 
                                                    disabled={ 
                                                        loading || signedDocument != null
                                                    } 
                                                    style={ loading || signedDocument ? {backgroundColor: 'gray'} : {}}
                                                >Tanda Tangani</button>
                                            }
                                        </div>
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

export default Permintaan;
