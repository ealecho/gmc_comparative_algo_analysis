# Delivery Task Optimizer - Comparative Algorithm Analysis

**Author:** Alec Hoedwin (Kenya)  
**Language:** JavaScript (Node.js)  
**Date:** March 2026

---

## Problem Statement

A delivery platform backend receives a large number of delivery tasks, each with a **start time** and an **end time**. The goal is to select the **maximum number of non-overlapping tasks** a single delivery driver can perform.

Two candidate solutions are evaluated:

1. **Brute-Force** - explores all possible combinations of tasks
2. **Greedy (Earliest End Time)** - always picks the task that finishes soonest

---

## How to Run

```bash
node deliveryTaskOptimizer.js
```

The script runs correctness validation, performance benchmarks, and edge-case stress tests, then prints all results to the console.

---

## Sample Input

```javascript
const tasks = [
  { start: 1, end: 3 },
  { start: 2, end: 5 },
  { start: 4, end: 6 },
  { start: 6, end: 7 },
  { start: 5, end: 9 },
  { start: 8, end: 10 },
];
```

**Expected output:** 4 non-overlapping tasks selected - `[1,3], [4,6], [6,7], [8,10]`

Both algorithms return this same correct result.

---

## Algorithm Implementations

### 1. Brute-Force

Enumerates every possible subset of tasks (2^n subsets) using bitmask iteration. For each subset, it checks whether all tasks are mutually non-overlapping and tracks the largest valid subset found.

- **Time Complexity:** O(2^n * n)
- **Space Complexity:** O(2^n * n)
- **Practical Limit:** n <= ~25 tasks before execution time becomes unacceptable

### 2. Greedy (Activity Selection)

Sorts all tasks by end time in ascending order. Starting from the first task, it greedily picks the next task whose start time is greater than or equal to the end time of the last selected task.

- **Time Complexity:** O(n log n) - dominated by the sort
- **Space Complexity:** O(n) - for the sorted copy and result array

---

## Correctness Validation

Both algorithms were run on the sample input above. Results:

| Algorithm   | Tasks Selected | Result                              |
|-------------|----------------|-------------------------------------|
| Brute-Force | 4              | [1,3], [4,6], [6,7], [8,10]        |
| Greedy      | 4              | [1,3], [4,6], [6,7], [8,10]        |

Both return the same optimal answer.

---

## Performance Benchmarks

### Greedy Scaling (random tasks, time range 0-10,000)

| Input Size (n) | Tasks Selected | Time (ms) |
|---------------:|---------------:|----------:|
| 100            | ~78            | ~0.03     |
| 1,000          | ~350           | ~0.2      |
| 10,000         | ~1,130         | ~2.7      |
| 50,000         | ~2,490         | ~13       |
| 100,000        | ~3,500         | ~31       |

The greedy algorithm handles 100,000 tasks in about 31 ms. Comfortably real-time.

### Brute-Force Scaling (random tasks, time range 0-100)

| Input Size (n) | Tasks Selected | Time (ms) |
|---------------:|---------------:|----------:|
| 5              | 3              | ~0.07     |
| 10             | 3              | ~0.08     |
| 15             | 4              | ~5        |
| 18             | 6              | ~26       |
| 20             | 5              | ~93       |
| 22             | 4              | ~388      |

Execution time roughly doubles with each additional task. At n = 25, it takes several seconds. At n = 30, it would take minutes. At n = 10,000, it is physically impossible (2^10,000 subsets).

### Direct Comparison (same 20 tasks)

| Algorithm   | Time (ms) |
|-------------|----------:|
| Brute-Force | ~150      |
| Greedy      | ~0.08     |

The greedy algorithm is approximately **1,800x faster** even on just 20 tasks.

---

## Comparative Analysis

### Comparison Table

| Criterion       | Brute-Force              | Greedy (Earliest End)      |
|-----------------|--------------------------|----------------------------|
| Time            | O(2^n * n)               | O(n log n)                 |
| Space           | O(2^n) subsets tracked   | O(n) sorted copy           |
| Correctness     | Guaranteed optimal       | Guaranteed optimal*        |
| Scalability     | n <= ~25 feasible        | n = 1,000,000+ feasible    |
| Maintainability | Simple concept, but slow | Simple and fast             |
| Real-time ready | No                       | Yes                        |

\* The earliest-deadline-first greedy algorithm is **provably optimal** for the unweighted activity selection problem (see Cormen et al., *Introduction to Algorithms* (CLRS), Chapter 16).

### Which algorithm is faster for large inputs and why?

