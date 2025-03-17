import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // if (username === "admin" && password === "password") {
    //   alert("Login berhasil!");
    //   navigate("/"); // Redirect ke Home setelah login
    // } else {
    //   alert("Username atau password salah!");
    // }
    navigate("/dashboard");
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
      </form>
    </div>
  );
}

export default Login;
