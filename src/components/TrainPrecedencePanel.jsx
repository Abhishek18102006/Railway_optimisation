import CSVUpload from "./CSVUpload";
import TrainCard from "./TrainCard";

export default function TrainPrecedencePanel({ trains, setTrains, onSelect }) {
  return (
    <div className="table-card">
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "16px" 
      }}>
        <h3 style={{ margin: 0 }}>Train Precedence</h3>
        <CSVUpload onLoad={setTrains} />
      </div>

      {trains.length === 0 ? (
        <div style={{
          background: "#fef3c7",
          border: "1px solid #fbbf24",
          padding: "20px",
          borderRadius: "8px",
          textAlign: "center",
          color: "#92400e"
        }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>📁</div>
          <p style={{ margin: 0, fontWeight: "500" }}>No train data uploaded</p>
          <p style={{ margin: "4px 0 0 0", fontSize: "14px" }}>
            Please upload a CSV file using the button above
          </p>
        </div>
      ) : (
        <div className="train-card-list">
          {trains.map((t, index) => (
            <TrainCard
              key={t.train_id}
              train={t}
              index={index + 1}
              onClick={() => onSelect(t)}
            />
          ))}
        </div>
      )}
    </div>
  );
}