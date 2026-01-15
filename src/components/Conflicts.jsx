import { useState, useEffect } from "react";
import { detectBlockConflicts, getSeverityColor } from "../utils/blockConflictDetector";
import { detectLoopLineConflicts } from "../utils/loopLineDetector";
import { resolveConflictAI } from "../utils/aiResolver";

/**
 * Conflict Resolution Component
 * Displays and resolves train conflicts
 */
export default function Conflicts({
  trains,
  onAcceptResolution,
  onRejectResolution
}) {
  const [aiResult, setAiResult] = useState(null);
  const [activeConflict, setActiveConflict] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sameBlockConflicts, setSameBlockConflicts] = useState([]);
  const [loopLineConflicts, setLoopLineConflicts] = useState([]);

  // Detect conflicts safely with useEffect
  useEffect(() => {
    try {
      if (Array.isArray(trains) && trains.length > 0) {
        const blockConflicts = detectBlockConflicts(trains);
        const loopConflicts = detectLoopLineConflicts(trains);
        
        setSameBlockConflicts(blockConflicts);
        setLoopLineConflicts(loopConflicts);
        setError(null);
      } else {
        setSameBlockConflicts([]);
        setLoopLineConflicts([]);
      }
    } catch (err) {
      console.error("Conflict detection error:", err);
      setError(err.message);
      setSameBlockConflicts([]);
      setLoopLineConflicts([]);
    }
  }, [trains]);

  /* ============================
     AI RESOLUTION
     ============================ */
  async function handleResolve(conflict) {
    setLoading(true);
    setError(null);
    
    try {
      const result = await resolveConflictAI(conflict);
      setAiResult(result);
      setActiveConflict(conflict);
    } catch (err) {
      console.error("AI resolution error:", err);
      setError("Failed to resolve conflict: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleAccept() {
    if (!aiResult) return;

    onAcceptResolution(aiResult.reduced_train);
    setAiResult(null);
    setActiveConflict(null);
  }

  function handleReject() {
    if (!aiResult) return;

    onRejectResolution(aiResult.reduced_train);
    setAiResult(null);
    setActiveConflict(null);
  }

  return (
    <div className="table-card">
      <h3>🚦 Conflict Resolution</h3>

      {/* ================= ERROR DISPLAY ================= */}
      {error && (
        <div style={{
          background: "#fee2e2",
          border: "1px solid #fca5a5",
          padding: "12px",
          borderRadius: "6px",
          marginBottom: "16px",
          color: "#b91c1c"
        }}>
          ⚠ <strong>Error:</strong> {error}
        </div>
      )}

      {/* ================= LOADING STATE ================= */}
      {loading && (
        <div style={{
          background: "#dbeafe",
          padding: "12px",
          borderRadius: "6px",
          marginBottom: "16px",
          color: "#1e40af"
        }}>
          🔄 Processing AI recommendation...
        </div>
      )}

      {/* ================= SAME BLOCK CONFLICTS ================= */}
      <div style={{ marginTop: "20px" }}>
        <h4 style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "8px",
          marginBottom: "12px" 
        }}>
          ⚠ Same Block Conflicts
          <span style={{
            background: sameBlockConflicts.length > 0 ? "#fca5a5" : "#d1fae5",
            color: sameBlockConflicts.length > 0 ? "#7f1d1d" : "#065f46",
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "600"
          }}>
            {sameBlockConflicts.length}
          </span>
        </h4>

        {sameBlockConflicts.length === 0 ? (
          <p style={{ color: "#16a34a", fontSize: "14px" }}>
            ✓ No same-block conflicts detected
          </p>
        ) : (
          sameBlockConflicts.map((conflict, i) => (
            <div 
              key={i} 
              style={{
                background: "#fef2f2",
                border: `2px solid ${getSeverityColor(conflict.severity)}`,
                padding: "14px",
                borderRadius: "8px",
                marginBottom: "12px"
              }}
            >
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between",
                alignItems: "start",
                marginBottom: "8px"
              }}>
                <div>
                  <div style={{ 
                    fontSize: "12px", 
                    fontWeight: "600",
                    color: getSeverityColor(conflict.severity),
                    marginBottom: "4px"
                  }}>
                    Block: {conflict.block_id} | Severity: {conflict.severity}
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "500" }}>
                    Train A: <strong>{conflict.trainA}</strong> ↔ 
                    Train B: <strong>{conflict.trainB}</strong>
                  </div>
                </div>
                <div style={{ 
                  background: getSeverityColor(conflict.severity),
                  color: "white",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "600"
                }}>
                  -{conflict.timeDiff} min
                </div>
              </div>

              <button 
                onClick={() => handleResolve(conflict)}
                disabled={loading}
                style={{
                  background: "#6366f1",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  opacity: loading ? 0.5 : 1
                }}
              >
                🤖 Resolve with AI
              </button>
            </div>
          ))
        )}
      </div>

      {/* ================= LOOP LINE CONFLICTS ================= */}
      <div style={{ marginTop: "24px" }}>
        <h4 style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "8px",
          marginBottom: "12px" 
        }}>
          🔁 Loop Line Conflicts
          <span style={{
            background: loopLineConflicts.length > 0 ? "#fed7aa" : "#d1fae5",
            color: loopLineConflicts.length > 0 ? "#7c2d12" : "#065f46",
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "600"
          }}>
            {loopLineConflicts.length}
          </span>
        </h4>

        {loopLineConflicts.length === 0 ? (
          <p style={{ color: "#16a34a", fontSize: "14px" }}>
            ✓ No loop-line conflicts detected
          </p>
        ) : (
          loopLineConflicts.map((conflict, i) => (
            <div
              key={i}
              style={{
                background: "#eff6ff",
                border: "2px solid #60a5fa",
                padding: "14px",
                borderRadius: "8px",
                marginBottom: "12px"
              }}
            >
              <div style={{ marginBottom: "8px" }}>
                <div style={{ fontSize: "12px", fontWeight: "600", color: "#1e40af" }}>
                  Block: {conflict.block_id}
                </div>
                <div style={{ fontSize: "14px", marginTop: "4px" }}>
                  <strong>Leading:</strong> Train {conflict.leadingTrain}
                  <br />
                  <strong>Following:</strong> Train {conflict.followingTrain}
                  <br />
                  <strong>Gap:</strong> {conflict.timeDiff} minutes
                </div>
              </div>

              <div style={{
                background: "#dbeafe",
                padding: "10px",
                borderRadius: "6px",
                fontSize: "13px",
                color: "#1e40af"
              }}>
                👉 <strong>Recommendation:</strong> Route Train {conflict.followingTrain} to LOOP LINE
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= AI RESULT ================= */}
      {aiResult && (
        <div 
          style={{
            marginTop: "24px",
            background: "#f0fdf4",
            border: "2px solid #4ade80",
            padding: "16px",
            borderRadius: "10px"
          }}
        >
          <h4 style={{ marginBottom: "12px", color: "#166534" }}>
            🤖 AI Recommendation
          </h4>

          <div style={{ fontSize: "14px", lineHeight: "1.8" }}>
            <p><strong>Priority Train:</strong> {aiResult.priority_train}</p>
            <p><strong>Reduce Speed of:</strong> {aiResult.reduced_train}</p>
            <p><strong>Suggested Speed:</strong> {aiResult.suggested_speed} km/h</p>
            <p><strong>Reason:</strong> {aiResult.reason}</p>
          </div>

          <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
            <button
              onClick={handleAccept}
              style={{
                background: "#16a34a",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600"
              }}
            >
              ✅ Accept Resolution
            </button>

            <button
              onClick={handleReject}
              style={{
                background: "#dc2626",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600"
              }}
            >
              ❌ Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}