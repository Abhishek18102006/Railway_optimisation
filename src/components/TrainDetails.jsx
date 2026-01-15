// src/components/TrainDetails.jsx
import { useState } from "react";

export default function TrainDetails({ train, onDelayInject }) {
  const [delay, setDelay] = useState("");

  if (!train) {
    return <div className="card">Select a train</div>;
  }

  function handleInject() {
    const delayMin = Number(delay);
    if (isNaN(delayMin)) return;

    onDelayInject(train.train_id, delayMin);
    setDelay("");
  }

  return (
    <div className="card">
      <h3>{train.train_name}</h3>

      <p><b>ID:</b> {train.train_id}</p>
      <p><b>Arrival:</b> {train.arrival}</p>
      <p><b>Departure:</b> {train.departure}</p>
      <p><b>Status:</b> {train.status}</p>
      <p><b>Delay:</b> {train.delay || 0} min</p>

      <input
        type="number"
        placeholder="Delay (min)"
        value={delay}
        onChange={e => setDelay(e.target.value)}
      />

      <button onClick={handleInject}>
        Inject Delay
      </button>
    </div>
  );
}
