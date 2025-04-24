import { useState } from "react";
// import { useNavigate } from "react-router-dom";
import "../../assets/styles/login.css";
import axios from "axios";
import Cookies from "universal-cookie";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  // const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return
    setLoading(true)
    try {
      const cookies = new Cookies();
      const { data } = await axios.post(import.meta.env.VITE_API_HOST + "/api/auth/login", {
        username,
        password
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      })
      if (!data) {
        alert('Username, Email, atau Password Salah')
        return
      }
      if (!data.token) {
        alert('Terlalu banyak percobaan, coba lagi dalam 24 jam')
        return
      }
      const expiration: any = jwtDecode(data.token).exp
      let maxAge = (expiration * 1000 - Date.now()) / (30 * 24)
      maxAge = parseInt(maxAge.toFixed())
      
      cookies.set('accessToken', data.token, {
        path: '/',
        maxAge: maxAge
      })
      if (data.token) window.location.href = '/dashboard'
    } catch (err: any) {
      alert('Username, Email, atau Password Salah')
      console.error(err.message)
    }
    setLoading(false)
  };
  

  return (
    <div className="login-container">
      <h2>Masuk</h2>
      <p>Masuk untuk menandatangani dokumen</p>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username atau Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          readOnly={loading}
        />
        <input
          type="password"
          placeholder="Kata Sandi"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          readOnly={loading}
        />
        <button type="submit" disabled={loading} style={loading ? {backgroundColor: 'gray'} : {}}>Masuk</button>
        <div>Tidak bisa masuk? <Link to={'/forgot-password'}>lupa kata sandi</Link></div><br />
        <div>
          atau <a href="/register">registrasi</a>
        </div>
      </form>
    </div>
  );
}

export default Login;
