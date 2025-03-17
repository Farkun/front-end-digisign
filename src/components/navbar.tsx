import { Link } from "react-router-dom";
import styles from "./navbar.module.css"; // Pakai CSS Module

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <ul>
        <li><Link to="/">🏠 Home</Link></li>
        <li><Link to="/about">ℹ️ About</Link></li>
        <li><Link to="/login">🔑 Login</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
