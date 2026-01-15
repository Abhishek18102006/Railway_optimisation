import { useState } from "react";

export default function SelectedTrainPanel({ train }) {
  const [delay, setDelay] = useState(0);
  const [aiResult, setAiResult] = useState(null);

  if (!train) return <p>Select a train</p>;

  const hasConflict = delay > 10 && train.is_peak_hour === "1";

  const callAI = async () => {
    const res = await fetch("http://localhost:5000/ai-suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...train, delay })
    });

    const data = await res.json();
    setAiResult(data);
  };

  return (
    <div>
      <h3>{train.train_name}</h3>

      <p>Passengers: {train.passengers}</p>
      <p>Distance: {train.distance_km} km</p>

      <input
        type="number"
        placeholder="Add delay (minutes)"
        onChange={e => setDelay(Number(e.target.value))}
      />

      {hasConflict && (
        <>
          <p style={{ color: "red" }}>⚠ Conflict Detected</p>
          <button onClick={callAI}>Call AI</button>
        </>
      )}

      {aiResult && (
        <div>
          <p>AI Suggestion: {aiResult.suggestion}</p>
          <p>Confidence: {aiResult.confidence}</p>
        </div>
      )}
    </div>
  );
}
