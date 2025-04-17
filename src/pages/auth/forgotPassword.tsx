import axios from "axios";
import { ReactElement, useState } from "react";


const ForgotPassword = (): ReactElement => {

    const [email, setEmail] = useState<string>('')

    const handleSubmit = async (e: any): Promise<void> => {
        e.preventDefault()
        try {
            const {data} = await axios.post(import.meta.env.VITE_API_HOST + `/api/auth/forgot-password?email=${email}`)
            if (data) alert('email pemulihan telah terkirim')
            window.location.href = '/login'
        } catch (err: any) {
            console.error(err.message)
        }
    }

    return <div className="login-container">
        <h2>Lupa Kata Sandi</h2>
        <p>Masukkan email Anda yang teregistrasi</p>
        <form onSubmit={handleSubmit}>
            <input
                type="email"
                placeholder="contoh@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <button type="submit">Kirim</button>
            {/* <div>Tidak bisa masuk? <Link to={'/forgot-password'}>lupa kata sandi</Link></div><br /> */}
        </form>
    </div>
}

export default ForgotPassword