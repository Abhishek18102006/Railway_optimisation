/**
 * Train Data Validator Component
 * Validates train data and shows helpful debug information
 * 
 * IMPORTANT: Save this file as trainDataValidator.jsx (not .js)
 */
export function TrainDataValidator({ trains }) {
  if (!trains || trains.length === 0) {
    return (
      <div style={{
        background: "#fef3c7",
        border: "1px solid #fbbf24",
        padding: "12px",
        borderRadius: "6px",
        marginBottom: "16px",
        color: "#92400e"
      }}>
        ⚠ No trains loaded. Please upload a CSV file.
      </div>
    );
  }

  const requiredFields = [
    'train_id',
    'train_name',
    'arrival_time',
    'priority',
    'max_speed',
    'block_id',
    'approach_dir',
    'delay',
    'status'
  ];

  const issues = [];
  
  trains.forEach((train, index) => {
    requiredFields.forEach(field => {
      if (train[field] === undefined || train[field] === null || train[field] === '') {
        issues.push({
          train: train.train_id || `Index ${index}`,
          field,
          value: train[field]
        });
      }
    });
  });

  if (issues.length === 0) {
    return (
      <div style={{
        background: "#d1fae5",
        border: "1px solid #34d399",
        padding: "12px",
        borderRadius: "6px",
        marginBottom: "16px",
        color: "#065f46"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>✅</span>
          <strong>All {trains.length} trains validated successfully</strong>
        </div>
        
        <details style={{ marginTop: "12px", fontSize: "12px" }}>
          <summary style={{ cursor: "pointer", fontWeight: "500" }}>
            📊 View sample train data
          </summary>
          <div style={{
            background: "#fff",
            padding: "10px",
            borderRadius: "4px",
            overflow: "auto",
            marginTop: "8px",
            maxHeight: "200px"
          }}>
            <div style={{ marginBottom: "8px", fontWeight: "600" }}>
              Sample: Train {trains[0].train_id}
            </div>
            <table style={{ fontSize: "11px", width: "100%" }}>
              <tbody>
                {Object.entries(trains[0]).map(([key, value]) => (
                  <tr key={key}>
                    <td style={{ 
                      padding: "2px 8px", 
                      fontWeight: "500",
                      color: "#064e3b" 
                    }}>
                      {key}:
                    </td>
                    <td style={{ padding: "2px 8px" }}>
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    );
  }

  return (
    <div style={{
      background: "#fee2e2",
      border: "2px solid #fca5a5",
      padding: "14px",
      borderRadius: "6px",
      marginBottom: "16px"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <span style={{ fontSize: "18px" }}>⚠</span>
        <strong style={{ color: "#b91c1c" }}>
          Data Validation Failed ({issues.length} issues found)
        </strong>
      </div>

      <p style={{ fontSize: "13px", color: "#7f1d1d", marginBottom: "12px" }}>
        Some trains are missing required fields. The conflict detection system may not work correctly.
      </p>

      <details style={{ fontSize: "13px" }}>
        <summary style={{ 
          cursor: "pointer", 
          fontWeight: "500",
          color: "#991b1b",
          marginBottom: "8px"
        }}>
          🔍 Show missing fields
        </summary>
        <div style={{ 
          background: "#fff", 
          padding: "10px", 
          borderRadius: "4px",
          marginTop: "8px",
          maxHeight: "200px",
          overflow: "auto"
        }}>
          <table style={{ width: "100%", fontSize: "12px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #fca5a5" }}>
                <th style={{ padding: "4px", textAlign: "left" }}>Train</th>
                <th style={{ padding: "4px", textAlign: "left" }}>Missing Field</th>
                <th style={{ padding: "4px", textAlign: "left" }}>Value</th>
              </tr>
            </thead>
            <tbody>
              {issues.slice(0, 20).map((issue, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #fecaca" }}>
                  <td style={{ padding: "4px" }}>{issue.train}</td>
                  <td style={{ padding: "4px", color: "#dc2626", fontWeight: "500" }}>
                    {issue.field}
                  </td>
                  <td style={{ padding: "4px", fontStyle: "italic", color: "#6b7280" }}>
                    {String(issue.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {issues.length > 20 && (
            <div style={{ 
              marginTop: "8px", 
              fontStyle: "italic",
              color: "#6b7280",
              textAlign: "center"
            }}>
              ... and {issues.length - 20} more issues
            </div>
          )}
        </div>
      </details>

      <div style={{
        marginTop: "12px",
        padding: "10px",
        background: "#fffbeb",
        borderRadius: "4px",
        fontSize: "12px",
        color: "#92400e"
      }}>
        💡 <strong>Tip:</strong> Make sure your parseTrainCSV.js is correctly initializing all required fields with default values.
      </div>
    </div>
  );
}