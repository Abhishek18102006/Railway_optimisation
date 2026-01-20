// src/components/Conflicts.jsx (UPDATED - Shows Different Resolution Types)
import { useState, useEffect } from "react";
import { detectBlockConflicts, getSeverityColor } from "../utils/blockConflictDetector";
import { detectLoopLineConflicts } from "../utils/loopLineDetector";
import { detectJunctionConflicts, getJunctionSeverityColor } from "../utils/junctionConflictDetector";
import { resolveConflictAI } from "../utils/aiResolver";

export default function Conflicts({
  trains,
  onAcceptResolution,
  onRejectResolution,
  onUpdateConflictCounts
}) {
  const [aiResult, setAiResult] = useState(null);
  const [activeConflict, setActiveConflict] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sameBlockConflicts, setSameBlockConflicts] = useState([]);
  const [loopLineConflicts, setLoopLineConflicts] = useState([]);
  const [junctionConflicts, setJunctionConflicts] = useState([]);

  // Detect conflicts
  useEffect(() => {
    try {
      if (Array.isArray(trains) && trains.length > 0) {
        const blockConflicts = detectBlockConflicts(trains);
        const loopConflicts = detectLoopLineConflicts(trains);
        const junctionConflictsData = detectJunctionConflicts(trains);
        
        setSameBlockConflicts(blockConflicts);
        setLoopLineConflicts(loopConflicts);
        setJunctionConflicts(junctionConflictsData);
        setError(null);

        if (onUpdateConflictCounts) {
          onUpdateConflictCounts('block', blockConflicts.length);
          onUpdateConflictCounts('loop', loopConflicts.length);
          onUpdateConflictCounts('junction', junctionConflictsData.length);
        }
      } else {
        setSameBlockConflicts([]);
        setLoopLineConflicts([]);
        setJunctionConflicts([]);
      }
    } catch (err) {
      console.error("Conflict detection error:", err);
      setError(err.message);
      setSameBlockConflicts([]);
      setLoopLineConflicts([]);
      setJunctionConflicts([]);
    }
  }, [trains, onUpdateConflictCounts]);

  /* AI RESOLUTION */
  async function handleResolve(conflict) {
    setLoading(true);
    setError(null);
    setAiResult(null);
    
    try {
      console.log("🤖 Resolving conflict with AI:", conflict);
      
      const trainA = trains.find(t => 
        t.train_id === conflict.trainA || 
        t.train_id === conflict.leadingTrain || 
        t.train_id === conflict.train1
      );
      const trainB = trains.find(t => 
        t.train_id === conflict.trainB || 
        t.train_id === conflict.followingTrain || 
        t.train_id === conflict.train2
      );
      
      if (!trainA || !trainB) {
        throw new Error("Could not find train objects for conflict resolution");
      }

      const enrichedConflict = {
        ...conflict,
        trainAObj: trainA,
        trainBObj: trainB
      };
      
      const result = await resolveConflictAI(enrichedConflict);
      
      console.log("✅ AI Resolution received:", result);
      
      if (!result.success) {
        setError(result.error || "AI resolution failed");
        return;
      }
      
      setAiResult(result);
      setActiveConflict(conflict);
    } catch (err) {
      console.error("AI resolution error:", err);
      setError("Failed to resolve conflict: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  /* ACCEPT RESOLUTION */
  function handleAccept() {
    if (!aiResult) {
      console.error("No AI result to accept");
      return;
    }

    console.log("✅ Accepting AI resolution:", aiResult);

    let delayReduction = 0;
    if (aiResult.suggested_speed > 0 && aiResult.suggested_speed < 80) {
      delayReduction = Math.floor((80 - aiResult.suggested_speed) / 10);
    }

    const resolutionDetails = {
      priority_train: aiResult.priority_train,
      reduced_train: aiResult.reduced_train,
      decision: aiResult.decision,
      confidence: aiResult.confidence,
      suggested_speed: aiResult.suggested_speed,
      delayReduction: delayReduction,
      reason: aiResult.reason,
      conflictType: aiResult.conflictType
    };

    console.log("📤 Sending resolution details:", resolutionDetails);

    onAcceptResolution(aiResult.reduced_train, resolutionDetails);

    if (onUpdateConflictCounts && activeConflict) {
      const conflictType = activeConflict.type === 'SAME_BLOCK' ? 'block' :
                          activeConflict.type === 'LOOP_LINE' ? 'loop' : 'junction';
      onUpdateConflictCounts(conflictType, 0, 1);
    }

    setAiResult(null);
    setActiveConflict(null);
    
    console.log("✅ Resolution accepted and state cleared");
  }

  /* REJECT RESOLUTION */
  function handleReject() {
    if (!aiResult) return;

    console.log("❌ Rejecting AI resolution for:", aiResult.reduced_train);
    onRejectResolution(aiResult.reduced_train);
    setAiResult(null);
    setActiveConflict(null);
  }

  return (
    <div className="table-card">
      <h3>🚦 Conflict Resolution</h3>

      {/* ERROR DISPLAY */}
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

      {/* LOADING STATE */}
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

      {/* AI RESULT - DIFFERENT DISPLAY FOR EACH TYPE */}
      {aiResult && aiResult.success && (
        <div 
          style={{
            marginBottom: "24px",
            background: "#f0fdf4",
            border: "2px solid #4ade80",
            padding: "16px",
            borderRadius: "10px"
          }}
        >
          <h4 style={{ 
            marginBottom: "12px", 
            color: "#166534",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            🤖 AI Recommendation - {aiResult.conflictType}
            <span style={{
              background: "#dcfce7",
              color: "#166534",
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "600"
            }}>
              {aiResult.confidence}% Confidence
            </span>
          </h4>

          {/* SAME BLOCK CONFLICT DISPLAY */}
          {aiResult.conflictType === "SAME_BLOCK" && (
            <div style={{ fontSize: "14px", lineHeight: "1.8", marginBottom: "16px" }}>
              <div style={{ 
                background: "#fee2e2", 
                padding: "12px", 
                borderRadius: "6px",
                marginBottom: "12px",
                borderLeft: "4px solid #dc2626"
              }}>
                <strong>⚠️ Opposing Trains on Same Block</strong>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "8px" }}>
                <strong>Decision:</strong>
                <span style={{ color: "#dc2626", fontWeight: "600" }}>
                  {aiResult.decision} (Complete Stop)
                </span>

                <strong>Priority Train:</strong>
                <span style={{ color: "#166534", fontWeight: "600" }}>
                  {aiResult.priority_train} (Proceeds normally)
                </span>

                <strong>Held Train:</strong>
                <span style={{ color: "#dc2626", fontWeight: "600" }}>
                  {aiResult.reduced_train} (STOPPED)
                </span>

                <strong>Action:</strong>
                <span>{aiResult.detailedAction}</span>

                <strong>Reason:</strong>
                <span>{aiResult.reason}</span>
              </div>
            </div>
          )}

          {/* LOOP LINE CONFLICT DISPLAY */}
          {aiResult.conflictType === "LOOP_LINE" && (
            <div style={{ fontSize: "14px", lineHeight: "1.8", marginBottom: "16px" }}>
              <div style={{ 
                background: "#fef3c7", 
                padding: "12px", 
                borderRadius: "6px",
                marginBottom: "12px",
                borderLeft: "4px solid #d97706"
              }}>
                <strong>🔁 Same Direction - Insufficient Gap</strong>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "8px" }}>
                <strong>Decision:</strong>
                <span style={{ color: "#d97706", fontWeight: "600" }}>
                  {aiResult.decision}
                </span>

                <strong>Leading Train:</strong>
                <span style={{ color: "#166534", fontWeight: "600" }}>
                  {aiResult.priority_train} (Continues on MAIN)
                </span>

                <strong>Following Train:</strong>
                <span style={{ color: "#d97706", fontWeight: "600" }}>
                  {aiResult.reduced_train} (Routed to LOOP)
                </span>

                <strong>Suggested Speed:</strong>
                <span style={{ fontWeight: "600" }}>
                  {aiResult.suggested_speed} km/h
                </span>

                <strong>Current Gap:</strong>
                <span>{aiResult.timeGap} min (needs {aiResult.recommendedGap} min)</span>

                <strong>Action:</strong>
                <span>{aiResult.detailedAction}</span>

                <strong>Reason:</strong>
                <span>{aiResult.reason}</span>
              </div>
            </div>
          )}

          {/* JUNCTION CONFLICT DISPLAY */}
          {aiResult.conflictType === "JUNCTION" && (
            <div style={{ fontSize: "14px", lineHeight: "1.8", marginBottom: "16px" }}>
              <div style={{ 
                background: "#eff6ff", 
                padding: "12px", 
                borderRadius: "6px",
                marginBottom: "12px",
                borderLeft: "4px solid #3b82f6"
              }}>
                <strong>🔀 Junction Convergence - Clearance Required</strong>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "8px" }}>
                <strong>Decision:</strong>
                <span style={{ color: "#3b82f6", fontWeight: "600" }}>
                  {aiResult.decision}
                </span>

                <strong>Junction:</strong>
                <span style={{ fontWeight: "600" }}>
                  {aiResult.junctionId}
                </span>

                <strong>Entry Sequence:</strong>
                <div style={{ 
                  background: "#f0f9ff", 
                  padding: "10px", 
                  borderRadius: "4px",
                  marginTop: "4px"
                }}>
                  {aiResult.entrySequence && aiResult.entrySequence.map((seq, i) => (
                    <div key={i} style={{ 
                      marginBottom: i < aiResult.entrySequence.length - 1 ? "8px" : "0",
                      paddingBottom: i < aiResult.entrySequence.length - 1 ? "8px" : "0",
                      borderBottom: i < aiResult.entrySequence.length - 1 ? "1px solid #bfdbfe" : "none"
                    }}>
                      <div style={{ fontWeight: "600" }}>
                        {i + 1}. Train {seq.train} - {seq.action}
                      </div>
                      <div style={{ fontSize: "12px", color: "#475569", marginTop: "2px" }}>
                        {seq.note}
                      </div>
                    </div>
                  ))}
                </div>

                <strong>Clearance Time:</strong>
                <span>{aiResult.clearanceRequired} minutes</span>

                <strong>Current Gap:</strong>
                <span style={{ color: aiResult.currentGap < aiResult.clearanceRequired ? "#dc2626" : "#16a34a" }}>
                  {aiResult.currentGap.toFixed(1)} min
                </span>

                <strong>Delay Required:</strong>
                <span style={{ fontWeight: "600", color: "#3b82f6" }}>
                  {aiResult.suggested_delay} minutes for Train {aiResult.reduced_train}
                </span>

                <strong>Severity:</strong>
                <span style={{
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "600",
                  background: aiResult.severity === "CRITICAL" ? "#fee2e2" : 
                             aiResult.severity === "HIGH" ? "#fed7aa" : "#fef3c7",
                  color: aiResult.severity === "CRITICAL" ? "#7f1d1d" : 
                         aiResult.severity === "HIGH" ? "#7c2d12" : "#78350f"
                }}>
                  {aiResult.severity}
                </span>

                <strong>Action:</strong>
                <span>{aiResult.detailedAction}</span>

                <strong>Reason:</strong>
                <span>{aiResult.reason}</span>
              </div>
            </div>
          )}

          {/* COMMON PROBABILITY DATA */}
          {aiResult.probabilities && (
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "140px 1fr", 
              gap: "8px",
              paddingTop: "12px",
              borderTop: "1px solid #dcfce7"
            }}>
              <strong>Risk Analysis:</strong>
              <span>
                Low: {aiResult.probabilities.low_risk}% | 
                High: {aiResult.probabilities.high_risk}%
              </span>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
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
              ✅ Accept & Apply Resolution
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

          {/* INFO MESSAGE */}
          <div style={{
            marginTop: "12px",
            padding: "8px",
            background: "#fffbeb",
            borderRadius: "4px",
            fontSize: "12px",
            color: "#92400e"
          }}>
            ℹ️ Accepting will apply the recommended {aiResult.decision} action
          </div>
        </div>
      )}

      {/* SAME BLOCK CONFLICTS */}
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
                  {conflict.timeDiff} min gap
                </div>
              </div>

              <button 
                onClick={() => handleResolve(conflict)}
                disabled={loading}
                style={{
                  background: loading ? "#9ca3af" : "#6366f1",
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
                {loading ? "🔄 Processing..." : "🤖 Resolve with AI"}
              </button>
            </div>
          ))
        )}
      </div>

      {/* LOOP LINE CONFLICTS */}
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

              <button 
                onClick={() => handleResolve(conflict)}
                disabled={loading}
                style={{
                  background: loading ? "#9ca3af" : "#6366f1",
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
                {loading ? "🔄 Processing..." : "🤖 Resolve with AI"}
              </button>
            </div>
          ))
        )}
      </div>

      {/* JUNCTION CONFLICTS */}
      <div style={{ marginTop: "24px" }}>
        <h4 style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "8px",
          marginBottom: "12px" 
        }}>
          🔀 Junction Conflicts
          <span style={{
            background: junctionConflicts.length > 0 ? "#fca5a5" : "#d1fae5",
            color: junctionConflicts.length > 0 ? "#7f1d1d" : "#065f46",
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "600"
          }}>
            {junctionConflicts.length}
          </span>
        </h4>

        {junctionConflicts.length === 0 ? (
          <p style={{ color: "#16a34a", fontSize: "14px" }}>
            ✓ No junction conflicts detected
          </p>
        ) : (
          junctionConflicts.map((conflict, i) => (
            <div 
              key={i} 
              style={{
                background: "#fef3c7",
                border: `2px solid ${getJunctionSeverityColor(conflict.severity)}`,
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
                    color: getJunctionSeverityColor(conflict.severity),
                    marginBottom: "4px"
                  }}>
                    Junction: {conflict.junction_id} | Severity: {conflict.severity}
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "500" }}>
                    Train 1: <strong>{conflict.train1}</strong> (from {conflict.route1})
                    <br />
                    Train 2: <strong>{conflict.train2}</strong> (from {conflict.route2})
                  </div>
                </div>
                <div style={{ 
                  background: getJunctionSeverityColor(conflict.severity),
                  color: "white",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "600"
                }}>
                  {conflict.timeGap} min gap
                  <div style={{ fontSize: "10px", opacity: 0.9 }}>
                    (needs {conflict.clearanceNeeded} min)
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleResolve(conflict)}
                disabled={loading}
                style={{
                  background: loading ? "#9ca3af" : "#6366f1",
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
                {loading ? "🔄 Processing..." : "🤖 Resolve with AI"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}