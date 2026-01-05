export function parseTrainCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");

  return lines.slice(1).map(row => {
    const values = row.split(",");

    const data = {};
    headers.forEach((h, i) => {
      data[h.trim()] = values[i]?.trim() || "";
    });

    return {
      train_id: data.train_id,
      train_name: data.train_name,
      source: data.source,
      destination: data.destination,
      arrival_time: data.arrival_time,
      departure_time: data.departure_time,
      train_type: data.train_type,
      priority: Number(data.priority),

      // 🔧 DEFAULT OPERATIONAL FIELDS
      status: "ON TIME",
      delay: 0,
      line_type: "UP",
      direction: "UP"
    };
  });
}
