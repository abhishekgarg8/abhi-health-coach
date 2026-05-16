import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart, Cell, ReferenceLine, Legend,
} from "recharts";
import {
  stepsRaw, caloriesRaw, distanceRaw, restingHRRaw, hrvRaw, sleepRaw,
  coachCommentary, computeStats, META,
} from "./data/healthData";

// ─── FORMATTERS ────────────────────────────────────────────────────────
const fmt = (d) => {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const stepsData = stepsRaw.map((d) => ({ ...d, label: fmt(d.date) }));
const caloriesData = caloriesRaw.map((d) => ({ ...d, label: fmt(d.date) }));
const distanceData = distanceRaw.map((d) => ({ ...d, label: fmt(d.date) }));
const rhrData = restingHRRaw.map((d) => ({ ...d, label: fmt(d.date) }));
const hrvData = hrvRaw.map((d) => ({ ...d, label: fmt(d.date) }));
const sleepStages = sleepRaw.map((d) => ({
  label: fmt(d.date),
  deep: d.deep,
  core: d.core,
  rem: d.rem,
  awake: d.awake,
  total: d.total,
  bedtime: d.bedtime,
}));

const stats = computeStats();

// ─── SHARED UI ─────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const units = { steps: " steps", cal: " kcal", km: " km", rhr: " bpm", hrv: " ms", deep: "h", core: "h", rem: "h", awake: "h", total: "h" };
  return (
    <div style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#e0e0e0" }}>
      <p style={{ margin: 0, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: 0, color: p.color || p.fill || "#ccc" }}>
          {p.name}: <strong>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</strong>
          {units[p.dataKey] || ""}
        </p>
      ))}
    </div>
  );
};

const StatCard = ({ label, value, unit, color, subtext, icon }) => (
  <div style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)", borderRadius: 16, padding: "20px 18px", border: `1px solid ${color}22`, position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 10, right: 14, fontSize: 28, opacity: 0.15 }}>{icon}</div>
    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "#8892b0", marginBottom: 6, fontFamily: "monospace" }}>{label}</div>
    <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>{value}<span style={{ fontSize: 14, fontWeight: 400, marginLeft: 4, color: "#8892b0" }}>{unit}</span></div>
    {subtext && <div style={{ fontSize: 11, color: "#5a6a8a", marginTop: 6 }}>{subtext}</div>}
  </div>
);

