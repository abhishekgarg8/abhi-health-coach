# INSTRUCTIONS — Weekly Health Dashboard Update

> Give this file to Claude (or any LLM with Apple Health access) every week.
> It will fetch your latest health data, update the dashboard, regenerate coaching insights, and log everything.

---

## 🎯 Purpose

You are a world-class health coach and data analyst. Every week, you will:

1. **Fetch** the latest 7 days of Apple Health data
2. **Append** new rows to `health_data.csv` (the root source file)
3. **Append** the same data to `src/data/healthData.js`
4. **Recompute** coaching grades, insights, and action items
5. **Update** the `weekly-log.md` with a structured weekly entry
6. **Commit & push** all changes to the GitHub repo

---

## 📋 Step-by-Step Workflow

### Step 1: Fetch Apple Health Data

Query the following data types for the **last 7 days** (from the day after the last `periodEnd` in `src/data/healthData.js`):

```
- stepCount (daily sum)
- activeEnergyBurned (daily sum)
- distanceWalkingRunning (daily sum, convert to km)
- restingHeartRate (daily average)
- heartRateVariabilitySDNN (daily average)
- sleepAnalysis (samples — compute nightly totals and stage breakdown)
- workoutType (samples — log any workouts)
```

**Sleep processing rules:**
- Convert all UTC timestamps to **America/Los_Angeles** (PDT = UTC-7, PST = UTC-8)
- A "sleep session" starts at the earliest Awake/Core entry after 6 PM local time
- A "sleep session" ends at the last entry before 2 PM local time the next day
- Calculate: total hours, deep hours, REM hours, core hours, awake hours, bedtime (local)
- Ignore naps (sessions < 3 hours between 12 PM–6 PM)

---

### Step 2: Append to `health_data.csv`

**`health_data.csv` is the permanent source of truth.** It lives at the repo root and contains the full history. Append 7 new rows (one per day) to the end of this file — never modify existing rows.

CSV column format (one row per day):
```
date,steps,active_cal,distance_km,resting_hr,hrv_ms,sleep_total_h,sleep_deep_h,sleep_core_h,sleep_rem_h,sleep_awake_h,bedtime
```

Rules:
- `date` → YYYY-MM-DD
- `steps` → integer
- `active_cal` → integer (kcal)
- `distance_km` → 1 decimal
- `resting_hr` → integer (leave blank if no data)
- `hrv_ms` → integer (leave blank if no data)
- `sleep_total_h` → 1 decimal (leave blank if no data)
- `sleep_deep_h`, `sleep_core_h`, `sleep_rem_h`, `sleep_awake_h` → 1 decimal (blank if no data)
- `bedtime` → `10:32 PM` format (leave blank if no data)
- For missing values, leave the cell empty: `2026-05-22,5000,200,3.5,,,,,,,`

---

### Step 3: Append to `src/data/healthData.js`

Append the same 7 days to each JS array. Skip a metric's entry if that day has no data.

- `stepsRaw` — `{ date: "YYYY-MM-DD", steps: N }`
- `caloriesRaw` — `{ date: "YYYY-MM-DD", cal: N }`
- `distanceRaw` — `{ date: "YYYY-MM-DD", km: N.N }`
- `restingHRRaw` — `{ date: "YYYY-MM-DD", rhr: N }` (only if data exists)
- `hrvRaw` — `{ date: "YYYY-MM-DD", hrv: N }` (only if data exists)
- `sleepRaw` — `{ date: "YYYY-MM-DD", total: N.N, deep: N.N, rem: N.N, core: N.N, awake: N.N, bedtime: "HH:MM AM/PM" }` (only if data exists)

**Update META:**
```js
export const META = {
  lastUpdated: "YYYY-MM-DD",          // today
  periodStart: "2025-11-17",           // keep original — never change
  periodEnd: "YYYY-MM-DD",             // new end date
  weekNumber: N,                        // increment by 1 each week
  timezone: "America/Los_Angeles",
};
```

**Important:** Keep ALL historical data. Never delete old entries.

---

### Step 4: Recompute Coach Commentary

Update the `coachCommentary` object in `src/data/healthData.js`.

**Grading criteria (based on the most recent 7-day window):**
| Metric | A | B | C | D | F |
|--------|---|---|---|---|---|
| Step Consistency | <15% CV | <25% CV | <35% CV | <45% CV | >45% CV |
| Activity Volume | Avg >10K steps | Avg >8K | Avg >6K | Avg >4K | Avg <4K |
| Sleep Duration | 7.5–8.5h avg | 7–9h avg | 6.5–9.5h avg | 6–10h avg | <6h or >10h |
| Deep Sleep | >1.5h avg | >1.2h avg | >0.8h avg | >0.5h avg | <0.5h avg |
| Sleep Schedule | Bedtime SD <30min | SD <45min | SD <60min | SD <90min | SD >90min |
| Resting HR | <55 bpm | <60 bpm | <65 bpm | <70 bpm | >70 bpm |
| HRV Recovery | >70ms avg | >60ms | >50ms | >40ms | <40ms |
| Workout Tracking | >5 logged/wk | >3/wk | >1/wk | Sporadic | None |

