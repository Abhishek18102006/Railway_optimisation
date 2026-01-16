// src/components/Layout.jsx (UPDATED)
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children, setPage, currentPage }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar setPage={setPage} currentPage={currentPage} />
      <div style={{ flex: 1 }}>
        <Header />
        <div style={{ padding: "0" }}>
          {children}
        </div>
      </div>
    </div>
  );
}