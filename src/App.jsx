import { useState, useEffect } from "react";

export default function App() {
  const [goal, setGoal] = useState(75);
  const [theme, setTheme] = useState("dark");

  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState("");
  const [activeId, setActiveId] = useState(null);

  /* ---------- LOAD / SAVE ---------- */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("subjects_v1"));
    if (saved) setSubjects(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("subjects_v1", JSON.stringify(subjects));
  }, [subjects]);

  const activeSubject = subjects.find(s => s.id === activeId);

  const total = activeSubject?.total ?? 0;
  const attended = activeSubject?.attended ?? 0;

  /* ---------- CALCULATIONS ---------- */
  const percentage =
    total > 0 ? ((attended / total) * 100).toFixed(1) : 0;

  let bunksLeft = 0;
  let recover = 0;

  if (total > 0) {
    if (percentage >= goal) {
      bunksLeft = Math.floor((attended * 100) / goal - total);
    } else {
      let t = total;
      let a = attended;
      while ((a / t) * 100 < goal) {
        t++;
        a++;
        recover++;
      }
    }
  }

  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const forecast = Array.from({ length: 5 }, (_, i) => {
    const nt = total + i + 1;
    const na = attended + i + 1;
    return {
      classes: i + 1,
      percent: nt > 0 ? ((na / nt) * 100).toFixed(1) : 0,
    };
  });

  /* ---------- MUTATIONS ---------- */
  const updateSubject = (type, delta) => {
    if (!activeSubject) return;

    setSubjects(prev =>
      prev.map(s => {
        if (s.id !== activeId) return s;

        let t = s.total;
        let a = s.attended;

        if (type === "total") {
          t = Math.max(0, t + delta);
          a = Math.min(a, t);
        }

        if (type === "attended") {
          a = Math.max(0, Math.min(t, a + delta));
        }

        return { ...s, total: t, attended: a };
      })
    );
  };

  const addSubject = () => {
    if (!newSubject.trim()) return;
    setSubjects(prev => [
      ...prev,
      { id: Date.now(), name: newSubject, total: 0, attended: 0 },
    ]);
    setNewSubject("");
  };

  const deleteSubject = (id) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    if (id === activeId) setActiveId(null);
  };

  const isDark = theme === "dark";

  /* ---------- UI ---------- */
  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-300 ${
        isDark ? "bg-black text-white" : "bg-white text-zinc-900"
      }`}
    >
      {/* THEME TOGGLE */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={`px-4 py-2 rounded-xl text-sm transition-all duration-150
            hover:scale-105 active:scale-95 ${
              isDark
                ? "bg-zinc-800 text-white"
                : "bg-zinc-200 text-zinc-900"
            }`}
        >
          {isDark ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>

      <h1 className="text-2xl font-semibold text-center mb-10">
        Attendance
      </h1>

      {/* DASHBOARD */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT */}
        <div className={`rounded-2xl p-6 space-y-5 transition-opacity duration-300 ${
          isDark ? "bg-zinc-900" : "bg-zinc-100"
        }`}>
          <h2 className="text-xs uppercase opacity-60">
            Attendance Input
          </h2>

          <div className={`flex justify-between items-center rounded-xl px-4 py-3 ${
            isDark ? "bg-zinc-800" : "bg-white"
          }`}>
            <span>Required %</span>
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
              className={`w-20 text-center rounded px-2 py-1 outline-none ${
                isDark
                  ? "bg-zinc-700 text-white"
                  : "bg-zinc-200 text-zinc-900"
              }`}
            />
          </div>

          {[
            { label: "Total Classes", value: total, type: "total" },
            { label: "Attended", value: attended, type: "attended" },
          ].map(({ label, value, type }) => (
            <div
              key={label}
              className={`flex justify-between rounded-xl px-4 py-3 ${
                isDark ? "bg-zinc-800" : "bg-white"
              }`}
            >
              <span>{label}</span>
              <div className="flex items-center gap-3">
                <button
                  disabled={!activeSubject}
                  onClick={() => updateSubject(type, -1)}
                  className="w-7 h-7 bg-zinc-700 rounded
                             transition-all duration-150
                             hover:scale-105 active:scale-95
                             disabled:opacity-40"
                >−</button>
                <span className="w-6 text-center">{value}</span>
                <button
                  disabled={!activeSubject}
                  onClick={() => updateSubject(type, 1)}
                  className="w-7 h-7 bg-zinc-700 rounded
                             transition-all duration-150
                             hover:scale-105 active:scale-95
                             disabled:opacity-40"
                >+</button>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT */}
        <div className={`rounded-2xl p-6 flex justify-between items-center ${
          isDark ? "bg-zinc-900" : "bg-zinc-100"
        }`}>
          <div>
            <p className="text-xs opacity-60">Current Status</p>
            <p className={`text-2xl font-bold ${
              percentage >= goal
                ? "text-green-400"
                : percentage >= goal - 15
                ? "text-yellow-400"
                : "text-red-400"
            }`}>
              {percentage >= goal
                ? "You're safe for now 😌"
                : percentage >= goal - 15
                ? "Careful now 😬"
                : "You're below the limit 🚨"}
            </p>
            <p className="text-sm opacity-70">
              {percentage >= goal ? (
                bunksLeft === 1
                  ? "You can miss 1 more class "
                  : `You can miss ${bunksLeft} more classes`
              ) : percentage >= goal - 15 ? (
                `Missing ${recover} more classes will put you at risk`
              ) : (
                `Attend the next ${recover} classes to recover`
              )}
            </p>
          </div>

          <svg width="120" height="120">
            <circle cx="60" cy="60" r={radius} stroke="#27272a" strokeWidth="10" fill="none" />
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke={percentage >= goal ? "#22c55e" : percentage >= goal - 15 ? "#eab308" : "#ef4444"}
              strokeWidth="10"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
            <text
              x="50%"
              y="50%"
              dy=".35em"
              textAnchor="middle"
              fontSize="18"
              fill={isDark ? "white" : "#18181b"}
              fontWeight="600"
            >
              {percentage}%
            </text>
          </svg>
        </div>
      </div>

      {/* FORECAST */}
      <div className={`max-w-6xl mx-auto mt-8 rounded-2xl p-6 ${
        isDark ? "bg-zinc-900" : "bg-zinc-100"
      }`}>
        <h2 className="text-xs uppercase opacity-60 mb-4">Forecast</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {forecast.map(f => (
            <div
              key={f.classes}
              className={`rounded-xl p-4 text-center
                          transition-all duration-200
                          hover:scale-105 ${
                isDark
                  ? "bg-zinc-800 text-white"
                  : "bg-white text-zinc-900 border border-zinc-200"
              }`}
            >
              <p className="text-xs opacity-60">+{f.classes}</p>
              <p className="text-lg font-semibold text-green-400">
                {f.percent}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* SUBJECTS */}
      <div className="max-w-6xl mx-auto mt-12">
        <h2 className="text-lg font-semibold mb-4">Subjects</h2>

        <div className="flex gap-3 mb-6">
          <input
            value={newSubject}
            onChange={e => setNewSubject(e.target.value)}
            placeholder="Enter subject name"
            className={`flex-1 rounded-xl px-4 py-3 outline-none ${
              isDark
                ? "bg-zinc-800 text-white"
                : "bg-white text-zinc-900 border border-zinc-300"
            }`}
          />
          <button
            onClick={addSubject}
            className="bg-zinc-700 px-5 rounded-xl
                       transition-all duration-150
                       hover:scale-105 active:scale-95"
          >
            Add
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {subjects.map(s => (
            <div
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className={`rounded-xl p-4 cursor-pointer
                          transition-all duration-200
                          hover:-translate-y-1 hover:shadow-xl ${
                isDark
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-900 border border-zinc-200"
              } ${
                activeId === s.id ? "ring-2 ring-green-400" : ""
              }`}
            >
              <div className="flex justify-between items-center">
                <p className="font-semibold">{s.name}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSubject(s.id);
                  }}
                  className="text-red-400 text-sm
                             transition-transform
                             hover:scale-110"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm opacity-60">
                {s.total > 0
                  ? ((s.attended / s.total) * 100).toFixed(1) + "%"
                  : "No data"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-xs opacity-40 mt-10">
        Built for focus, not fear.
      </p>
    </div>
  );
}
