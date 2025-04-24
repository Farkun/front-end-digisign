import axios from "axios";
import { ReactElement, useEffect, useState } from "react";
import { useParams } from "react-router-dom";


const ResetPassword = (): ReactElement => {

    const {token} = useParams()
    const [formData, setFormData] = useState<{password: string, confirmPassword: string}>({password: '', confirmPassword: ''})
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(true)
    const [isTokenValid, setIsTokenValid] = useState<boolean>(false)

    const validateToken = async (): Promise<void> => {
        try {
            const {data} = await axios.post(import.meta.env.VITE_API_HOST + `/api/auth/validate-reset-password-token?token=${token}`)
            if (!data) {
                window.close()
                window.location.href = `/login`
            }
            setLoading(false)
            setIsTokenValid(true)
        } catch (err: any) {
            console.error(err.message)
        }
    }

    useEffect(() => {
        validateToken()
    }, [])

    const handleSubmit = async (e: any): Promise<void> => {
        e.preventDefault()
        if (loading) return
        setLoading(true)
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
        setLoading(false)
    }

    if (!isTokenValid) return <div>Invalid Token</div>

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
                readOnly={loading}
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
                readOnly={loading}
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{margin: 0, width: 'fit-content', height: 'fit-content'}}>👁️</button>
        </div>
        <button type="submit" disabled={loading} style={loading ? {backgroundColor: 'gray'} : {}}>Ubah</button>
        {/* <div>Tidak bisa masuk? <Link to={'/forgot-password'}>lupa kata sandi</Link></div><br /> */}
    </form>
</div>
}

export default ResetPassword