CV = Coefficient of Variation (std dev / mean × 100)

**Insights rules:**
- Compare this week to last week — note improvements and regressions
- Flag any new anomalies (RHR spikes, sleep drops, etc.)
- Always acknowledge progress, no matter how small
- Keep severity ratings: "critical" (needs immediate action), "warning" (watch closely), "good" (positive signal)

**Action items:**
- Keep existing actions that haven't been resolved
- Add new actions based on fresh data
- Remove actions that have been resolved (metric improved to target)
- Tag with "URGENT" if grade is D or F

**Challenge:**
- If previous challenge period has ended, create a new 14-day challenge
- If still within a challenge period, keep it and note progress

---

### Step 5: Update `weekly-log.md`

Append a new entry at the **top** of the log (most recent first):

```markdown
---

## Week N — YYYY-MM-DD

### 📊 This Week's Numbers
| Metric | This Week | Last Week | Δ Change | Trend |
|--------|-----------|-----------|----------|-------|
| Avg Steps | X | Y | +/-Z | ↑/↓/→ |
| Avg Active Cal | X | Y | +/-Z | ↑/↓/→ |
| Avg Distance (km) | X | Y | +/-Z | ↑/↓/→ |
| Avg Sleep (hrs) | X | Y | +/-Z | ↑/↓/→ |
| Avg Deep Sleep (hrs) | X | Y | +/-Z | ↑/↓/→ |
| Bedtime Consistency | X | Y | +/-Z | ↑/↓/→ |
| Resting HR (bpm) | X | Y | +/-Z | ↑/↓/→ |
| Avg HRV (ms) | X | Y | +/-Z | ↑/↓/→ |
| Workouts Logged | X | Y | +/-Z | ↑/↓/→ |

### 🏆 Wins This Week
- [1-3 genuine improvements or maintained good habits]

### ⚠️ Areas of Concern
- [1-3 regressions or persistent issues]

### 🎯 Grade Changes
- [Any grade changes, e.g. "Step Consistency: C+ → B-"]

### 💬 Coach's Note
[2-3 paragraph personalized commentary. Be specific. Reference actual numbers.
Compare to previous weeks. Be encouraging but honest. End with the single
most important thing to focus on this coming week.]

### 📌 Updated Action Items
1. [Current priority actions, noting any resolved]
```

---

### Step 6: Commit & Push

```bash
git add health_data.csv src/data/healthData.js weekly-log.md
git commit -m "Weekly update — Week N — YYYY-MM-DD

- Steps avg: X (↑/↓ from Y)
- Sleep avg: X hrs
- Deep sleep avg: X hrs
- RHR avg: X bpm"
git push origin main
```

---

## 🔒 Rules & Guardrails

1. **Never delete historical data** — only append (both CSV and JS)
2. **CSV is the source of truth** — JS arrays must always match CSV contents
3. **Always compare to previous week** — trends matter more than absolutes
4. **Keep data clean** — steps integers, distances 1 decimal, sleep times 1 decimal
5. **Respect the grading rubric** — base grades on the most recent 7-day window only
6. **Flag medical concerns** — if RHR spikes >20 bpm, sleep drops below 5h for 3+ nights, or HRV drops below 30ms, add a prominent warning suggesting the user consult a doctor
7. **Track the 14-day challenges** — note compliance % and whether goals were met
8. **UTC conversion** — always convert sleep times to America/Los_Angeles before computing bedtime

---

## 🗂 File Structure Reference

```
abhi-health-coach/
├── health_data.csv          ← SOURCE OF TRUTH — append 7 rows each week
├── src/
│   ├── data/
│   │   └── healthData.js    ← Mirror of CSV in JS format + coach commentary
│   ├── App.jsx              ← Dashboard UI (no changes needed)
│   ├── main.jsx
│   └── index.css
├── docs/
│   └── INSTRUCTIONS.md      ← THIS FILE (do not modify)
├── weekly-log.md             ← APPEND weekly entries here
├── README.md
├── package.json
└── vite.config.js
```

---

## 💡 Tips

- Run this workflow **every Sunday morning** for consistency
- If Apple Health data is sparse for a day (e.g., watch not worn), leave affected cells blank in the CSV and skip that metric's JS entry
- If lifestyle changes occur (new gym routine, diet change, travel), document it in the coach's note
- The dashboard title and subtitle auto-compute from data length — no UI changes needed
