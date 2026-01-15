// src/utils/loopLineDetector.js

function effectiveArrival(train) {
  return Number(train.arrival || 0);
}

export function detectLoopLineConflicts(trains) {
  const conflicts = [];

  const sorted = [...trains]
    .filter(t => t.block_id !== undefined)
    .sort((a, b) => effectiveArrival(a) - effectiveArrival(b));

  for (let i = 0; i < sorted.length - 1; i++) {
    const lead = sorted[i];
    const follow = sorted[i + 1];

    if (lead.block_id !== follow.block_id) continue;

    const gap =
      effectiveArrival(follow) -
      (effectiveArrival(lead) + (lead.delay || 0));

    if (gap < 5) {
      conflicts.push({
        type: "LOOP_LINE",
        block_id: lead.block_id,
        leadingTrain: lead.train_id,
        followingTrain: follow.train_id,
        timeDiff: gap
      });
    }
  }

  return conflicts;
}
