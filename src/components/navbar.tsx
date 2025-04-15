import { Link, Outlet } from "react-router-dom";
import styles from "./navbar.module.css"; // Pakai CSS Module
import { ReactElement } from "react";

const Navbar = ({isAuthenticated}: {isAuthenticated: boolean}): ReactElement => {
  return (
    <div>
      <nav className={styles.navbar}>
        <ul>
          <li><Link to="/">🏠 Home</Link></li>
          <li><Link to="/about">ℹ️ About</Link></li>
          {!isAuthenticated ?
            <li><Link to="/login">🔑 Login</Link></li>
            : <li><Link to="/dashboard">🖥️ Dashboard</Link></li>
          }
        </ul>
      </nav>
      <Outlet />
    </div>
  );
};

export default Navbar;
