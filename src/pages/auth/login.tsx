import { useState } from "react";
import "../../assets/styles/login.css";
import axios from "axios";
import Cookies from "universal-cookie";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

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
        alert('Username, Email, or Password incorrect')
        return
      }
      if (!data.token) {
        alert('Too many attempt, try again in 24 hours')
        return
      }
      const expiration: any = jwtDecode(data.token).exp
      let maxAge = (expiration * 1000 - Date.now()) / (30 * 24)
      maxAge = parseInt(maxAge.toFixed())
      
      cookies.set('bhf-e-sign-access-token', data.token, {
        path: '/',
        maxAge: maxAge
      })
      if (data.token) window.location.href = '/dashboard'
    } catch (err: any) {
      alert('Username, Email, or Password incorrect')
      // console.error(err.message)
    }
    setLoading(false)
  };
  

  return (
    <div className="login-container">
      <h2>Login</h2>
      <p>Login to sign document</p>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username or Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          readOnly={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          readOnly={loading}
        />
        <button type="submit" disabled={loading} style={loading ? {backgroundColor: 'gray'} : {}}>Login</button>
        <div>Can't login? <Link to={'/forgot-password'}>forgot password</Link></div><br />
        <div>
          or <a href="/register">register</a>
        </div>
      </form>
    </div>
  );
}

export default Login;
