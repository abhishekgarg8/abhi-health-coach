# 🏥 Abhi Health Coach

A personal health intelligence dashboard powered by Apple Health data, with AI-generated coaching commentary updated weekly.

## 🚀 Quick Start

```bash
npm install
npm run dev       # dev server
npm run build     # production build
```

## 📊 What It Tracks

| Category | Metrics |
|----------|---------|
| **Activity** | Steps, Active Calories, Walking/Running Distance |
| **Sleep** | Total Duration, Deep/Core/REM/Awake Stages, Bedtime |
| **Heart** | Resting Heart Rate, Heart Rate Variability (HRV) |
| **Coaching** | Weekly Grades, Insights, Action Items, 14-Day Challenges |

## 🏗 Architecture

```
src/
├── data/
│   └── healthData.js    ← All health data + coach commentary (updated weekly)
├── App.jsx              ← Dashboard UI (auto-adapts to data length)
├── main.jsx
└── index.css
```

**Key design decision:** Data is fully separated from UI. The weekly LLM update only touches `src/data/healthData.js` and `weekly-log.md` — the dashboard UI automatically adapts to any amount of data.

## 🔄 Weekly Update Workflow

Every week, give `docs/INSTRUCTIONS.md` to Claude (with Apple Health access):

1. It fetches the last 7 days of Apple Health data
2. Appends new data to `src/data/healthData.js`
3. Recomputes coaching grades and insights
4. Appends a structured entry to `weekly-log.md`
5. Commits and pushes to this repo

See [`docs/INSTRUCTIONS.md`](docs/INSTRUCTIONS.md) for the full LLM prompt.

## 🌐 Deploy on Vercel

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the `abhi-health-coach` repo
4. Framework: **Vite** (auto-detected)
5. Click **Deploy**

Every `git push` to `main` auto-deploys.

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/data/healthData.js` | All raw health data + coach commentary |
| `docs/INSTRUCTIONS.md` | LLM prompt for weekly updates |
| `weekly-log.md` | Chronological weekly health reports |

## ⚠️ Disclaimer

This dashboard provides general wellness guidance based on Apple Health data. It is not a substitute for professional medical advice.
