import { useState } from "react";

export default function ConflictResolutionPanel({
  delayedTrains,
  selectedTrain,
  onInjectDelay
}) {
  const [mlResult, setMlResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ==============================
  // CALL ML BACKEND
  // ==============================
  const runMLPrediction = async () => {
    if (!selectedTrain || delayedTrains.length === 0) return;

    // Pick the next affected train (simple & realistic)
    const otherTrain = delayedTrains.find(
      t => t.train_id !== selectedTrain.train_id
    );

    if (!otherTrain) {
      setError("No second train available for conflict prediction");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:3000/api/predict-conflict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          train1_id: selectedTrain.train_id,
          train2_id: otherTrain.train_id,
          cp1: 3, // checkpoint level (can be dynamic later)
          cp2: 2
        })
      });

      const data = await res.json();
      setMlResult(data);
    } catch (err) {
      setError("Failed to run ML prediction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="table-card">
      <h3>Conflict Resolution</h3>

      {/* ==============================
          INJECT DELAY
      ============================== */}
      {selectedTrain && (
        <div className="delay-box">
          <h4>Inject Delay</h4>
          <p>
            <strong>{selectedTrain.train_id}</strong> —{" "}
            {selectedTrain.train_name}
          </p>

          <button onClick={() => onInjectDelay(selectedTrain.train_id, 10)}>
            +10 min
          </button>

          <button onClick={() => onInjectDelay(selectedTrain.train_id, 20)}>
            +20 min
          </button>

          <button onClick={() => onInjectDelay(selectedTrain.train_id, 30)}>
            +30 min
          </button>

          <hr />

          {/* ==============================
              ML PREDICTION BUTTON
          ============================== */}
          <button
            onClick={runMLPrediction}
            disabled={loading}
            style={{ background: "#673ab7", color: "white" }}
          >
            {loading ? "Predicting..." : "Predict Same Block Conflict (ML)"}
          </button>
        </div>
      )}

      {/* ==============================
          ML RESULT
      ============================== */}
      {mlResult && (
        <div className="delayed-card" style={{ marginTop: "10px" }}>
          <h4>🧠 ML Decision</h4>
          <p>
            🚦 <strong>Priority Train:</strong> {mlResult.priority_train}
          </p>
          <p>
            ⏸ <strong>Reduced Train:</strong> {mlResult.reduced_train}
          </p>
          <p>
            ⚠ <strong>Suggested Speed:</strong>{" "}
            {mlResult.suggested_speed} km/h
          </p>
          <p>
            📌 <strong>Reason:</strong> {mlResult.reason}
          </p>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <hr />

      {/* ==============================
          DELAYED TRAINS LIST
      ============================== */}
      {delayedTrains.length === 0 ? (
        <p>No delayed trains</p>
      ) : (
        delayedTrains.map(t => (
          <div key={t.train_id} className="delayed-card">
            <strong>{t.train_id}</strong> {t.train_name}
            <div className="delay-text">Delay: +{t.delay} min</div>
          </div>
        ))
      )}
    </div>
  );
}
