import axios from "axios";
import { ReactElement, useState } from "react";
import Cookies from "universal-cookie";


const Unverified = (): ReactElement => {

    const [loading, setLoading] = useState<boolean>(false)

    const handleLogout = (): void => {
        if (loading) return
        const cookies = new Cookies()
        cookies.remove('accessToken')
        window.location.href = '/login'
    };

    const handleResendEmail = async (): Promise<void> => {
        if (loading) return
        setLoading(true)
        const cookies = new Cookies()
        const token = cookies.get('accessToken')
        try {
            const {data} = await axios.get(import.meta.env.VITE_API_HOST + '/api/auth/verification/resend', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (data) alert('Email verifikasi berhasil dikirim ulang')
        } catch (err) {
            console.error(err)
        }
        setLoading(false)
    }

    if (loading) return <div>Loading ...</div>

    return <div>
        <div>
            <button style={{backgroundColor: '#aa0000', width: 'fit-content'}} onClick={handleLogout}>Logout</button>
            <h1 style={{color: 'white'}}>Your Account is not verified.</h1>
            <div>Check your email to verify or <button className="btn-link" onClick={handleResendEmail}>resend email</button></div>
        </div>
    </div>
}

export default Unverified