import Cookies from "universal-cookie";
import styles from "./navbar2.module.css";
import { useState } from "react";

interface NavbarProps {
  isSidebarOpen: boolean;
}

function Navbar2({ isSidebarOpen }: NavbarProps) {

  const handleLogout = () => {
    // localStorage.removeItem('accessToken')
    const cookies = new Cookies()
    cookies.remove('accessToken')
    window.location.href = '/login'
  };

  return (
    <header
      className={styles.navbar2}
      style={{ left: isSidebarOpen ? "290px" : "70px", width: `calc(100% - ${isSidebarOpen ? "290px" : "70px"})` }}
    >
      <button className={styles.logoutBtn} onClick={handleLogout}>Keluar</button>
    </header>
  );
}

export default Navbar2;
