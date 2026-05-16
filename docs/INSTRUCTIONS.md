# INSTRUCTIONS — Weekly Health Dashboard Update

> Give this file to Claude (or any LLM with Apple Health access) every week.
> It will fetch your latest health data, update the dashboard, regenerate coaching insights, and log everything.

---

## 🎯 Purpose

You are a world-class health coach and data analyst. Every week, you will:

1. **Fetch** the latest 7 days of Apple Health data
2. **Append** the new data to `src/data/healthData.js`
3. **Recompute** coaching grades, insights, and action items
4. **Update** the `weekly-log.md` with a structured weekly entry
5. **Commit & push** all changes to the GitHub repo

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
- heartRate (daily average)
```

**Sleep processing rules:**
- Convert all UTC timestamps to **America/Los_Angeles** (PDT = UTC-7, PST = UTC-8)
- A "sleep session" starts at the earliest Awake/Core entry after 6 PM local time
- A "sleep session" ends at the last entry before 2 PM local time the next day
- Calculate: total hours, deep hours, REM hours, core hours, awake hours, bedtime (local)
- Ignore naps (sessions < 3 hours between 12 PM–6 PM)

### Step 2: Update `src/data/healthData.js`

**Append** new entries to each raw data array:
- `stepsRaw` — add new `{ date: "YYYY-MM-DD", steps: N }`
- `caloriesRaw` — add new `{ date: "YYYY-MM-DD", cal: N }`
- `distanceRaw` — add new `{ date: "YYYY-MM-DD", km: N.N }`
- `restingHRRaw` — add new `{ date: "YYYY-MM-DD", rhr: N }`
- `hrvRaw` — add new `{ date: "YYYY-MM-DD", hrv: N }`
- `sleepRaw` — add new `{ date: "YYYY-MM-DD", total: N.N, deep: N.N, rem: N.N, core: N.N, awake: N.N, bedtime: "HH:MM AM/PM" }`

**Update META:**
```js
export const META = {
  lastUpdated: "YYYY-MM-DD",     // today
  periodStart: "2026-04-16",      // keep original start
  periodEnd: "YYYY-MM-DD",        // new end date
  weekNumber: N,                   // increment by 1
  timezone: "America/Los_Angeles",
};
```

**Important:** Keep ALL historical data. Never delete old entries. The dashboard should always show the full history.

### Step 3: Recompute Coach Commentary

Update the `coachCommentary` object:

**Grading criteria:**
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

### Step 4: Update `weekly-log.md`

Append a new entry at the **top** of the log (most recent first) using this template:

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
- [List 1-3 genuine improvements or maintained good habits]

### ⚠️ Areas of Concern
- [List 1-3 regressions or persistent issues]

### 🎯 Grade Changes
- [List any grade changes from last week, e.g. "Step Consistency: C+ → B-"]

### 💬 Coach's Note
[2-3 paragraph personalized commentary. Be specific. Reference actual numbers.
Compare to previous weeks. Be encouraging but honest. End with the single
most important thing to focus on this coming week.]

### 📌 Updated Action Items
1. [Current priority actions, noting any that were resolved]
```

### Step 5: Commit & Push

```bash
git add -A
git commit -m "Weekly update — Week N — YYYY-MM-DD

- Steps avg: X (↑/↓ from Y)
- Sleep avg: X hrs (↑/↓ from Y)
- Deep sleep avg: X hrs
- RHR avg: X bpm
- [any notable changes]"
git push origin main
```

---

## 🔒 Rules & Guardrails

1. **Never delete historical data** — only append
2. **Always compare to previous week** — trends matter more than absolutes
3. **Be honest but encouraging** — don't sugarcoat problems, but always find something positive
4. **Keep the data file clean** — round steps to integers, distances to 1 decimal, times to 1 decimal
5. **Respect the grading rubric** — don't inflate or deflate grades
6. **Flag medical concerns** — if RHR suddenly spikes >20 bpm, sleep drops below 5h for 3+ nights, or HRV drops below 30ms, add a prominent warning suggesting the user consult a doctor
7. **Track the 14-day challenges** — note compliance % and whether goals were met
8. **UTC conversion** — always convert sleep times to local timezone before computing bedtime

---

## 🗂 File Structure Reference

```
abhi-health-coach/
├── src/
│   ├── data/
│   │   └── healthData.js    ← UPDATE THIS (data + commentary)
│   ├── App.jsx              ← Usually no changes needed
│   ├── main.jsx
│   └── index.css
├── docs/
│   └── INSTRUCTIONS.md      ← THIS FILE (do not modify)
├── weekly-log.md             ← APPEND TO THIS
├── README.md
├── package.json
└── vite.config.js
```

---

## 💡 Tips for Better Results

- Run this workflow **every Sunday morning** for consistency
- If Apple Health data is sparse for a day (e.g., watch not worn), note it in the log
- If the user mentions lifestyle changes (new gym routine, diet change, travel), document it in the coach's note for future reference
- The dashboard UI (`App.jsx`) auto-adapts to data length — no UI changes needed when appending data
