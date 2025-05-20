import { ReactElement, useState } from "react";
import Homepage from "../../layouts/homepage";
import axios from "axios";
import Cookies from 'universal-cookie';


const VerifikasiDokumen = (): ReactElement => {

    const [result, setResult] = useState<any[]>([])

    const handleChange = async (e: any): Promise<void> => {
        const file = e.target.files[0]
        if (!file) return
        const cookies: Cookies = new Cookies()
        const token: string = cookies.get('bhf-e-sign-access-token') 
        try {
            const formData: FormData = new FormData()
            formData.append('file', file)
            const {data} = await axios.post(import.meta.env.VITE_API_HOST + `/api/document/verify`, formData, {
                headers: {"Authorization": `Bearer ${token}`}
            })
            if (data?.payload) setResult(data.payload)
        } catch (err: any) {
            console.error(err.message)
        }
    }

    return <Homepage>
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <h2>Unggah dokumen untuk verifikasi</h2>
            <div>
                <input type="file" accept="application/pdf" onChange={handleChange} />
            </div>
            {/* {result && <div style={{
                width: '400px',
                backgroundColor: '#555',
                textAlign: 'start',
                whiteSpace: 'break-spaces',
                borderRadius: '10px',
                padding: '5px 10px'
            }}>
                {result}
            </div>} */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
            }}>
                {result.map((item: any, index: number) => {
                    return <div key={index} style={{backgroundColor: 'white', color: 'black', padding: '10px 10px 5px 10px', borderRadius: '5px', border: '1px solid #ddd', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <div style={{textAlign: 'start', width: '100%', display: 'flex', alignItems: 'center', gap: '5px'}}>
                            <div style={{padding: '5px 10px',  textAlign: 'center', border: '1px solid #ddd', borderRadius: '5px'}}>{item.number}</div> 
                            <div style={{
                                backgroundColor: item.validity ? 'green' : 'red',
                                color: 'white',
                                width: 'calc(100% - 20px)',
                                textAlign: 'center',
                                padding: '5px 10px',
                                borderRadius: '5px',
                                fontWeight: 'bold'
                            }}>{item.validity ? 'Valid' : 'Tidak Valid'}</div>
                        </div>
                        <table style={{border: 'none', background: 'none'}}>
                            <tbody>
                                <tr><th style={{background: 'none', border: 'none', color: 'black'}}>Penanda tangan</th><td style={{border: 'none'}}>{item.signer}</td></tr>
                                <tr><th style={{background: 'none', border: 'none', color: 'black'}}>Serial number</th><td style={{border: 'none'}}>{item.serialNumber}</td></tr>
                                <tr><th style={{background: 'none', border: 'none', color: 'black'}}>Sertifikat oleh</th><td style={{border: 'none'}}>{item.certifiedBy}</td></tr>
                                <tr><th style={{background: 'none', border: 'none', color: 'black'}}>Tanggal tanda tangan</th><td style={{border: 'none'}}>{item.signedAt}</td></tr>
                            </tbody>
                        </table>
                    </div>
                })}
            </div>
        </div>
    </Homepage>
}

export default VerifikasiDokumen