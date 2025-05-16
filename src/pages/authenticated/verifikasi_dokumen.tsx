import { ReactElement, useState } from "react";
import Homepage from "../../layouts/homepage";
import axios from "axios";
import Cookies from 'universal-cookie';


const VerifikasiDokumen = (): ReactElement => {

    const [result, setResult] = useState<string | null>(null)

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
            {result && <div style={{
                width: '400px',
                backgroundColor: '#555',
                textAlign: 'start',
                whiteSpace: 'break-spaces',
                borderRadius: '10px',
                padding: '5px 10px'
            }}>
                {result}
            </div>}
        </div>
    </Homepage>
}

export default VerifikasiDokumen