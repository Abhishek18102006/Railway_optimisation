// src/pages/HistoryPage.jsx
import { useState } from "react";

export default function HistoryPage({ history }) {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Apply filters
  let filteredHistory = history;
  
  if (filter !== "all") {
    filteredHistory = filteredHistory.filter(h => h.status === filter);
  }
  
  if (searchTerm) {
    filteredHistory = filteredHistory.filter(h => 
      h.train_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.train_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px"
      }}>
        <h2 style={{ margin: 0, color: "#0a2540" }}>
          📜 Train History
        </h2>
        
        <div style={{ display: "flex", gap: "12px" }}>
          {/* Search */}
          <input
            type="text"
            placeholder="Search trains..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              width: "200px"
            }}
          />
          
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              fontSize: "14px"
            }}
          >
            <option value="all">All Trains</option>
            <option value="CLEARED">Cleared</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px",
        marginBottom: "24px"
      }}>
        <StatCard
          title="Total Cleared"
          value={history.length}
          icon="🚂"
          color="#16a34a"
        />
        <StatCard
          title="Resolved"
          value={history.filter(h => h.status === "RESOLVED").length}
          icon="✅"
          color="#0284c7"
        />
        <StatCard
          title="On Time"
          value={history.filter(h => h.delay === 0).length}
          icon="⏱️"
          color="#7c3aed"
        />
        <StatCard
          title="Delayed"
          value={history.filter(h => h.delay > 0).length}
          icon="⚠️"
          color="#dc2626"
        />
      </div>

      {/* History Table */}
      {filteredHistory.length === 0 ? (
        <div style={{
          background: "#f8fafc",
          padding: "40px",
          borderRadius: "10px",
          textAlign: "center",
          color: "#64748b"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>📭</div>
          <p style={{ margin: 0, fontSize: "16px", fontWeight: "500" }}>
            No history records found
          </p>
          <p style={{ margin: "8px 0 0 0", fontSize: "14px" }}>
            {searchTerm || filter !== "all" 
              ? "Try adjusting your filters"
              : "Cleared trains will appear here"
            }
          </p>
        </div>
      ) : (
        <div style={{
          background: "white",
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Train ID</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Name</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Route</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Scheduled</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Cleared At</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Status</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Delay</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Priority</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((record, i) => (
                <tr 
                  key={i} 
                  style={{ 
                    borderBottom: "1px solid #f3f4f6",
                    transition: "background 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                >
                  <td style={{ padding: "12px", fontWeight: "500" }}>
                    {record.train_id}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {record.train_name}
                  </td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#64748b" }}>
                    {record.source} → {record.destination}
                  </td>
                  <td style={{ padding: "12px", fontSize: "13px" }}>
                    {record.arrival_time}
                  </td>
                  <td style={{ padding: "12px", fontSize: "13px", fontWeight: "500" }}>
                    {record.clearedAt}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "600",
                      background: getStatusColor(record.status).bg,
                      color: getStatusColor(record.status).text
                    }}>
                      {record.status}
                    </span>
                  </td>
                  <td style={{
                    padding: "12px",
                    fontWeight: "600",
                    color: record.delay > 0 ? "#dc2626" : record.delay < 0 ? "#2563eb" : "#16a34a"
                  }}>
                    {record.delay > 0 ? `+${record.delay}` : record.delay} min
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span style={{
                      padding: "2px 6px",
                      borderRadius: "3px",
                      fontSize: "11px",
                      fontWeight: "600",
                      background: getPriorityColor(record.priority).bg,
                      color: getPriorityColor(record.priority).text
                    }}>
                      P{record.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Export Button */}
      {history.length > 0 && (
        <div style={{ marginTop: "20px", textAlign: "right" }}>
          <button
            onClick={() => exportToCSV(filteredHistory)}
            style={{
              padding: "10px 20px",
              background: "#1d6fa5",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600"
            }}
          >
            📥 Export to CSV
          </button>
        </div>
      )}
    </div>
  );
}

// Helper component for statistics cards
function StatCard({ title, value, icon, color }) {
  return (
    <div style={{
      background: "white",
      padding: "16px",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      borderLeft: `4px solid ${color}`
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>
            {title}
          </div>
          <div style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a" }}>
            {value}
          </div>
        </div>
        <div style={{ fontSize: "28px" }}>{icon}</div>
      </div>
    </div>
  );
}

// Helper function for status colors
function getStatusColor(status) {
  const colors = {
    "CLEARED": { bg: "#dcfce7", text: "#166534" },
    "RESOLVED": { bg: "#dbeafe", text: "#1e40af" },
    "ON TIME": { bg: "#d1fae5", text: "#065f46" },
    "DELAYED": { bg: "#fee2e2", text: "#991b1b" }
  };
  return colors[status] || { bg: "#f3f4f6", text: "#64748b" };
}

// Helper function for priority colors
function getPriorityColor(priority) {
  const colors = {
    1: { bg: "#dcfce7", text: "#166534" },
    2: { bg: "#fed7aa", text: "#7c2d12" },
    3: { bg: "#dbeafe", text: "#1e40af" },
    4: { bg: "#fecaca", text: "#991b1b" }
  };
  return colors[priority] || { bg: "#f3f4f6", text: "#64748b" };
}

// Helper function to export to CSV
function exportToCSV(data) {
  const headers = ["Train ID", "Name", "Source", "Destination", "Scheduled", "Cleared At", "Status", "Delay", "Priority"];
  const rows = data.map(record => [
    record.train_id,
    record.train_name,
    record.source,
    record.destination,
    record.arrival_time,
    record.clearedAt,
    record.status,
    record.delay,
    record.priority
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `train_history_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}