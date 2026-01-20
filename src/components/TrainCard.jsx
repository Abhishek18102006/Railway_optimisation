// src/components/TrainCard.jsx (FIXED - Black Font)
export default function TrainCard({ train, index, onClick }) {
  // Determine card styling based on status
  const getStatusStyle = () => {
    if (train.status === "RESOLVED") {
      return {
        borderLeftColor: "#16a34a",
        background: "#f0fdf4"
      };
    } else if (train.conflict || train.status === "IN_CONFLICT" || train.status === "MANUAL_REVIEW") {
      return {
        borderLeftColor: "#dc2626",
        background: "#fef2f2"
      };
    } else if (train.status === "DELAYED") {
      return {
        borderLeftColor: "#d97706",
        background: "#fffbeb"
      };
    } else {
      return {
        borderLeftColor: "#94a3b8",
        background: "#f8fafc"
      };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <div 
      className="train-card" 
      onClick={onClick}
      style={{
        ...statusStyle,
        borderLeft: `4px solid ${statusStyle.borderLeftColor}`,
        color: "#0f172a" // BLACK FONT - FIXED
      }}
    >
      <div className="train-rank">{index}</div>

      <div className="train-main">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <strong style={{ color: "#020617" }}>{train.train_id}</strong>
          <span style={{ color: "#0f172a" }}>{train.train_name}</span>
          
          {/* Resolution Badge */}
          {train.status === "RESOLVED" && (
            <span style={{
              background: "#dcfce7",
              color: "#166534",
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "10px",
              fontWeight: "600"
            }}>
              ✓ RESOLVED
            </span>
          )}
          
          {/* Conflict Badge */}
          {(train.conflict || train.status === "IN_CONFLICT") && (
            <span style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "10px",
              fontWeight: "600"
            }}>
              ⚠ CONFLICT
            </span>
          )}
        </div>
        
        <div className="route" style={{ color: "#475569" }}>
          {train.source} → {train.destination}
        </div>
        <div className="meta" style={{ color: "#64748b" }}>
          Arrival: {train.arrival_time} |
          Priority: {train.priority} |
          Speed: {train.max_speed} km/h
        </div>
        
        {/* Resolution Info */}
        {train.resolution_applied && (
          <div style={{ 
            fontSize: "11px", 
            color: "#16a34a", 
            marginTop: "4px",
            fontWeight: "500"
          }}>
            🤖 {train.resolution_applied} applied at {train.resolution_time}
          </div>
        )}
        
        {/* Conflict Reason */}
        {train.conflict_reason && train.status !== "RESOLVED" && (
          <div style={{ 
            fontSize: "11px", 
            color: "#dc2626", 
            marginTop: "4px"
          }}>
            {train.conflict_reason}
          </div>
        )}
      </div>

      <div className="train-status">
        {train.status === "RESOLVED" ? (
          <span className="ontime">✓ RESOLVED</span>
        ) : train.delay > 0 ? (
          <span className="delayed">+{train.delay} min</span>
        ) : (
          <span className="ontime">ON TIME</span>
        )}
      </div>
    </div>
  );
}