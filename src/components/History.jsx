export default function History({ trains }) {
  const clearedTrains = trains.filter(t => t.cleared);

  return (
    <div className="table-card">
      <h3>Train History</h3>

      {clearedTrains.length === 0 ? (
        <p>No cleared trains yet</p>
      ) : (
        clearedTrains.map(t => (
          <div
            key={t.train_id}
            style={{
              background: "#f3f4f6",
              padding: 10,
              borderRadius: 6,
              marginBottom: 6
            }}
          >
            🚆 {t.train_id} — {t.train_name}
          </div>
        ))
      )}
    </div>
  );
}
