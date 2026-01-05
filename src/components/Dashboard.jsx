import { useState } from "react";
import TrainPrecedencePanel from "./TrainPrecedencePanel";
import ConflictResolutionPanel from "./ConflictResolutionPanel";

export default function Dashboard() {
  const [trains, setTrains] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState(null);

  const delayedTrains = trains.filter(t => t.delay > 0);

  const injectDelay = (trainId, delay) => {
    setTrains(prev =>
      prev.map(t =>
        t.train_id === trainId
          ? { ...t, delay, status: "DELAYED" }
          : t
      )
    );
  };

  return (
    <>
      {/* KPI CARDS */}
      <div className="card-grid">
        <StatusCard title="Active Trains" value={trains.length} />
        <StatusCard title="Delayed Trains" value={delayedTrains.length} />
        <StatusCard
          title="System Status"
          value={delayedTrains.length > 0 ? "PAUSED" : "RUNNING"}
        />
      </div>

      <div className="dashboard-grid">
        {/* MAIN PRECEDENCE */}
        <TrainPrecedencePanel
          trains={trains}
          setTrains={setTrains}
          onSelect={setSelectedTrain}
        />

        {/* CONFLICT RESOLUTION */}
        <ConflictResolutionPanel
          delayedTrains={delayedTrains}
          selectedTrain={selectedTrain}
          onInjectDelay={injectDelay}
        />
      </div>
    </>
  );
}

function StatusCard({ title, value }) {
  return (
    <div className="card">
      <h4>{title}</h4>
      <p className="card-value">{value}</p>
    </div>
  );
}
