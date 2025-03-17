import styles from "./navbar2.module.css";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  isSidebarOpen: boolean;
}

function Navbar2({ isSidebarOpen }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/"); 
  };
  return (
    <header
      className={styles.navbar2}
      style={{ left: isSidebarOpen ? "290px" : "70px", width: `calc(100% - ${isSidebarOpen ? "290px" : "70px"})` }}
    >
      <button className={styles.logoutBtn} onClick={handleLogout}>Sign Out</button>
    </header>
  );
}

export default Navbar2;
