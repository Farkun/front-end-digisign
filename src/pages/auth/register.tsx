import axios from "axios"
import { jwtDecode } from "jwt-decode"
import { useState } from "react"
import Cookies from "universal-cookie"


const Register = () => {

    const [formData, setFormData] = useState<any>({})
    const [loading, setLoading] = useState<boolean>(false)

    const handleChange = (e: any) => {
        const {name, value} = e.target
        setFormData({...formData, [name]: value})
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        if (loading) return
        setLoading(true)
        if (formData.password != formData.confirm_password) alert('please confirm your password')
        else {
            try {
                const {confirm_password, ...registerData} = formData
                const {data}: any = await axios.post(import.meta.env.VITE_API_HOST + '/api/auth/register', registerData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                // console.log(data);
                // if (data && data.token) {
                    
                    const cookies = new Cookies();
                    const expiration: any = jwtDecode(data.token).exp
                    let maxAge = (expiration * 1000 - Date.now()) / (30 * 24)
                    maxAge = parseInt(maxAge.toFixed())
                    await cookies.set('accessToken', data.token, {
                        path: '/',
                        maxAge: maxAge
                    })
                    window.location.href = '/unverified'
                // }
            } catch (err: any) {
                console.error(err.message)
            }
        }
        setLoading(false)
    }

    return <div className="login-container">
        <h2>Registrasi</h2>
        <form onSubmit={handleSubmit}>
            <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
            readOnly={loading}
            />
            <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            readOnly={loading}
            />
            <input
            type="password"
            name="password"
            placeholder="Kata Sandi"
            onChange={handleChange}
            required
            readOnly={loading}
            />
            <input
            type="password"
            name="confirm_password"
            placeholder="Konfirmasi kata Sandi"
            onChange={handleChange}
            required
            readOnly={loading}
            />
            <button type="submit" disabled={loading} style={loading ? {backgroundColor: 'gray'} : {}}>Registrasi</button>
            <div>
                Sudah memiliki akun? <a href="/login">Masuk</a>
            </div>
        </form>
    </div>
}

export default Register