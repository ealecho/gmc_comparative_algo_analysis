// =============================================================================
// Delivery Task Optimizer — Comparative Algorithm Analysis
// =============================================================================
// Problem: Select the maximum number of non-overlapping delivery tasks
//          a single driver can perform.
//
// Two approaches:
//   1. Brute-Force  — explores every subset of tasks (exponential)
//   2. Greedy       — picks the task that ends earliest (polynomial)
// =============================================================================

"use strict";

// ---------------------------------------------------------------------------
// 1. ALGORITHM IMPLEMENTATIONS
// ---------------------------------------------------------------------------

/**
 * Brute-Force: explore all 2^n subsets and return the largest set of
 * mutually non-overlapping tasks.
 *
 * Time complexity:  O(2^n * n)   — generate every subset, check validity
 * Space complexity: O(2^n * n)   — store the best subset found so far
 *
 * NOTE: This is intentionally capped at n <= 25 to avoid hanging the process.
 */
function bruteForceMaxTasks(tasks) {
  const n = tasks.length;
  if (n === 0) return [];
  if (n > 25) {
    throw new Error(
      `Brute-force is infeasible for ${n} tasks (2^${n} subsets). ` +
        `Limit input to <= 25 tasks.`
    );
  }

  // Sort by end time so we can check overlaps efficiently within subsets
  const sorted = tasks
    .map((t, i) => ({ ...t, originalIndex: i }))
    .sort((a, b) => a.end - b.end);

  let bestSubset = [];

  // Iterate over every possible subset using a bitmask
  const totalSubsets = 1 << n; // 2^n

  for (let mask = 1; mask < totalSubsets; mask++) {
    const subset = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        subset.push(sorted[i]);
      }
    }

    // Check if all tasks in this subset are non-overlapping
    if (isNonOverlapping(subset) && subset.length > bestSubset.length) {
      bestSubset = subset;
    }
  }

  return bestSubset.map(({ start, end }) => ({ start, end }));
}

/** Returns true when every consecutive pair in the (sorted) list is compatible. */
function isNonOverlapping(sortedTasks) {
  for (let i = 1; i < sortedTasks.length; i++) {
    if (sortedTasks[i].start < sortedTasks[i - 1].end) {
      return false;
    }
  }
  return true;
}

/**
 * Greedy (Activity Selection): sort by end time, always pick the next task
 * whose start time >= the end time of the last selected task.
 *
 * Time complexity:  O(n log n)  — dominated by the sort
 * Space complexity: O(n)        — for the sorted copy + result array
 */
function greedyMaxTasks(tasks) {
  if (tasks.length === 0) return [];

  // Sort tasks by end time (ascending); break ties by start time (ascending)
  const sorted = [...tasks].sort((a, b) => a.end - b.end || a.start - b.start);

  const selected = [sorted[0]];
  let lastEnd = sorted[0].end;

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].start >= lastEnd) {
      selected.push(sorted[i]);
      lastEnd = sorted[i].end;
    }
  }

  return selected.map(({ start, end }) => ({ start, end }));
}

// ---------------------------------------------------------------------------
// 2. VALIDATION — run both on the sample input
// ---------------------------------------------------------------------------

const sampleTasks = [
  { start: 1, end: 3 },
  { start: 2, end: 5 },
  { start: 4, end: 6 },
  { start: 6, end: 7 },
  { start: 5, end: 9 },
  { start: 8, end: 10 },
];

console.log("=".repeat(70));
console.log("SECTION 1 — CORRECTNESS VALIDATION (sample input)");
console.log("=".repeat(70));
console.log("\nInput tasks:");
console.table(sampleTasks);

const bfResult = bruteForceMaxTasks(sampleTasks);
const greedyResult = greedyMaxTasks(sampleTasks);

console.log("\nBrute-Force result (%d tasks selected):", bfResult.length);
console.table(bfResult);

console.log("\nGreedy result (%d tasks selected):", greedyResult.length);
console.table(greedyResult);

const resultsMatch = bfResult.length === greedyResult.length;
console.log(
  "\nBoth algorithms agree on maximum count: %s  (count = %d)",
  resultsMatch ? "YES" : "NO",
  greedyResult.length
);

// ---------------------------------------------------------------------------
// 3. BENCHMARKING — large random input (~10,000 tasks)
// ---------------------------------------------------------------------------

/** Generate `count` random tasks in the time range [0, maxTime). */
function generateRandomTasks(count, maxTime = 10000) {
  const tasks = [];
  for (let i = 0; i < count; i++) {
    const start = Math.floor(Math.random() * maxTime);
    const duration = 1 + Math.floor(Math.random() * 50); // 1-50 units
    tasks.push({ start, end: start + duration });
  }
  return tasks;
}

/** High-resolution timer helper. Returns elapsed milliseconds. */
function timeExecution(fn) {
  const start = performance.now();
  const result = fn();
  const elapsed = performance.now() - start;
  return { result, elapsed };
}

console.log("\n" + "=".repeat(70));
console.log("SECTION 2 — PERFORMANCE BENCHMARK");
console.log("=".repeat(70));

// --- Greedy on 10,000 tasks ---
const largeTasks = generateRandomTasks(10_000);
console.log("\nGenerated 10,000 random tasks for benchmarking.\n");

const greedyBench = timeExecution(() => greedyMaxTasks(largeTasks));
console.log(
  "Greedy  — selected %d tasks in %s ms",
  greedyBench.result.length,
  greedyBench.elapsed.toFixed(3)
);

