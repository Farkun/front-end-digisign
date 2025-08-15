import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import styles from "./sidebar.module.css";

// 🔹 Tambahkan props untuk Sidebar
interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [showDokumenDropdown, setShowDokumenDropdown] = useState(false);
  const [showPengaturanDropdown, setShowPengaturanDropdown] = useState(false);

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      {/* Tombol Toggle Sidebar */}
      <button className={styles.hamburger} style={!isOpen ? {display: "flex", alignItems: 'center', justifyContent: 'center', width: '50px'} : {}} onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>

      <Link to={'/'} className={styles.logo} style={{color: 'white'}}>
        <img src="/eSign-logo-transparent.png" alt="logo" style={{width: isOpen ? '100px' : '20px'}} /> <br />
        {isOpen && "PolBo - eSign"}
      </Link>

      <nav style={{paddingBottom: '20px'}}>
        <ul>
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? styles.active : ""}>
              🏠 {isOpen && "Dashboard"}
            </NavLink>
          </li>
          <li>
            <NavLink to="/permintaan" className={({ isActive }) => isActive ? styles.active : ""}>
              📄 {isOpen && "Requests"}
            </NavLink>
          </li>
          <li>
            <NavLink to="/tandatangani" className={({ isActive }) => isActive ? styles.active : ""}>
              ✍️ {isOpen && "Sign by Self"}
            </NavLink>
          </li>

          {/* Dropdown Dokumen */}
          <li className={styles.dropdown}>
            <span onClick={() => {
              setShowDokumenDropdown(!showDokumenDropdown)
              setShowPengaturanDropdown(false)
              setIsOpen(true)
            }}>
              📂 {isOpen && 'Documents ▼'}
            </span>
            {isOpen && showDokumenDropdown && (
              <ul className={styles.dropdownMenu}>
                <li><NavLink to="/dokumen/unggah">Upload</NavLink></li>
                <li><NavLink to="/dokumen/diunggah">Uploaded</NavLink></li>
                <li><NavLink to="/dokumen/tandatangani">Signed</NavLink></li>
              </ul>
            )}
          </li>
          <li>
            <NavLink to="/verifikasi-dokumen" className={({ isActive }) => isActive ? styles.active : ""}>
              📋 {isOpen && "Document Verification"}
            </NavLink>
          </li>
          {/* Dropdown Pengaturan */}
          <li className={styles.dropdown}>
            <span onClick={() => {
              setShowPengaturanDropdown(!showPengaturanDropdown)
              setShowDokumenDropdown(false)
              setIsOpen(true)
            }}>
              ⚙️ {isOpen && 'Settings ▼'}
            </span>
            {isOpen && showPengaturanDropdown && (
              <ul className={styles.dropdownMenu}>
                <li><NavLink to="/pengaturan/sertifikat">Digital Certificates</NavLink></li>
                <li><NavLink to="/pengaturan/tanda-tangan">Signature Image</NavLink></li>
                <li><NavLink to="/pengaturan/profile">Profile</NavLink></li>
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