const SectionTitle = ({ number, title, subtitle }) => (
  <div style={{ marginBottom: 24, marginTop: 48 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
      <span style={{ background: "linear-gradient(135deg,#e94560,#c23152)", color: "#fff", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, fontFamily: "monospace" }}>{number}</span>
      <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#e0e0e0", letterSpacing: "-0.02em" }}>{title}</h2>
    </div>
    <p style={{ margin: "0 0 0 44px", fontSize: 13, color: "#5a6a8a" }}>{subtitle}</p>
  </div>
);

const ChartCard = ({ title, children, height = 260 }) => (
  <div style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)", borderRadius: 16, padding: "20px 16px 12px", border: "1px solid rgba(255,255,255,0.04)", marginBottom: 20 }}>
    <h3 style={{ margin: "0 0 16px 4px", fontSize: 13, fontWeight: 600, color: "#8892b0", textTransform: "uppercase", letterSpacing: 1.2, fontFamily: "monospace" }}>{title}</h3>
    <div style={{ height }}>{children}</div>
  </div>
);

const GradeBar = ({ label, grade, color, percent }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
      <span style={{ fontSize: 13, color: "#c0c0d0", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "monospace" }}>{grade}</span>
    </div>
    <div style={{ height: 8, background: "#0f0f23", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${percent}%`, background: `linear-gradient(90deg,${color},${color}88)`, borderRadius: 4, transition: "width 1s ease" }} />
    </div>
  </div>
);

const InsightCard = ({ icon, title, text, severity }) => {
  const colors = { critical: "#e94560", warning: "#f5a623", good: "#4ecdc4" };
  const bg = { critical: "#e9456010", warning: "#f5a62310", good: "#4ecdc410" };
  return (
    <div style={{ background: bg[severity], border: `1px solid ${colors[severity]}25`, borderRadius: 14, padding: "16px 18px", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: colors[severity] }}>{title}</span>
      </div>
      <p style={{ margin: 0, fontSize: 13, color: "#b0b8d0", lineHeight: 1.65 }}>{text}</p>
    </div>
  );
};

const ActionItem = ({ number, title, text, tag }) => (
  <div style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)", borderRadius: 14, padding: "18px 18px", marginBottom: 14, border: "1px solid rgba(255,255,255,0.04)" }}>
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
      <div style={{ background: "linear-gradient(135deg,#e94560,#c23152)", color: "#fff", minWidth: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, fontFamily: "monospace", marginTop: 1 }}>{number}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#e0e0e0" }}>{title}</span>
          {tag && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: tag === "URGENT" ? "#e9456030" : "#f5a62330", color: tag === "URGENT" ? "#e94560" : "#f5a623", textTransform: "uppercase", letterSpacing: 0.8 }}>{tag}</span>}
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "#8892b0", lineHeight: 1.65 }}>{text}</p>
      </div>
    </div>
  </div>
);

// ─── MAIN ──────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("all");
  const tabs = [
    { id: "all", label: "Overview" },
    { id: "activity", label: "Activity" },
    { id: "sleep", label: "Sleep" },
    { id: "heart", label: "Heart" },
    { id: "coach", label: "Coach Notes" },
    { id: "plan", label: "Action Plan" },
  ];
  const show = (...ids) => ids.includes(tab);
  const { grades, insights, actions, challenge } = coachCommentary;

  return (
    <div style={{ background: "#0f0f23", minHeight: "100vh", color: "#e0e0e0", fontFamily: '"DM Sans",-apple-system,sans-serif', maxWidth: 720, margin: "0 auto" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ padding: "32px 20px 20px", background: "linear-gradient(180deg,#1a1a2e,#0f0f23)" }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2.5, color: "#e94560", fontFamily: '"JetBrains Mono",monospace', fontWeight: 600, marginBottom: 6 }}>Health Intelligence</div>
        <h1 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", background: "linear-gradient(90deg,#fff,#8892b0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>30-Day Dashboard</h1>
        <p style={{ margin: 0, fontSize: 13, color: "#5a6a8a" }}>
          {fmt(META.periodStart)} – {fmt(META.periodEnd)}, 2026 · Week {META.weekNumber} · Updated {META.lastUpdated}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, padding: "0 16px", overflowX: "auto", paddingBottom: 8 }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "8px 14px", borderRadius: 20, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", background: tab === t.id ? "linear-gradient(135deg,#e94560,#c23152)" : "#1a1a2e", color: tab === t.id ? "#fff" : "#5a6a8a", transition: "all 0.2s" }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "12px 16px 40px" }}>

        {/* ═══ SECTION 1 ═══ */}
        {show("all", "activity", "sleep", "heart") && (
          <>
            <SectionTitle number="1" title="Your Data" subtitle="30 days of biometric signals, decoded" />
            {show("all", "activity") && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <StatCard label="Avg Steps" value={stats.stepsAvg.toLocaleString()} unit="/day" color="#4ecdc4" subtext={`${stats.daysOver10k} days hit 10K`} icon="🚶" />
                <StatCard label="Avg Active Cal" value={stats.calAvg} unit="kcal" color="#f5a623" subtext={`Range: ${stats.calMin}–${stats.calMax}`} icon="🔥" />
                <StatCard label="Avg Distance" value={stats.distAvg} unit="km" color="#667eea" subtext={`${stats.daysUnder5k} low days (<5K steps)`} icon="📍" />
                <StatCard label="Days 10K+" value={stats.daysOver10k} unit={`/${stats.totalDays}`} color={stats.daysOver10k >= 15 ? "#4ecdc4" : "#e94560"} subtext={`${Math.round((stats.daysOver10k / stats.totalDays) * 100)}% hit rate`} icon="🎯" />
              </div>
            )}
            {show("all", "heart") && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <StatCard label="Resting HR" value={stats.rhrAvg} unit="bpm" color="#4ecdc4" subtext="Athletic range" icon="💚" />
                <StatCard label="Avg HRV" value={stats.hrvAvg} unit="ms" color="#667eea" subtext="Moderate" icon="📊" />
              </div>
            )}
            {show("all", "sleep") && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <StatCard label="Avg Sleep" value={stats.sleepAvg} unit="hrs" color="#c084fc" subtext="Target: 8h" icon="😴" />
                <StatCard label="Avg Deep" value={stats.deepAvg} unit="hrs" color="#e94560" subtext={stats.deepAvg < 1 ? "⚠️ Below ideal" : "On track"} icon="🌊" />
              </div>
            )}

            {show("all", "activity") && (
              <>
                <ChartCard title="Daily Steps · 30 Days" height={220}>
                  <ResponsiveContainer><BarChart data={stepsData} barCategoryGap="15%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#5a6a8a" }} interval={4} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#5a6a8a" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={10000} stroke="#4ecdc4" strokeDasharray="4 4" strokeWidth={1.5} />
                    <Bar dataKey="steps" radius={[4, 4, 0, 0]}>
                      {stepsData.map((d, i) => <Cell key={i} fill={d.steps >= 10000 ? "#4ecdc4" : d.steps >= 7000 ? "#667eea" : "#e94560"} />)}
                    </Bar>
                  </BarChart></ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Active Calories · 30 Days" height={200}>
                  <ResponsiveContainer><AreaChart data={caloriesData}>
                    <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f5a623" stopOpacity={0.3} /><stop offset="100%" stopColor="#f5a623" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#5a6a8a" }} interval={4} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#5a6a8a" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="cal" stroke="#f5a623" fill="url(#cg)" strokeWidth={2} />
                  </AreaChart></ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Walking + Running Distance (km)" height={200}>
                  <ResponsiveContainer><AreaChart data={distanceData}>
                    <defs><linearGradient id="dg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#667eea" stopOpacity={0.3} /><stop offset="100%" stopColor="#667eea" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#5a6a8a" }} interval={4} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#5a6a8a" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="km" stroke="#667eea" fill="url(#dg)" strokeWidth={2} />
                  </AreaChart></ResponsiveContainer>
                </ChartCard>
              </>
            )}

            {show("all", "sleep") && (
              <ChartCard title="Sleep Stages Breakdown (hours)" height={240}>
                <ResponsiveContainer><BarChart data={sleepStages} barCategoryGap="12%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#5a6a8a" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#5a6a8a" }} axisLine={false} tickLine={false} domain={[0, 12]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "#8892b0" }} />
                  <Bar dataKey="deep" stackId="s" fill="#1a237e" name="Deep" />
                  <Bar dataKey="core" stackId="s" fill="#5c6bc0" name="Core" />
                  <Bar dataKey="rem" stackId="s" fill="#c084fc" name="REM" />
                  <Bar dataKey="awake" stackId="s" fill="#e9456066" name="Awake" radius={[4, 4, 0, 0]} />
                </BarChart></ResponsiveContainer>
              </ChartCard>
            )}

            {show("all", "heart") && (
              <>
                <ChartCard title="Resting Heart Rate (bpm)" height={200}>
                  <ResponsiveContainer><LineChart data={rhrData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#5a6a8a" }} interval={4} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#5a6a8a" }} axisLine={false} tickLine={false} domain={[45, 90]} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={60} stroke="#4ecdc440" strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="rhr" stroke="#4ecdc4" strokeWidth={2.5} dot={{ r: 3, fill: "#4ecdc4" }} />
                  </LineChart></ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Heart Rate Variability – HRV (ms)" height={200}>
                  <ResponsiveContainer><AreaChart data={hrvData}>
                    <defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#667eea" stopOpacity={0.3} /><stop offset="100%" stopColor="#667eea" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#5a6a8a" }} interval={4} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#5a6a8a" }} axisLine={false} tickLine={false} domain={[30, 90]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="hrv" stroke="#667eea" fill="url(#hg)" strokeWidth={2} />
                  </AreaChart></ResponsiveContainer>
                </ChartCard>
              </>
            )}
          </>
        )}

        {/* ═══ SECTION 2 ═══ */}
        {show("all", "coach") && (
          <>
            <SectionTitle number="2" title="Coach Commentary" subtitle="What your data is telling me as your health coach" />
            <div style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)", borderRadius: 16, padding: 20, border: "1px solid rgba(255,255,255,0.04)", marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "#e0e0e0" }}>📋 Health Report Card – Week {coachCommentary.weekNumber}</h3>
              {Object.entries(grades).map(([key, g]) => (
                <GradeBar key={key} label={key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())} grade={g.grade} color={g.color} percent={g.percent} />
              ))}
            </div>
            {insights.map((ins, i) => <InsightCard key={i} {...ins} />)}
          </>
        )}

        {/* ═══ SECTION 3 ═══ */}
        {show("all", "plan") && (
          <>
            <SectionTitle number="3" title="Action Plan" subtitle="What needs immediate attention, ranked by impact" />
            <div style={{ background: "#e9456015", border: "1px solid #e9456030", borderRadius: 14, padding: "14px 16px", marginBottom: 20 }}>
              <p style={{ margin: 0, fontSize: 13, color: "#e94560", fontWeight: 600 }}>🚨 Highest Priority: Deep Sleep + Bedtime Consistency</p>
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "#b0b8d0", lineHeight: 1.6 }}>These two issues compound each other. Fixing bedtime consistency alone should improve deep sleep by 30-50%.</p>
            </div>
            {actions.map((a) => <ActionItem key={a.number} {...a} />)}

            <div style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)", borderRadius: 16, padding: 20, border: "1px solid #4ecdc430", marginTop: 24 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800, color: "#4ecdc4" }}>🏆 {challenge.title}</h3>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: "#8892b0", lineHeight: 1.6 }}>Commit to these non-negotiables for 14 days. If deep sleep hasn't improved by 50%, come back and we'll adjust.</p>
              <div style={{ display: "grid", gap: 8 }}>
                {challenge.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#0f0f23", borderRadius: 10, border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, border: "2px solid #4ecdc4", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "#c0c0d0" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <p style={{ marginTop: 24, fontSize: 11, color: "#3a4a6a", lineHeight: 1.6, textAlign: "center" }}>
              This dashboard provides general wellness guidance based on Apple Health data. It is not a substitute for professional medical advice.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
