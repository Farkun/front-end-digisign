import Homepage from "../layouts/homepage";
import "../assets/styles/permintaan.css";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "universal-cookie";
import DatetimeFormatter from "../utils/DatetimeFormatter";
import { jwtDecode } from "jwt-decode";
import { saveAs } from "file-saver";

function Permintaan() {

    const [documents, setDocuments] = useState<any[]>([])

    const getDocuments = async (): Promise<void> => {
        const cookies: Cookies = new Cookies()
        const token: string = cookies.get('accessToken')
        
        try {
            const {data}: any = await axios.get(import.meta.env.VITE_API_HOST+'/api/document/sign', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            if (data?.payload) setDocuments(data.payload)
        } catch (err: any) {
            console.error(err.message)
        }
    }

    useEffect(() => {
        getDocuments()
    }, [])

    const approveDocument = async (id: number): Promise<void> => {
        const cookies: Cookies = new Cookies
        const token: string = cookies.get('accessToken')
        try {
            const {data} = await axios.put(import.meta.env.VITE_API_HOST+`/api/document/${id}/approve`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            if (data) window.location.reload()
        } catch (err: any) {
            console.error(err.message)
        }
    } 

    const denyDocument = async (id: number): Promise<void> => {
        const cookies: Cookies = new Cookies
        const token: string = cookies.get('accessToken')
        try {
            const {data} = await axios.put(import.meta.env.VITE_API_HOST+`/api/document/${id}/deny`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            if (data) window.location.reload()
        } catch (err: any) {
            console.error(err.message)
        }
    } 

    const downloadDocument = async (url: string, filename: string): Promise<void> => {
        // const cookies: Cookies = new Cookies
        // const token: string = cookies.get('accessToken')
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
                        {documents.map((row, index) => {
                            const isApproved:   boolean = row.documentApprovals[0].approved
                            const isDenied:     boolean = row.documentApprovals[0].denied
                            const isEnableSign: boolean = row.documentApprovals[0].enableSign
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
                                <td><button className="detailBtn" onClick={()=>window.open(row.url, '_blank')}>🔍 Lihat</button></td>
                                <td>
                                    {
                                        (isApproved && isDenied) || (!isApproved && !isDenied) ? <div>
                                            <button type="button" className="detailBtn" onClick={()=>approveDocument(row.id)}>✔️ Setujui</button>
                                            <button type="button" className="deleteBtn" onClick={()=>denyDocument(row.id)}>❌ Tolak</button>
                                        </div>
                                        : <div>
                                            {signedDocument ? <button type="button" onClick={() => {
                                                // window.open(signedDocument, '_blank')
                                                downloadDocument(signedDocument, `[SIGNED] ${row.title}`)
                                            }}>📥 Unduh</button>
                                            : 
                                            <button 
                                                type="button" 
                                                onClick={() => { window.location.href = !isEnableSign || signedDocument ? '' 
                                                    : `/tandatangani/${row.id}?page=${pageNumber}` 
                                                }} 
                                                disabled={ 
                                                    !isEnableSign || signedDocument != null
                                                } 
                                                style={ !isEnableSign || signedDocument ? {backgroundColor: 'gray'} : {}}
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
