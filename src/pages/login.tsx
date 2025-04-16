import { useState } from "react";
// import { useNavigate } from "react-router-dom";
import "../assets/styles/login.css";
import axios from "axios";
import Cookies from "universal-cookie";
import { jwtDecode } from "jwt-decode";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (username === "admin" && password === "password") {
    //   alert("Login berhasil!");
    //   navigate("/"); // Redirect ke Home setelah login
    // } else {
    //   alert("Username atau password salah!");
    // }
    // navigate("/dashboard");
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
  };
  

  return (
    <div className="login-container">
      <h2>Login</h2>
      <p>Masuk untuk menandatangani dokumen</p>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        <div>
          Or <a href="/register">Register</a>
        </div>
      </form>
    </div>
  );
}

export default Login;