The greedy algorithm is overwhelmingly faster. It runs in O(n log n) time, dominated by a single sort, followed by one linear scan. The brute-force approach enumerates all 2^n subsets, which makes it infeasible beyond roughly 25 tasks. For 10,000 tasks the greedy finishes in single-digit milliseconds, while brute-force would require evaluating ~2^10,000 subsets - a number with over 3,000 digits - which is physically impossible.

### Which algorithm is easier to maintain and scale?

The greedy solution is easier on both counts. Its implementation is roughly 10 lines of logic (sort + single loop) versus the bitmask enumeration and subset validation of brute-force. Scaling is trivial: the greedy handles 100,000+ tasks in well under 100 ms. The brute-force cannot be meaningfully scaled without switching to a fundamentally different algorithm.

### What are the memory trade-offs?

Brute-force can consume enormous memory if you store subsets. Even with the bitmask approach (which avoids explicit storage of every subset), the inner loop must build candidate subsets, and the best-known subset must be retained. For n = 25, 2^25 = ~33 million iterations - acceptable - but growth is exponential. The greedy uses O(n) space for the sorted array and the result list, which is linear and predictable.

---

## Final Recommendation

**Use the Greedy (Earliest-End-Time) Algorithm.**

For a real-time delivery platform handling thousands of tasks per second, the greedy algorithm is the only viable choice:

1. **Provably Optimal** - For the unweighted interval scheduling (activity selection) problem, the earliest-deadline-first greedy strategy yields the mathematically maximum number of non-overlapping intervals. This is not a heuristic; it is a proven result.

2. **Performant** - O(n log n) time means 10,000 tasks complete in ~2-5 ms and 100,000 tasks in ~30-60 ms on typical hardware. This easily meets real-time throughput requirements.

3. **Memory-Efficient** - O(n) space with no recursion and no exponential blowup. This is predictable and container-friendly.

4. **Simple to Maintain** - The entire algorithm is a sort + a single for-loop. Any developer can understand, debug, and extend it.

### When might brute-force still be relevant?

- **Verification / Testing:** Brute-force is valuable as a correctness oracle for small inputs. You can compare greedy output against brute-force on inputs of size <= 20 in unit tests to gain high confidence.

- **Weighted Variants:** If tasks later gain priority scores (e.g., revenue per delivery) and the goal becomes maximizing total weight rather than count, the simple greedy no longer guarantees optimality. In that case dynamic programming - not brute-force - would be the correct approach (O(n^2) or O(n log n) with binary search).

- **Educational Purposes:** Brute-force clearly illustrates the combinatorial explosion and motivates why greedy/DP solutions exist.

---

## Bonus: Stress Test Results (Edge Cases)

Nine edge cases were tested. For inputs with n <= 25, both algorithms were run and their results compared. All matched.

| Edge Case                              | n      | Greedy Selected | Greedy Time (ms) | Brute-Force Time (ms) | Match |
|----------------------------------------|-------:|----------------:|------------------:|----------------------:|-------|
| All tasks overlapping (identical)      | 20     | 1               | ~0.06             | ~94                   | YES   |
| All tasks non-overlapping (sequential) | 20     | 20              | ~0.004            | ~110                  | YES   |
| All tasks share same start time        | 15     | 1               | ~0.004            | ~2.6                  | YES   |
| All tasks share same end time          | 15     | 1               | ~0.002            | ~2.6                  | YES   |
| Single task                            | 1      | 1               | ~0.001            | ~0.003                | YES   |
| Empty input                            | 0      | 0               | ~0.03             | ~0.001                | YES   |
| 10,000 fully overlapping               | 10,000 | 1               | ~0.16             | SKIPPED               | -     |
| 10,000 perfectly sequential            | 10,000 | 10,000          | ~0.22             | SKIPPED               | -     |
| Touching boundaries (start = prev end) | 20     | 20              | ~0.003            | ~110                  | YES   |

### Key observations from stress tests:

- **All overlapping:** Both correctly select exactly 1 task. The greedy does it instantly; brute-force still has to check all 2^20 (~1 million) subsets.
- **All non-overlapping:** Both correctly select all tasks. The greedy returns the full sorted list immediately. Brute-force still enumerates every subset despite the answer being obvious.
- **Same start/end times:** Both handle degenerate inputs correctly, selecting exactly 1 task when all tasks conflict.
- **Touching boundaries:** Tasks where `start === previous end` are correctly treated as non-overlapping (they do not conflict), so all 20 are selected.
- **Scaling failures:** Brute-force cannot run on any input with n > 25. The greedy handles 10,000 tasks in under 1 ms for these structured inputs.

Neither algorithm produces incorrect results on any edge case. The brute-force simply fails to scale.
