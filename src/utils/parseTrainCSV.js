/**
 * Enhanced CSV Parser that automatically maps
 * your passenger/distance data to priority levels
 */

export function parseTrainCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim());

  return lines.slice(1).map(row => {
    const values = row.split(",");
    const data = {};

    headers.forEach((h, i) => {
      data[h] = values[i]?.trim() || "";
    });

    // ==============================
    // AUTO-CALCULATE PRIORITY
    // ==============================
    const passengers = Number(data.passengers) || 0;
    const distance = Number(data.distance_km) || 0;
    const isPeak = Number(data.is_peak_hour) || 0;
    
    let priority = 1; // Default: Local
    
    // Base priority on passengers
    if (passengers > 900) {
      priority = 4; // Premium
    } else if (passengers > 700) {
      priority = 3; // Express
    } else if (passengers > 400) {
      priority = 2; // Passenger
    }
    
    // Boost for peak hour
    if (isPeak === 1 && priority < 4) {
      priority += 1;
    }
    
    // Boost for long distance
    if (distance > 500 && priority < 4) {
      priority += 1;
    }
    
    priority = Math.min(priority, 4); // Cap at 4

    // ==============================
    // AUTO-CALCULATE MAX SPEED
    // ==============================
    const capacity = Number(data.train_capacity) || 800;
    let maxSpeed = 60;
    
    if (priority === 4) {
      maxSpeed = 130;
    } else if (priority === 3) {
      maxSpeed = 110;
    } else if (priority === 2) {
      maxSpeed = 90;
    }

    // ==============================
    // AUTO-ASSIGN ARRIVAL TIME
    // ==============================
    // If no arrival_time in CSV, generate based on train_id
    let arrivalTime = data.arrival_time;
    if (!arrivalTime) {
      const trainId = Number(data.train_id) || 0;
      const hour = 6 + Math.floor((trainId - 201) * 2); // Spread across day
      const minute = ((trainId - 201) * 15) % 60;
      arrivalTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }

    // ==============================
    // AUTO-ASSIGN BLOCK DATA
    // ==============================
    const trainId = Number(data.train_id) || 0;
    
    // CRITICAL FIX: Make trains share blocks for realistic conflicts
    // Strategy: Trains traveling in similar time windows should share blocks
    const hour = Number(arrivalTime.split(':')[0]) || 6;
    
    // Time-based block assignment (creates natural conflicts)
    let blockId;
    if (hour >= 6 && hour < 10) {
      blockId = "BLK_A"; // Morning rush
    } else if (hour >= 10 && hour < 14) {
      blockId = "BLK_B"; // Midday
    } else if (hour >= 14 && hour < 18) {
      blockId = "BLK_A"; // Evening rush (same as morning - HIGH CONFLICT ZONE)
    } else {
      blockId = "BLK_C"; // Night
    }
    
    // Direction based on UP/DOWN pattern (creates opposing conflicts)
    const approachDir = (trainId % 2 === 1) ? "UP" : "DOWN";
    
    // Lower priority trains use LOOP line
    const line = priority <= 2 ? "LOOP" : "MAIN";

    // ==============================
    // RETURN ENRICHED TRAIN OBJECT
    // ==============================
    return {
      // Basic identification
      train_id: String(data.train_id),
      train_name: data.train_name || "Unknown Train",
      
      // Original data from CSV
      passengers: passengers,
      distance_km: distance,
      travel_time_hr: Number(data.travel_time_hr) || 0,
      train_capacity: capacity,
      is_peak_hour: isPeak,
      
      // Calculated fields for AI model
      source: data.source || "AUTO",
      destination: data.destination || "AUTO",
      arrival_time: arrivalTime,
      departure_time: data.departure_time || arrivalTime,
      train_type: getPriorityLabel(priority),
      priority: priority,
      max_speed: maxSpeed,
      
      // Conflict detection fields (CRITICAL - must be present)
      block_id: blockId,
      approach_dir: approachDir,
      line: line,
      clearance_min: 3,
      current_block: blockId,
      next_block: null,
      
      // Runtime state (CRITICAL - must initialize all fields)
      delay: 0,
      status: "ON TIME",
      conflict: false,
      conflict_reason: null,
      cleared: false
    };
  });
}

/**
 * Helper function to display priority levels
 */
export function getPriorityLabel(priority) {
  const labels = {
    1: "Local",
    2: "Passenger",
    3: "Express",
    4: "Premium"
  };
  return labels[priority] || "Unknown";
}

/**
 * Helper function to get priority color
 */
export function getPriorityColor(priority) {
  const colors = {
    1: "#16a34a",  // Green
    2: "#d97706",  // Orange
    3: "#0284c7",  // Blue
    4: "#dc2626"   // Red
  };
  return colors[priority] || "#64748b";
}