export async function predictMLConflict(train1, train2) {
  const res = await fetch("http://localhost:3000/api/predict-conflict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      train1_id: train1.train_id,
      train2_id: train2.train_id,
      cp1: 3,
      cp2: 2,
    }),
  });

  return await res.json();
}
