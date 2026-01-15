// src/utils/aiResolver.js

export async function resolveConflictAI(conflict, trains) {
  try {
    console.log("🔍 Conflict received:", conflict);
    
    // Extract train data based on conflict structure
    let priorityTrain, affectedTrain;
    
    if (conflict.priority && conflict.affected) {
      priorityTrain = conflict.priority;
      affectedTrain = conflict.affected;
    } else if (conflict.trainA && conflict.trainB) {
      priorityTrain = trains.find(t => t.train_id === conflict.trainA);
      affectedTrain = trains.find(t => t.train_id === conflict.trainB);
    } else if (conflict.leadingTrain && conflict.followingTrain) {
      priorityTrain = trains.find(t => t.train_id === conflict.leadingTrain);
      affectedTrain = trains.find(t => t.train_id === conflict.followingTrain);
    } else {
      throw new Error("Unknown conflict structure");
    }

    if (!priorityTrain || !affectedTrain) {
      throw new Error("Could not find train data for conflict");
    }

    // Build payload with all required fields + defaults
    const payload = {
      priority_train: priorityTrain.train_id || priorityTrain,
      affected_train: affectedTrain.train_id || affectedTrain,
      passengers: Number(affectedTrain.passengers) || 600,
      distance_km: Number(affectedTrain.distance_km) || 300,
      travel_time_hr: Number(affectedTrain.travel_time_hr) || 5.0,
      train_capacity: Number(affectedTrain.train_capacity) || 800,
      is_peak_hour: Number(affectedTrain.is_peak_hour) || 0
      // NO delay field needed!
    };

    console.log("📤 Sending to AI:", payload);

    const res = await fetch("http://localhost:5000/ai-suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log("🤖 AI Response:", data);

    if (!data.success) {
      throw new Error(data.error || "AI returned unsuccessful response");
    }

    return data;

  } catch (err) {
    console.error("❌ AI RESOLUTION FAILED:", err);
    return {
      success: false,
      error: err.message,
      decision: "MANUAL_INTERVENTION",
      reason: "AI resolution failed, manual intervention required"
    };
  }
}