export default function Sidebar({ setPage }) {
  return (
    <div className="sidebar">
      <div className="sidebar-title">RailFlow Optimizer</div>

      <Nav label="Dashboard" onClick={() => setPage("dashboard")} />
      <Nav label="Real-Time Scheduling" onClick={() => setPage("realtime")} />
      <Nav label="Conflict Resolution" onClick={() => setPage("conflicts")} />
      <Nav label="What-If Scenario" onClick={() => setPage("whatif")} />
      <Nav label="Performance" onClick={() => setPage("performance")} />
    </div>
  );
}

function Nav({ label, onClick }) {
  return (
    <div className="sidebar-item" onClick={onClick}>
      {label}
    </div>
  );
}
