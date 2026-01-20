// src/components/Dashboard.jsx (FIXED - Updates Performance Correctly)
import { useState, useEffect } from "react";
import TrainPrecedencePanel from "./TrainPrecedencePanel";
import TrainDetails from "./TrainDetails";
import Conflicts from "../components/Conflicts";
import { TrainDataValidator } from "../utils/trainDataValidator.jsx";
import { ConflictDebugPanel } from "../utils/ConflictDebugPanel";
import { detectBlockConflicts } from "../utils/blockConflictDetector";
import { detectLoopLineConflicts } from "../utils/loopLineDetector";
import { detectJunctionConflicts } from "../utils/junctionConflictDetector";

export default function Dashboard({ 
  trains, 
  setTrains, 
  onClearTrain, 
  performanceData,
  onAcceptResolution,
  onRejectResolution
}) {
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [liveConflictCount, setLiveConflictCount] = useState(0);

  // Calculate live conflict count
  useEffect(() => {
    if (trains && trains.length > 0) {
      const blockConflicts = detectBlockConflicts(trains);
      const loopConflicts = detectLoopLineConflicts(trains);
      const junctionConflicts = detectJunctionConflicts(trains);
      
      const totalConflicts = blockConflicts.length + loopConflicts.length + junctionConflicts.length;
      setLiveConflictCount(totalConflicts);
    } else {
      setLiveConflictCount(0);
    }
  }, [trains]);

  function injectDelay(trainId, delayMinutes) {
    const delayAmount = Number(delayMinutes);
    
    if (isNaN(delayAmount)) {
      console.error("Invalid delay amount:", delayMinutes);
      return;
    }
    
    console.log(`📥 Injecting delay: ${delayAmount} min to train ${trainId}`);
    
    setTrains(prev =>
      prev.map(t => {
        if (t.train_id !== trainId) return t;
        
        const originalScheduledTime = t.original_arrival_time || t.arrival_time;
        const [hours, minutes] = originalScheduledTime.split(":").map(Number);
        const scheduledMinutes = hours * 60 + minutes;
        
        let effectiveMinutes = scheduledMinutes + delayAmount;
        if (effectiveMinutes < 0) {
          effectiveMinutes = 1440 + effectiveMinutes;
        }
        effectiveMinutes = effectiveMinutes % 1440;
        
        const effectiveHour = Math.floor(effectiveMinutes / 60);
        const effectiveMinute = effectiveMinutes % 60;
        
        let newBlockId;
        if (effectiveHour >= 5 && effectiveHour < 8) {
          newBlockId = "BLK_MORNING";
        } else if (effectiveHour >= 8 && effectiveHour < 10) {
          newBlockId = "BLK_RUSH";
        } else if (effectiveHour >= 10 && effectiveHour < 12) {
          newBlockId = "BLK_MIDDAY";
        } else {
          newBlockId = t.block_id;
        }
        
        return {
          ...t,
          original_arrival_time: originalScheduledTime,
          arrival_time: originalScheduledTime,
          delay: delayAmount,
          arrival: effectiveMinutes,
          block_id: newBlockId,
          current_block: newBlockId,
          status: delayAmount !== 0 ? "DELAYED" : "ON TIME",
          conflict_reason: delayAmount !== 0 ? `${delayAmount > 0 ? '+' : ''}${delayAmount} min adjustment` : null
        };
      })
    );
  }

  const activeTrains = trains.filter(t => t.status !== "CLEARED");
  const conflictedTrains = activeTrains.filter(t => 
    t.conflict || 
    t.status === "IN_CONFLICT" || 
    t.status === "DELAYED" || 
    t.status === "MANUAL_REVIEW"
  );
  const resolvedTrains = activeTrains.filter(t => t.status === "RESOLVED");

  // Determine system status
  const systemStatus = liveConflictCount > 0 ? "CONFLICT" : 
                      conflictedTrains.length > 0 ? "MANAGING" : "NORMAL";
  
  const systemStatusColor = liveConflictCount > 0 ? "#dc2626" : 
                           conflictedTrains.length > 0 ? "#d97706" : "#16a34a";

  return (
    <>
      {/* Data Validator */}
      <TrainDataValidator trains={trains} />

      {/* KPIs */}
      <div className="card-grid">
        <StatusCard 
          title="Active Trains" 
          value={activeTrains.length}
          subtitle={`${resolvedTrains.length} resolved`}
        />
        <StatusCard
          title="Active Conflicts"
          value={liveConflictCount}
          color={liveConflictCount > 0 ? "#dc2626" : "#16a34a"}
          subtitle={`${performanceData.totalConflictsResolved || 0} total resolved`}
        />
        <StatusCard
          title="System Status"
          value={systemStatus}
          color={systemStatusColor}
          subtitle={conflictedTrains.length > 0 ? `${conflictedTrains.length} trains affected` : "All clear"}
        />
      </div>

      {/* Performance Summary Bar */}
      {performanceData.totalConflictsResolved > 0 && (
        <div style={{
          background: "white",
          padding: "16px",
          borderRadius: "10px",
          marginTop: "16px",
          display: "flex",
          gap: "24px",
          alignItems: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
              Total Resolved
            </div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#16a34a" }}>
              {performanceData.totalConflictsResolved}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
              Avg Resolution Time
            </div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#0284c7" }}>
              {performanceData.averageResolutionTime.toFixed(2)}s
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
              Total Delay Saved
            </div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#7c3aed" }}>
              {performanceData.totalDelayReduced} min
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
              Success Rate
            </div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#16a34a" }}>
              {performanceData.totalConflictsDetected > 0 
                ? Math.round((performanceData.totalConflictsResolved / performanceData.totalConflictsDetected) * 100)
                : 0}%
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="dashboard-grid">
        <TrainPrecedencePanel
          trains={activeTrains}
          setTrains={setTrains}
          onSelect={setSelectedTrain}
        />
        <TrainDetails
          train={selectedTrain}
          onDelayInject={injectDelay}
          onClear={onClearTrain}
        />
      </div>

      {/* Conflict Resolution */}
      <Conflicts
        trains={activeTrains}
        onAcceptResolution={onAcceptResolution}
        onRejectResolution={onRejectResolution}
      />

      {/* Debug Panel */}
      <ConflictDebugPanel trains={activeTrains} />
    </>
  );
}

function StatusCard({ title, value, color, subtitle }) {
  return (
    <div className="card">
      <h4>{title}</h4>
      <p className="card-value" style={{ color: color || "#0a2540" }}>
        {value}
      </p>
      {subtitle && (
        <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}