// --- Brute-force on manageable size (20 tasks) to show exponential cost ---
const smallTasks = generateRandomTasks(20);
const bfBench = timeExecution(() => bruteForceMaxTasks(smallTasks));
console.log(
  "Brute-Force (20 tasks) — selected %d tasks in %s ms",
  bfBench.result.length,
  bfBench.elapsed.toFixed(3)
);

// --- Greedy on the same 20 tasks for a fair comparison ---
const greedySmallBench = timeExecution(() => greedyMaxTasks(smallTasks));
console.log(
  "Greedy  (20 tasks) — selected %d tasks in %s ms",
  greedySmallBench.result.length,
  greedySmallBench.elapsed.toFixed(3)
);

// --- Show scaling for greedy ---
console.log("\nGreedy scaling across input sizes:");
for (const size of [100, 1_000, 10_000, 50_000, 100_000]) {
  const tasks = generateRandomTasks(size);
  const { result, elapsed } = timeExecution(() => greedyMaxTasks(tasks));
  console.log(
    "  n = %s → %d tasks selected in %s ms",
    String(size).padStart(7),
    result.length,
    elapsed.toFixed(3)
  );
}

// --- Show scaling for brute-force on small sizes ---
console.log("\nBrute-Force scaling (watch it explode):");
for (const size of [5, 10, 15, 18, 20, 22]) {
  const tasks = generateRandomTasks(size, 100);
  const { result, elapsed } = timeExecution(() => bruteForceMaxTasks(tasks));
  console.log(
    "  n = %d → %d tasks selected in %s ms",
    size,
    result.length,
    elapsed.toFixed(3)
  );
}

// ---------------------------------------------------------------------------
// 4. COMPARATIVE ANALYSIS & RECOMMENDATION
// ---------------------------------------------------------------------------
// Full written analysis is in README.md

console.log("\n" + "=".repeat(70));
console.log("SECTION 3 — COMPARATIVE ANALYSIS & RECOMMENDATION");
console.log("=".repeat(70));
console.log("\nSee README.md for the full written analysis, comparison,");
console.log("and final recommendation.\n");

// ---------------------------------------------------------------------------
// 6. BONUS — STRESS TESTS (Edge Cases)
// ---------------------------------------------------------------------------

console.log("=".repeat(70));
console.log("SECTION 5 (BONUS) — STRESS TESTS / EDGE CASES");
console.log("=".repeat(70));

function runEdgeCase(label, tasks) {
  console.log(`\n--- ${label} (${tasks.length} tasks) ---`);
  if (tasks.length <= 10) console.table(tasks);

  // Greedy
  const g = timeExecution(() => greedyMaxTasks(tasks));
  console.log(
    "  Greedy:      %d selected in %s ms",
    g.result.length,
    g.elapsed.toFixed(3)
  );

  // Brute-force only if small enough
  if (tasks.length <= 25) {
    const b = timeExecution(() => bruteForceMaxTasks(tasks));
    console.log(
      "  Brute-Force: %d selected in %s ms",
      b.result.length,
      b.elapsed.toFixed(3)
    );
    const match = g.result.length === b.result.length;
    console.log("  Results match: %s", match ? "YES" : "NO");
  } else {
    console.log("  Brute-Force: SKIPPED (input too large)");
  }
}

// Edge Case 1: All tasks overlap (every task covers the same interval)
const allOverlapping = Array.from({ length: 20 }, () => ({
  start: 0,
  end: 10,
}));
runEdgeCase("All tasks overlapping (identical intervals)", allOverlapping);

// Edge Case 2: All tasks non-overlapping (perfectly sequential)
const allNonOverlapping = Array.from({ length: 20 }, (_, i) => ({
  start: i * 10,
  end: i * 10 + 5,
}));
runEdgeCase("All tasks non-overlapping (sequential)", allNonOverlapping);

// Edge Case 3: Tasks with identical start times
const sameStart = Array.from({ length: 15 }, (_, i) => ({
  start: 0,
  end: i + 1,
}));
runEdgeCase("All tasks share the same start time", sameStart);

// Edge Case 4: Tasks with identical end times
const sameEnd = Array.from({ length: 15 }, (_, i) => ({
  start: i,
  end: 20,
}));
runEdgeCase("All tasks share the same end time", sameEnd);

// Edge Case 5: Single task
runEdgeCase("Single task", [{ start: 3, end: 7 }]);

// Edge Case 6: Empty input
runEdgeCase("Empty input (no tasks)", []);

// Edge Case 7: Large-scale all-overlapping (greedy only)
const largeOverlapping = Array.from({ length: 10_000 }, () => ({
  start: 0,
  end: 100,
}));
runEdgeCase("10,000 fully overlapping tasks", largeOverlapping);

// Edge Case 8: Large-scale all non-overlapping (greedy only)
const largeSequential = Array.from({ length: 10_000 }, (_, i) => ({
  start: i * 2,
  end: i * 2 + 1,
}));
runEdgeCase("10,000 perfectly sequential tasks", largeSequential);

// Edge Case 9: Tasks where start === end of previous (boundary touching)
const touching = Array.from({ length: 20 }, (_, i) => ({
  start: i * 5,
  end: (i + 1) * 5,
}));
runEdgeCase("Tasks with touching boundaries (start === prev end)", touching);

console.log("\n" + "=".repeat(70));
console.log("ALL TESTS AND BENCHMARKS COMPLETE");
console.log("=".repeat(70));
