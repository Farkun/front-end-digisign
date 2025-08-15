import { useState } from "react";
import Sidebar from "../components/sidebar";
import Navbar2 from "../components/navbar2";
import "../assets/styles/homepage.css";

function Homepage({ children }: { children?: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className={`homepage-container ${isSidebarOpen ? "open" : "closed"}`}>
      <div>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      </div>
      <main className={`main-content ${isSidebarOpen ? "open" : "closed"}`}>
        <Navbar2 isSidebarOpen={isSidebarOpen} />
        <section className="content">{children}</section>
      </main>
    </div>
  );
}

export default Homepage;
