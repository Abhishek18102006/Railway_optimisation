// src/components/Sidebar.jsx (UPDATED)

export default function Sidebar({ setPage, currentPage }) {
  return (
    <div className="sidebar">
      <div className="sidebar-title">🚄 RailFlow Optimizer</div>

      <Nav 
        label="Dashboard" 
        icon="📊"
        onClick={() => setPage("dashboard")}
        active={currentPage === "dashboard"}
      />
      
      <Nav 
        label="Conflict Resolution" 
        icon="🚦"
        onClick={() => setPage("conflicts")}
        active={currentPage === "conflicts"}
      />

      {/* ⭐ NEW: History Navigation */}
      <Nav 
        label="History" 
        icon="📜"
        onClick={() => setPage("history")}
        active={currentPage === "history"}
      />

      {/* ⭐ NEW: Performance Navigation */}
      <Nav 
        label="Performance" 
        icon="📈"
        onClick={() => setPage("performance")}
        active={currentPage === "performance"}
      />
    </div>
  );
}

function Nav({ label, icon, onClick, active }) {
  return (
    <div 
      className={`sidebar-item ${active ? 'active' : ''}`}
      onClick={onClick}
      style={{
        background: active ? "#005a96" : "transparent",
        fontWeight: active ? "600" : "400",
        display: "flex",
        alignItems: "center",
        gap: "10px"
      }}
    >
      <span style={{ fontSize: "18px" }}>{icon}</span>
      <span>{label}</span>
    </div>
  );
}