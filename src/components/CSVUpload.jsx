import { parseTrainCSV } from "../utils/parseTrainCSV";

export default function CSVUpload({ onLoad }) {
  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const trains = parseTrainCSV(reader.result);

      // ✅ Sort by arrival time (precedence)
      trains.sort((a, b) =>
        a.arrival_time.localeCompare(b.arrival_time)
      );

      onLoad(trains);
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        type="file"
        accept=".csv"
        onChange={handleFile}
        id="csv-upload"
        style={{
          position: "absolute",
          width: "0.1px",
          height: "0.1px",
          opacity: 0,
          overflow: "hidden",
          zIndex: -1
        }}
      />
      <label
        htmlFor="csv-upload"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 16px",
          background: "#1d6fa5",
          color: "white",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "600",
          border: "none",
          transition: "background 0.2s"
        }}
        onMouseEnter={(e) => e.target.style.background = "#155a88"}
        onMouseLeave={(e) => e.target.style.background = "#1d6fa5"}
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        Upload CSV
      </label>
    </div>
  );
}