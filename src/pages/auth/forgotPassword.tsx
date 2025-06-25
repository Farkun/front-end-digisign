import axios from "axios";
import { ReactElement, useState } from "react";


const ForgotPassword = (): ReactElement => {

    const [email, setEmail] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    const handleSubmit = async (e: any): Promise<void> => {
        e.preventDefault()
        if (loading) return
        setLoading(true)
        try {
            const {data} = await axios.post(import.meta.env.VITE_API_HOST + `/api/auth/forgot-password?email=${email}`)
            if (data) {
                alert('recovery email has sent')
                window.location.href = '/'
            } else alert('email not registered')
        } catch (err: any) {
            // console.error(err.message)
        }
        setLoading(false)
    }

    return <div className="login-container">
        <h2>Forgot Password</h2>
        <p>Enter your email address</p>
        <form onSubmit={handleSubmit}>
            <input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                readOnly={loading}
            />
            <button type="submit" style={loading ? {backgroundColor: 'gray'} : {}} disabled={loading}>Send</button>
            {/* <div>Tidak bisa masuk? <Link to={'/forgot-password'}>lupa kata sandi</Link></div><br /> */}
        </form>
    </div>
}

export default ForgotPassword