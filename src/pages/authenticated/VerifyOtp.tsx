import axios from "axios";
import { ReactElement, useState } from "react";
import Cookies from "universal-cookie";


const VerifyOtp = (): ReactElement => {

    const [loading, setLoading] = useState<boolean>(false)
    const [code, setCode] = useState<string>('')
    const [blockCode] = useState<string[]>(['', '', '', '', '', ''])
    const [inputFocused, setInputFocused] = useState<boolean>(true)
    
    const handleLogout = (): void => {
        if (loading) return
        const cookies: Cookies = new Cookies()
        cookies.remove('bhf-e-sign-access-token')
        window.location.href = '/'
    };
    
    const handleResendEmail = async (): Promise<void> => {
        if (loading) return
        setLoading(true)
        const cookies: Cookies = new Cookies()
        const token: string = cookies.get("bhf-e-sign-access-token")
        try {
            const {data} = await axios.get(import.meta.env.VITE_API_HOST + '/api/auth/verification/resend', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (data) alert('Email verifikasi berhasil dikirim ulang')
        } catch (err) {
            // console.error(err)
        }
        setLoading(false)
    }

    const handleSubmit = async (e: any): Promise<void> => {
        e.preventDefault()
        const cookies: Cookies = new Cookies()
        const token: string = cookies.get("bhf-e-sign-access-token")
        const formData: FormData = new FormData()
        formData.append('otp', code)
        try {
            const {data} = await axios.post(import.meta.env.VITE_API_HOST+`/api/auth/verification-with-otp`, formData, {headers: {"Authorization": `Bearer ${token}`}})
            if (data) window.location.href = '/dashboard'
        } catch (err: any) {
            // console.error(err.message)
        }
    }

    if (loading) return <div>Loading ...</div>

    return <div>
        <div>
            <button style={{backgroundColor: '#aa0000', width: 'fit-content'}} onClick={handleLogout}>Logout</button>
            <h1 style={{color: window.matchMedia("(prefers-color-scheme: dark)").matches ? 'white' : 'black'}}>Enter Verification Code</h1>
            <div>
                <label htmlFor="inputCode" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
                    {
                        blockCode.map((_e, index) => {
                            return <div key={index} style={{
                                border: `2px solid ${index == code.length && inputFocused ? '#0a0' : ''}`,
                                width: '30px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '20px'
                            }}>{code[index]}</div>
                        })
                    }
                </label>
                <form onSubmit={handleSubmit}>
                    <div style={{width: 0, height: 0, opacity: 0}}>
                        <input type="number" name="" value={code} id="inputCode" onChange={(e: any) => {
                            const strVal: string = `${e.target.value}`
                            if (strVal.length <= 6) setCode(strVal)
                        }} autoFocus onFocus={() => setInputFocused(true)} onBlur={() => setInputFocused(false)}/>
                    </div>
                    <button>Verify</button>
                </form>
            </div>
            <div>Check your email to get verification code or <br /><button className="btn-link" onClick={handleResendEmail}>resend code</button> if you haven't receive the email</div>
        </div>
    </div>
}

export default VerifyOtp