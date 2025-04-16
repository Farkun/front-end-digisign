import axios from "axios";
import Cookies from "universal-cookie";


const Unverified = () => {

    const handleLogout = () => {
        const cookies = new Cookies()
        cookies.remove('accessToken')
        window.location.href = '/login'
    };

    const handleResendEmail = async () => {
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
    }

    return <div>
        <div>
            <button style={{backgroundColor: '#aa0000', width: 'fit-content'}} onClick={handleLogout}>Logout</button>
            <h1 style={{color: 'white'}}>Your Account is not verified.</h1>
            <div>Check your email to verify or <button className="btn-link" onClick={handleResendEmail}>resend email</button></div>
        </div>
    </div>
}

export default Unverified