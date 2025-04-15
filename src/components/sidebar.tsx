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
      <button className={styles.hamburger} onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>

      <Link to={'/'} className={styles.logo} style={{color: 'white'}}>{isOpen ? "IPB DiSign" : "ID"}</Link>

      <nav>
        <ul>
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? styles.active : ""}>
              🏠 {isOpen && "Beranda"}
            </NavLink>
          </li>
          <li>
            <NavLink to="/permintaan" className={({ isActive }) => isActive ? styles.active : ""}>
              📄 {isOpen && "Permintaan"}
            </NavLink>
          </li>
          <li>
            <NavLink to="/tandatangani" className={({ isActive }) => isActive ? styles.active : ""}>
              ✍️ {isOpen && "Tanda Tangani"}
            </NavLink>
          </li>

          {/* Dropdown Dokumen */}
          {isOpen && (
            <li className={styles.dropdown}>
              <span onClick={() => setShowDokumenDropdown(!showDokumenDropdown)}>
                📂 Dokumen ▼
              </span>
              {showDokumenDropdown && (
                <ul className={styles.dropdownMenu}>
                  <li><NavLink to="/dokumen/unggah">Unggah</NavLink></li>
                  <li><NavLink to="/dokumen/diunggah">Diunggah</NavLink></li>
                  <li><NavLink to="/dokumen/tandatangani">Ditandatangani</NavLink></li>
                </ul>
              )}
            </li>
          )}

          {/* Dropdown Pengaturan */}
          {isOpen && (
            <li className={styles.dropdown}>
              <span onClick={() => setShowPengaturanDropdown(!showPengaturanDropdown)}>
                ⚙️ Pengaturan ▼
              </span>
              {showPengaturanDropdown && (
                <ul className={styles.dropdownMenu}>
                  <li><NavLink to="/pengaturan/sertifikat">Sertifikat Digital</NavLink></li>
                  <li><NavLink to="/pengaturan/tanda-tangan">Gambar Tanda Tangan</NavLink></li>
                </ul>
              )}
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
