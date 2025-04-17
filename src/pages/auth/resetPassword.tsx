import axios from "axios";
import { ReactElement, useEffect, useState } from "react";
import { useParams } from "react-router-dom";


const ResetPassword = (): ReactElement => {

    const {token} = useParams()
    const [formData, setFormData] = useState<{password: string, confirmPassword: string}>({password: '', confirmPassword: ''})
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)

    const validateToken = async (): Promise<void> => {
        try {
            const {data} = await axios.post(import.meta.env.VITE_API_HOST + `/api/auth/validate-reset-password-token?token=${token}`)
            if (!data) {
                window.close()
                window.location.href = `/login`
            }
        } catch (err: any) {
            console.error(err.message)
        }
    }

    useEffect(() => {
        validateToken()
    }, [])

    const handleSubmit = async (e: any): Promise<void> => {
        e.preventDefault()
        if (formData.password != formData.confirmPassword) {
            alert('Konfirmasi Kata Sandi Salah')
            return
        } 
        try {
            const {data} = await axios.post(import.meta.env.VITE_API_HOST + `/api/auth/reset-password/${token}?password=${formData.password}`)
            if (data) alert("Kata Sandi Berhasil Diubah")
            window.location.href = '/login'
        } catch (err: any) {
            console.error(err.message)
        }
    }

    return <div className="login-container">
    <h2>Buat Ulang Kata Sandi</h2>
    {/* <p>Masukkan email Anda yang teregistrasi</p> */}
    <form onSubmit={handleSubmit}>
        <div style={{display: "flex", alignItems: 'center', gap: '10px'}}>
            <input
                type={showPassword ? 'text' : "password"}
                placeholder="Kata Sandi Baru"
                value={formData.password}
                onChange={(e) => setFormData(prevState => ({...prevState, password: e.target.value}))}
                required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{margin: 0, width: 'fit-content', height: 'fit-content'}}>👁️</button>
        </div>
        <div style={{display: "flex", alignItems: 'center', gap: '10px'}}>
            <input
                type={showConfirmPassword ? 'text' : "password"}
                placeholder="Konfirmasi Kata Sandi Baru"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prevState => ({...prevState, confirmPassword: e.target.value}))}
                style={{width: "100%"}}
                required
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{margin: 0, width: 'fit-content', height: 'fit-content'}}>👁️</button>
        </div>
        <button type="submit">Ubah</button>
        {/* <div>Tidak bisa masuk? <Link to={'/forgot-password'}>lupa kata sandi</Link></div><br /> */}
    </form>
</div>
}

export default ResetPassword