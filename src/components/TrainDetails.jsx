export default function TrainDetails({ train }) {
  if (!train) {
    return (
      <div className="train-details empty">
        Select a train to view details
      </div>
    );
  }

  return (
    <div className="train-details">
      <h3>Train Details</h3>

      <div className="detail-row">
        <label>Train No</label>
        <span>{train.id}</span>
      </div>

      <div className="detail-row">
        <label>Name</label>
        <span>{train.name}</span>
      </div>

      <div className="detail-row">
        <label>Route</label>
        <span>{train.from} → {train.to}</span>
      </div>

      <div className="detail-row">
        <label>Current Block</label>
        <span>{train.block}</span>
      </div>

      <div className="detail-row">
        <label>Priority</label>
        <span>{train.priority}</span>
      </div>

      <div className="detail-row">
        <label>Status</label>
        <span>{train.status}</span>
      </div>

      <div className="detail-row">
        <label>Delay</label>
        <span>{train.delay} min</span>
      </div>
    </div>
  );
}
